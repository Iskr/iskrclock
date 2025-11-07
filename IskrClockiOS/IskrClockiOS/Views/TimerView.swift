//
//  TimerView.swift
//  IskrClockiOS
//

import SwiftUI

struct TimerView: View {
    @StateObject private var timerManager = TimerManager()
    @EnvironmentObject var localization: LocalizationManager

    @State private var hours = 0
    @State private var minutes = 0
    @State private var seconds = 0

    var body: some View {
        ZStack {
            AnimatedBackgroundView()

            VStack(spacing: 30) {
                // Header
                HStack {
                    Text(localization.t("timer_title"))
                        .font(.system(size: 32, weight: .bold))
                        .foregroundColor(.white)

                    Spacer()

                    Button(action: {
                        localization.toggleLanguage()
                    }) {
                        Text(localization.currentLanguage.flag)
                            .font(.system(size: 24))
                    }
                }
                .padding(.horizontal)
                .padding(.top, 20)

                Spacer()

                // Timer display
                if timerManager.timerState.isRunning || timerManager.timerState.isPaused {
                    Text(timerManager.timerState.timeString)
                        .font(.system(size: 72, weight: .bold, design: .rounded))
                        .foregroundColor(.white)
                        .padding()
                } else {
                    // Time input
                    VStack(spacing: 20) {
                        Text(localization.t("set_timer"))
                            .font(.headline)
                            .foregroundColor(.white)

                        HStack(spacing: 20) {
                            // Hours
                            VStack {
                                Text(localization.t("hours"))
                                    .font(.caption)
                                    .foregroundColor(.white.opacity(0.7))

                                Picker("", selection: $hours) {
                                    ForEach(0..<24, id: \.self) { hour in
                                        Text("\(hour)")
                                            .foregroundColor(.white)
                                    }
                                }
                                .pickerStyle(.wheel)
                                .frame(width: 80, height: 120)
                                .clipped()
                            }

                            // Minutes
                            VStack {
                                Text(localization.t("minutes"))
                                    .font(.caption)
                                    .foregroundColor(.white.opacity(0.7))

                                Picker("", selection: $minutes) {
                                    ForEach(0..<60, id: \.self) { minute in
                                        Text("\(minute)")
                                            .foregroundColor(.white)
                                    }
                                }
                                .pickerStyle(.wheel)
                                .frame(width: 80, height: 120)
                                .clipped()
                            }

                            // Seconds
                            VStack {
                                Text(localization.t("seconds"))
                                    .font(.caption)
                                    .foregroundColor(.white.opacity(0.7))

                                Picker("", selection: $seconds) {
                                    ForEach(0..<60, id: \.self) { second in
                                        Text("\(second)")
                                            .foregroundColor(.white)
                                    }
                                }
                                .pickerStyle(.wheel)
                                .frame(width: 80, height: 120)
                                .clipped()
                            }
                        }

                        // Preset buttons
                        HStack(spacing: 10) {
                            PresetButton(title: "1 min", hours: 0, minutes: 1, seconds: 0, hours: $hours, minutes: $minutes, seconds: $seconds)
                            PresetButton(title: "5 min", hours: 0, minutes: 5, seconds: 0, hours: $hours, minutes: $minutes, seconds: $seconds)
                            PresetButton(title: "10 min", hours: 0, minutes: 10, seconds: 0, hours: $hours, minutes: $minutes, seconds: $seconds)
                        }

                        HStack(spacing: 10) {
                            PresetButton(title: "15 min", hours: 0, minutes: 15, seconds: 0, hours: $hours, minutes: $minutes, seconds: $seconds)
                            PresetButton(title: "30 min", hours: 0, minutes: 30, seconds: 0, hours: $hours, minutes: $minutes, seconds: $seconds)
                        }
                    }
                    .padding()
                    .background(Color.black.opacity(0.3))
                    .cornerRadius(20)
                    .padding(.horizontal)
                }

                Spacer()

                // Control buttons
                VStack(spacing: 15) {
                    if !timerManager.timerState.isRunning && !timerManager.timerState.isPaused {
                        Button(action: {
                            timerManager.timerState.setTime(hours: hours, minutes: minutes, seconds: seconds)
                            timerManager.start()
                        }) {
                            Text(localization.t("start"))
                                .font(.system(size: 20, weight: .bold))
                                .frame(maxWidth: .infinity)
                                .padding()
                                .background(Color.green)
                                .foregroundColor(.white)
                                .cornerRadius(12)
                        }
                        .disabled(hours == 0 && minutes == 0 && seconds == 0)
                    } else {
                        HStack(spacing: 15) {
                            if timerManager.timerState.isPaused {
                                Button(action: {
                                    timerManager.resume()
                                }) {
                                    Text(localization.t("resume"))
                                        .font(.system(size: 18, weight: .bold))
                                        .frame(maxWidth: .infinity)
                                        .padding()
                                        .background(Color.green)
                                        .foregroundColor(.white)
                                        .cornerRadius(12)
                                }
                            } else {
                                Button(action: {
                                    timerManager.pause()
                                }) {
                                    Text(localization.t("pause"))
                                        .font(.system(size: 18, weight: .bold))
                                        .frame(maxWidth: .infinity)
                                        .padding()
                                        .background(Color.orange)
                                        .foregroundColor(.white)
                                        .cornerRadius(12)
                                }
                            }

                            Button(action: {
                                timerManager.reset()
                                hours = 0
                                minutes = 0
                                seconds = 0
                            }) {
                                Text(localization.t("reset"))
                                    .font(.system(size: 18, weight: .bold))
                                    .frame(maxWidth: .infinity)
                                    .padding()
                                    .background(Color.red)
                                    .foregroundColor(.white)
                                    .cornerRadius(12)
                            }
                        }
                    }
                }
                .padding(.horizontal)
                .padding(.bottom, 30)

                // Timer finished message
                if timerManager.timerState.remainingSeconds == 0 && timerManager.timerState.totalSeconds > 0 {
                    Text(localization.t("timer_finished"))
                        .font(.system(size: 24, weight: .bold))
                        .foregroundColor(.white)
                        .padding()
                        .background(Color.green.opacity(0.8))
                        .cornerRadius(12)
                        .padding(.bottom, 20)
                }
            }
        }
    }
}

struct PresetButton: View {
    let title: String
    let hours: Int
    let minutes: Int
    let seconds: Int
    @Binding var hours: Int
    @Binding var minutes: Int
    @Binding var seconds: Int

    var body: some View {
        Button(action: {
            self.hours = hours
            self.minutes = minutes
            self.seconds = seconds
        }) {
            Text(title)
                .font(.system(size: 14, weight: .medium))
                .padding(.horizontal, 12)
                .padding(.vertical, 8)
                .background(Color.blue.opacity(0.6))
                .foregroundColor(.white)
                .cornerRadius(8)
        }
    }
}
