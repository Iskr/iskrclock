//
//  TimerManager.swift
//  IskrClockiOS
//

import Foundation
import Combine

class TimerManager: ObservableObject {
    @Published var timerState = TimerState()
    private var timer: Timer?

    func start() {
        timerState.start()
        timer = Timer.scheduledTimer(withTimeInterval: 1.0, repeats: true) { [weak self] _ in
            self?.timerState.tick()
            if self?.timerState.remainingSeconds == 0 {
                self?.timerCompleted()
            }
        }
    }

    func pause() {
        timerState.pause()
        timer?.invalidate()
    }

    func resume() {
        timerState.resume()
        timer = Timer.scheduledTimer(withTimeInterval: 1.0, repeats: true) { [weak self] _ in
            self?.timerState.tick()
            if self?.timerState.remainingSeconds == 0 {
                self?.timerCompleted()
            }
        }
    }

    func reset() {
        timer?.invalidate()
        timerState.reset()
    }

    private func timerCompleted() {
        timer?.invalidate()
        timerState.isRunning = false

        // Play notification sound
        AudioPlayer.shared.playClassicAlarm()

        // Send notification
        NotificationManager.shared.sendAlarmNotification()
    }
}

class StopwatchManager: ObservableObject {
    @Published var stopwatchState = StopwatchState()
    private var timer: Timer?

    func start() {
        stopwatchState.start()
        timer = Timer.scheduledTimer(withTimeInterval: 0.01, repeats: true) { [weak self] _ in
            self?.stopwatchState.update()
        }
    }

    func pause() {
        stopwatchState.pause()
        timer?.invalidate()
    }

    func resume() {
        stopwatchState.resume()
        timer = Timer.scheduledTimer(withTimeInterval: 0.01, repeats: true) { [weak self] _ in
            self?.stopwatchState.update()
        }
    }

    func reset() {
        timer?.invalidate()
        stopwatchState.reset()
    }

    func lap() {
        stopwatchState.lap()
    }
}
