//
//  TimerModel.swift
//  IskrClockiOS
//

import Foundation

struct TimerState {
    var hours: Int = 0
    var minutes: Int = 0
    var seconds: Int = 0
    var isRunning: Bool = false
    var isPaused: Bool = false
    var remainingSeconds: Int = 0
    var totalSeconds: Int = 0

    var timeString: String {
        let h = remainingSeconds / 3600
        let m = (remainingSeconds % 3600) / 60
        let s = remainingSeconds % 60
        return String(format: "%02d:%02d:%02d", h, m, s)
    }

    mutating func setTime(hours: Int, minutes: Int, seconds: Int) {
        self.hours = hours
        self.minutes = minutes
        self.seconds = seconds
        self.totalSeconds = hours * 3600 + minutes * 60 + seconds
        self.remainingSeconds = totalSeconds
    }

    mutating func start() {
        if !isRunning {
            totalSeconds = hours * 3600 + minutes * 60 + seconds
            remainingSeconds = totalSeconds
        }
        isRunning = true
        isPaused = false
    }

    mutating func pause() {
        isPaused = true
    }

    mutating func resume() {
        isPaused = false
    }

    mutating func reset() {
        isRunning = false
        isPaused = false
        remainingSeconds = 0
        totalSeconds = 0
        hours = 0
        minutes = 0
        seconds = 0
    }

    mutating func tick() {
        if isRunning && !isPaused && remainingSeconds > 0 {
            remainingSeconds -= 1
        }
    }
}

struct StopwatchState {
    var elapsedTime: TimeInterval = 0
    var isRunning: Bool = false
    var isPaused: Bool = false
    var laps: [TimeInterval] = []
    var startTime: Date?
    var pausedTime: TimeInterval = 0

    var timeString: String {
        let totalMilliseconds = Int(elapsedTime * 1000)
        let hours = totalMilliseconds / 3600000
        let minutes = (totalMilliseconds % 3600000) / 60000
        let seconds = (totalMilliseconds % 60000) / 1000
        let milliseconds = (totalMilliseconds % 1000) / 10

        return String(format: "%02d:%02d:%02d.%02d", hours, minutes, seconds, milliseconds)
    }

    mutating func start() {
        isRunning = true
        isPaused = false
        startTime = Date()
        pausedTime = elapsedTime
    }

    mutating func pause() {
        isPaused = true
        isRunning = false
    }

    mutating func resume() {
        isRunning = true
        isPaused = false
        startTime = Date()
        pausedTime = elapsedTime
    }

    mutating func reset() {
        elapsedTime = 0
        isRunning = false
        isPaused = false
        laps = []
        startTime = nil
        pausedTime = 0
    }

    mutating func lap() {
        laps.append(elapsedTime)
    }

    mutating func update() {
        if isRunning, let start = startTime {
            elapsedTime = pausedTime + Date().timeIntervalSince(start)
        }
    }

    func lapString(index: Int) -> String {
        guard index < laps.count else { return "" }
        let lapTime = laps[index]
        let totalMilliseconds = Int(lapTime * 1000)
        let hours = totalMilliseconds / 3600000
        let minutes = (totalMilliseconds % 3600000) / 60000
        let seconds = (totalMilliseconds % 60000) / 1000
        let milliseconds = (totalMilliseconds % 1000) / 10

        return String(format: "%02d:%02d:%02d.%02d", hours, minutes, seconds, milliseconds)
    }
}
