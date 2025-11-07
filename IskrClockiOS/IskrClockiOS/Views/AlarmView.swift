//
//  AlarmView.swift
//  IskrClockiOS
//

import SwiftUI

struct AlarmView: View {
    @EnvironmentObject var alarmManager: AlarmManager
    @EnvironmentObject var audioPlayer: AudioPlayer
    @EnvironmentObject var localization: LocalizationManager

    @State private var selectedHour = 7
    @State private var selectedMinute = 0
    @State private var snoozeDuration = 5

    var body: some View {
        ZStack {
            // Animated background
            AnimatedBackgroundView()

            // Main content
            ScrollView {
                VStack(spacing: 25) {
                    // Header
                    HStack {
                        Text(localization.t("app_title"))
                            .font(.system(size: 28, weight: .bold))
                            .foregroundColor(.white)

                        Text(localization.t("version"))
                            .font(.system(size: 14))
                            .foregroundColor(.white.opacity(0.7))

                        Spacer()

                        // Language toggle
                        Button(action: {
                            localization.toggleLanguage()
                        }) {
                            Text(localization.currentLanguage.flag)
                                .font(.system(size: 24))
                        }
                    }
                    .padding(.horizontal)
                    .padding(.top, 20)

                    // Current time display
                    VStack(spacing: 8) {
                        Text(timeString(from: alarmManager.currentTime))
                            .font(.system(size: 64, weight: .bold, design: .rounded))
                            .foregroundColor(.white)

                        Text(dateString(from: alarmManager.currentTime))
                            .font(.system(size: 18))
                            .foregroundColor(.white.opacity(0.8))
                    }
                    .padding(.vertical, 20)

                    // Alarm settings card
                    VStack(spacing: 20) {
                        // Alarm time picker
                        VStack(alignment: .leading, spacing: 10) {
                            Text(localization.t("alarm_time"))
                                .font(.headline)
                                .foregroundColor(.white)

                            HStack(spacing: 15) {
                                // Hour picker
                                Picker("Hour", selection: $selectedHour) {
                                    ForEach(0..<24, id: \.self) { hour in
                                        Text(String(format: "%02d", hour))
                                            .foregroundColor(.white)
                                    }
                                }
                                .pickerStyle(.wheel)
                                .frame(width: 80, height: 120)
                                .clipped()
                                .onChange(of: selectedHour) { newValue in
                                    alarmManager.setAlarmTime(hour: newValue, minute: selectedMinute)
                                }

                                Text(":")
                                    .font(.system(size: 32, weight: .bold))
                                    .foregroundColor(.white)

                                // Minute picker
                                Picker("Minute", selection: $selectedMinute) {
                                    ForEach(0..<60, id: \.self) { minute in
                                        Text(String(format: "%02d", minute))
                                            .foregroundColor(.white)
                                    }
                                }
                                .pickerStyle(.wheel)
                                .frame(width: 80, height: 120)
                                .clipped()
                                .onChange(of: selectedMinute) { newValue in
                                    alarmManager.setAlarmTime(hour: selectedHour, minute: newValue)
                                }
                            }
                            .frame(maxWidth: .infinity)
                        }

                        Divider()
                            .background(Color.white.opacity(0.3))

                        // Snooze duration
                        VStack(alignment: .leading, spacing: 10) {
                            Text(localization.t("snooze_duration"))
                                .font(.headline)
                                .foregroundColor(.white)

                            HStack {
                                TextField("5", value: $snoozeDuration, format: .number)
                                    .keyboardType(.numberPad)
                                    .textFieldStyle(RoundedBorderTextFieldStyle())
                                    .frame(width: 60)
                                    .onChange(of: snoozeDuration) { newValue in
                                        alarmManager.setSnoozeDuration(newValue)
                                    }

                                Text(localization.t("minutes"))
                                    .foregroundColor(.white.opacity(0.8))

                                Spacer()
                            }
                        }

                        Divider()
                            .background(Color.white.opacity(0.3))

                        // Radio station selector
                        VStack(alignment: .leading, spacing: 10) {
                            Text(localization.t("radio_station"))
                                .font(.headline)
                                .foregroundColor(.white)

                            StationPicker()
                        }

                        // Volume fade-in toggle
                        Toggle(localization.t("volume_fade_in"), isOn: Binding(
                            get: { alarmManager.alarm.volumeFadeIn },
                            set: { alarmManager.setVolumeFadeIn($0) }
                        ))
                        .foregroundColor(.white)
                        .toggleStyle(SwitchToggleStyle(tint: .blue))

                        // Play/Stop button
                        HStack {
                            Button(action: {
                                if audioPlayer.isPlaying {
                                    audioPlayer.stop()
                                } else {
                                    let allStations = RadioStation.builtInStations + (audioPlayer as? CustomStationsManager)?.customStations ?? []
                                    if let station = allStations.first(where: { $0.id == alarmManager.alarm.selectedStation }) {
                                        audioPlayer.play(station: station, fadeIn: false)
                                    }
                                }
                            }) {
                                HStack {
                                    Image(systemName: audioPlayer.isPlaying ? "pause.fill" : "play.fill")
                                    Text(audioPlayer.isPlaying ? localization.t("stop") : localization.t("play"))
                                }
                                .frame(maxWidth: .infinity)
                                .padding()
                                .background(Color.blue.opacity(0.8))
                                .foregroundColor(.white)
                                .cornerRadius(12)
                            }
                        }

                        // Toggle alarm button
                        Button(action: {
                            alarmManager.toggleAlarm()
                        }) {
                            Text(alarmManager.alarm.isEnabled ? localization.t("disable_alarm") : localization.t("toggle_alarm"))
                                .font(.system(size: 18, weight: .bold))
                                .frame(maxWidth: .infinity)
                                .padding()
                                .background(alarmManager.alarm.isEnabled ? Color.red : Color.green)
                                .foregroundColor(.white)
                                .cornerRadius(12)
                        }

                        // Remaining time
                        if alarmManager.alarm.isEnabled {
                            Text("\(localization.t("alarm_in")) \(alarmManager.alarm.timeRemaining())")
                                .font(.system(size: 16))
                                .foregroundColor(.white.opacity(0.9))
                                .padding(.top, 10)
                        }
                    }
                    .padding(20)
                    .background(Color.black.opacity(0.3))
                    .cornerRadius(20)
                    .padding(.horizontal)

                    Spacer(minLength: 40)
                }
            }

            // Alarm modal
            if alarmManager.isAlarmTriggered {
                AlarmModal()
            }
        }
        .onAppear {
            selectedHour = alarmManager.alarm.hour
            selectedMinute = alarmManager.alarm.minute
            snoozeDuration = alarmManager.alarm.snoozeDuration
        }
    }

