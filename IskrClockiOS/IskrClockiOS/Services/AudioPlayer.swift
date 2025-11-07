//
//  AudioPlayer.swift
//  IskrClockiOS
//

import Foundation
import AVFoundation
import Combine

class AudioPlayer: NSObject, ObservableObject {
    static let shared = AudioPlayer()

    @Published var isPlaying = false
    @Published var currentStation: RadioStation?
    @Published var volume: Float = 0.5

    private var audioPlayer: AVPlayer?
    private var fadeTimer: Timer?
    private var monitoringTimer: Timer?
    private var lastPlaybackTime: CMTime?
    private var stuckCounter = 0

    private override init() {
        super.init()
    }

    func playAlarm(stationId: String, fadeIn: Bool = true) {
        // Find station
        let allStations = RadioStation.builtInStations + loadCustomStations()
        guard let station = allStations.first(where: { $0.id == stationId }) else {
            playClassicAlarm()
            return
        }

        currentStation = station
        play(station: station, fadeIn: fadeIn)
    }

    func play(station: RadioStation, fadeIn: Bool = false) {
        stop()
        currentStation = station

        switch station.type {
        case .classic:
            playClassicAlarm()
        case .radio:
            playRadioStream(url: station.url ?? "", fadeIn: fadeIn)
        case .youtube:
            // Note: YouTube playback on iOS requires different approach
            // For now, play classic alarm as fallback
            playClassicAlarm()
        case .local:
            playLocalFile(stationId: station.id, fadeIn: fadeIn)
        }

        isPlaying = true
        startMonitoring()
    }

    func stop() {
        fadeTimer?.invalidate()
        monitoringTimer?.invalidate()
        audioPlayer?.pause()
        audioPlayer = nil
        isPlaying = false
        lastPlaybackTime = nil
        stuckCounter = 0
    }

    private func playRadioStream(url: String, fadeIn: Bool) {
        guard let streamURL = URL(string: url) else {
            playClassicAlarm()
            return
        }

        let playerItem = AVPlayerItem(url: streamURL)
        audioPlayer = AVPlayer(playerItem: playerItem)

        // Set initial volume
        if fadeIn {
            audioPlayer?.volume = 0.0
            startFadeIn()
        } else {
            audioPlayer?.volume = volume
        }

        audioPlayer?.play()

        // Add observer for playback issues
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(playerItemDidFailToPlayToEnd),
            name: .AVPlayerItemFailedToPlayToEndTime,
            object: playerItem
        )
    }

    private func playLocalFile(stationId: String, fadeIn: Bool) {
        // Load from UserDefaults or local storage
        // For now, fallback to classic alarm
        playClassicAlarm()
    }

    private func playClassicAlarm() {
        // Generate beep tones using AVAudioEngine
        generateBeepTones()
    }

    private func generateBeepTones() {
        let audioEngine = AVAudioEngine()
        let mainMixer = audioEngine.mainMixerNode
        let output = audioEngine.outputNode
        let outputFormat = output.inputFormat(forBus: 0)

        let playerNode = AVAudioPlayerNode()
        audioEngine.attach(playerNode)

        audioEngine.connect(playerNode, to: mainMixer, format: outputFormat)
        audioEngine.connect(mainMixer, to: output, format: outputFormat)

        // Generate beep buffer
        let beepBuffer = generateBeepBuffer(
            sampleRate: outputFormat.sampleRate,
            duration: 0.3,
            frequency: 440.0
        )

        do {
            try audioEngine.start()
            playerNode.play()

            // Play beeps in a loop
            playerNode.scheduleBuffer(beepBuffer, at: nil, options: .loops)
        } catch {
            print("Audio engine failed to start: \(error)")
        }
    }

    private func generateBeepBuffer(sampleRate: Double, duration: Double, frequency: Double) -> AVAudioPCMBuffer {
        let frameCount = UInt32(sampleRate * duration)
        let buffer = AVAudioPCMBuffer(pcmFormat: AVAudioFormat(standardFormatWithSampleRate: sampleRate, channels: 2)!, frameCapacity: frameCount)!
        buffer.frameLength = frameCount

        let channelCount = Int(buffer.format.channelCount)
        let amplitude: Float = 0.5

        for frame in 0..<Int(frameCount) {
            let value = Float(sin(2.0 * .pi * frequency * Double(frame) / sampleRate)) * amplitude
            for channel in 0..<channelCount {
                buffer.floatChannelData?[channel][frame] = value
            }
        }

        return buffer
    }

    private func startFadeIn() {
        var currentVolume: Float = 0.0
        let targetVolume: Float = volume
        let fadeDuration: TimeInterval = 30.0 // 30 seconds
        let steps: Float = 60 // 60 steps
        let increment = targetVolume / steps
        let interval = fadeDuration / Double(steps)

        fadeTimer = Timer.scheduledTimer(withTimeInterval: interval, repeats: true) { [weak self] timer in
            guard let self = self else {
                timer.invalidate()
                return
            }

            currentVolume += increment
            if currentVolume >= targetVolume {
                currentVolume = targetVolume
                timer.invalidate()
            }

            self.audioPlayer?.volume = currentVolume
        }
    }

    private func startMonitoring() {
        monitoringTimer = Timer.scheduledTimer(withTimeInterval: 3.0, repeats: true) { [weak self] _ in
            self?.checkPlaybackHealth()
        }
    }

    private func checkPlaybackHealth() {
        guard let player = audioPlayer,
              let currentItem = player.currentItem else {
            return
        }

        let currentTime = currentItem.currentTime()

        // Check if playback is stuck
        if let lastTime = lastPlaybackTime {
            if currentTime == lastTime && player.rate > 0 {
                stuckCounter += 1
                if stuckCounter >= 3 { // Stuck for 9 seconds
                    failover()
                }
            } else {
                stuckCounter = 0
            }
        }

        lastPlaybackTime = currentTime

        // Check for errors
        if currentItem.status == .failed {
            failover()
        }
    }

    private func failover() {
        print("Stream failed, switching to classic alarm")
        stop()
        playClassicAlarm()
    }

    @objc private func playerItemDidFailToPlayToEnd(_ notification: Notification) {
        failover()
    }

    private func loadCustomStations() -> [RadioStation] {
        guard let data = UserDefaults.standard.data(forKey: "customStations"),
              let stations = try? JSONDecoder().decode([RadioStation].self, from: data) else {
            return []
        }
        return stations
    }
}
