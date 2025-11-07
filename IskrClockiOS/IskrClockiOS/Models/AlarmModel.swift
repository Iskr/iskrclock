//
//  AlarmModel.swift
//  IskrClockiOS
//

import Foundation

struct Alarm: Identifiable, Codable {
    let id: UUID
    var hour: Int
    var minute: Int
    var isEnabled: Bool
    var snoozeDuration: Int // in minutes
    var snoozeCount: Int
    var volumeFadeIn: Bool
    var selectedStation: String
    var alarmDate: Date?

    init(hour: Int = 7, minute: Int = 0, isEnabled: Bool = false, snoozeDuration: Int = 5, snoozeCount: Int = 0, volumeFadeIn: Bool = true, selectedStation: String = "classic") {
        self.id = UUID()
        self.hour = hour
        self.minute = minute
        self.isEnabled = isEnabled
        self.snoozeDuration = snoozeDuration
        self.snoozeCount = snoozeCount
        self.volumeFadeIn = volumeFadeIn
        self.selectedStation = selectedStation
        self.alarmDate = nil
    }

    var timeString: String {
        String(format: "%02d:%02d", hour, minute)
    }

    func calculateNextAlarmDate() -> Date {
        let calendar = Calendar.current
        let now = Date()

        var components = calendar.dateComponents([.year, .month, .day], from: now)
        components.hour = hour
        components.minute = minute
        components.second = 0

        guard var alarmDate = calendar.date(from: components) else {
            return now
        }

        // If alarm time has passed today, schedule for tomorrow
        if alarmDate <= now {
            alarmDate = calendar.date(byAdding: .day, value: 1, to: alarmDate) ?? alarmDate
        }

        return alarmDate
    }

    func timeRemaining() -> String {
        guard isEnabled else { return "" }

        let alarmDate = calculateNextAlarmDate()
        let now = Date()
        let interval = alarmDate.timeIntervalSince(now)

        if interval < 0 { return "" }

        let hours = Int(interval) / 3600
        let minutes = (Int(interval) % 3600) / 60

        if hours > 0 {
            return String(format: "%dh %dm", hours, minutes)
        } else {
            return String(format: "%dm", minutes)
        }
    }
}