    private func timeString(from date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "HH:mm"
        return formatter.string(from: date)
    }

    private func dateString(from date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = localization.currentLanguage == .russian ? "d MMMM yyyy" : "MMMM d, yyyy"
        formatter.locale = Locale(identifier: localization.currentLanguage == .russian ? "ru_RU" : "en_US")
        return formatter.string(from: date)
    }
}

struct StationPicker: View {
    @EnvironmentObject var alarmManager: AlarmManager
    @StateObject private var customStationsManager = CustomStationsManager()

    var body: some View {
        let allStations = RadioStation.builtInStations + customStationsManager.customStations

        Menu {
            ForEach(allStations) { station in
                Button(action: {
                    alarmManager.setSelectedStation(station.id)
                }) {
                    HStack {
                        Text("\(station.icon) \(station.name)")
                        if station.id == alarmManager.alarm.selectedStation {
                            Image(systemName: "checkmark")
                        }
                    }
                }
            }
        } label: {
            HStack {
                if let station = allStations.first(where: { $0.id == alarmManager.alarm.selectedStation }) {
                    Text("\(station.icon) \(station.name)")
                        .foregroundColor(.white)
                } else {
                    Text("Select station")
                        .foregroundColor(.white.opacity(0.6))
                }
                Spacer()
                Image(systemName: "chevron.down")
                    .foregroundColor(.white.opacity(0.6))
            }
            .padding()
            .background(Color.white.opacity(0.1))
            .cornerRadius(10)
        }
    }
}

struct AlarmModal: View {
    @EnvironmentObject var alarmManager: AlarmManager
    @EnvironmentObject var localization: LocalizationManager

    var body: some View {
        ZStack {
            Color.black.opacity(0.8)
                .ignoresSafeArea()

            VStack(spacing: 30) {
                Text(localization.t("alarm_modal_title"))
                    .font(.system(size: 48, weight: .bold))
                    .foregroundColor(.white)

                Text(timeString(from: Date()))
                    .font(.system(size: 36, weight: .medium))
                    .foregroundColor(.white)

                VStack(spacing: 15) {
                    Button(action: {
                        alarmManager.stopAlarm()
                    }) {
                        Text(localization.t("turn_off"))
                            .font(.system(size: 20, weight: .bold))
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color.red)
                            .foregroundColor(.white)
                            .cornerRadius(12)
                    }

                    Button(action: {
                        alarmManager.snooze()
                    }) {
                        Text(localization.t("snooze"))
                            .font(.system(size: 20, weight: .bold))
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color.orange)
                            .foregroundColor(.white)
                            .cornerRadius(12)
                    }
                }
                .padding(.horizontal, 40)
            }
            .padding()
        }
    }

    private func timeString(from date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "HH:mm"
        return formatter.string(from: date)
    }
}
