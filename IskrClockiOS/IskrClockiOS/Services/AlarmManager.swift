//
//  AlarmManager.swift
//  IskrClockiOS
//

import Foundation
import Combine
import SwiftUI

class AlarmManager: ObservableObject {
    static let shared = AlarmManager()

    @Published var alarm: Alarm
    @Published var currentTime = Date()
    @Published var isAlarmTriggered = false

    private var timer: Timer?
    private var cancellables = Set<AnyCancellable>()

    private init() {
        // Load saved alarm or create default
        if let savedAlarm = UserDefaults.standard.data(forKey: "alarm"),
           let decodedAlarm = try? JSONDecoder().decode(Alarm.self, from: savedAlarm) {
            self.alarm = decodedAlarm
        } else {
            self.alarm = Alarm()
        }

        startClockTimer()
    }

    func startClockTimer() {
        timer = Timer.scheduledTimer(withTimeInterval: 1.0, repeats: true) { [weak self] _ in
            guard let self = self else { return }
            self.currentTime = Date()
            self.checkAlarm()
        }
    }

    func toggleAlarm() {
        alarm.isEnabled.toggle()

        if alarm.isEnabled {
            alarm.snoozeCount = 0
            alarm.alarmDate = alarm.calculateNextAlarmDate()
            scheduleNotification()
        } else {
            isAlarmTriggered = false
            cancelNotification()
            AudioPlayer.shared.stop()
        }

        saveAlarm()
    }

    func setAlarmTime(hour: Int, minute: Int) {
        alarm.hour = hour
        alarm.minute = minute

        if alarm.isEnabled {
            alarm.alarmDate = alarm.calculateNextAlarmDate()
            scheduleNotification()
        }

        saveAlarm()
    }

    func setSnoozeDuration(_ duration: Int) {
        alarm.snoozeDuration = duration
        saveAlarm()
    }

    func setVolumeFadeIn(_ enabled: Bool) {
        alarm.volumeFadeIn = enabled
        saveAlarm()
    }

    func setSelectedStation(_ stationId: String) {
        alarm.selectedStation = stationId
        saveAlarm()
    }

    func snooze() {
        guard isAlarmTriggered else { return }

        alarm.snoozeCount += 1
        isAlarmTriggered = false
        AudioPlayer.shared.stop()

        // Schedule alarm for snooze duration
        let calendar = Calendar.current
        if let snoozeDate = calendar.date(byAdding: .minute, value: alarm.snoozeDuration, to: Date()) {
            alarm.alarmDate = snoozeDate
            scheduleNotification()
        }

        saveAlarm()
    }

    func stopAlarm() {
        isAlarmTriggered = false
        alarm.isEnabled = false
        alarm.snoozeCount = 0
        AudioPlayer.shared.stop()
        cancelNotification()
        saveAlarm()
    }

    private func checkAlarm() {
        guard alarm.isEnabled, !isAlarmTriggered else { return }

        let calendar = Calendar.current
        let now = Date()
        let currentHour = calendar.component(.hour, from: now)
        let currentMinute = calendar.component(.minute, from: now)
        let currentSecond = calendar.component(.second, from: now)

        // Trigger at exact minute (within first second)
        if currentHour == alarm.hour && currentMinute == alarm.minute && currentSecond == 0 {
            triggerAlarm()
        }
    }

    private func triggerAlarm() {
        isAlarmTriggered = true

        // Play alarm sound
        AudioPlayer.shared.playAlarm(
            stationId: alarm.selectedStation,
            fadeIn: alarm.volumeFadeIn
        )

        // Send local notification
        NotificationManager.shared.sendAlarmNotification()
    }

    private func scheduleNotification() {
        guard let alarmDate = alarm.alarmDate else { return }
        NotificationManager.shared.scheduleAlarmNotification(at: alarmDate)
    }

    private func cancelNotification() {
        NotificationManager.shared.cancelAllNotifications()
    }

    private func saveAlarm() {
        if let encoded = try? JSONEncoder().encode(alarm) {
            UserDefaults.standard.set(encoded, forKey: "alarm")
        }
    }
}
