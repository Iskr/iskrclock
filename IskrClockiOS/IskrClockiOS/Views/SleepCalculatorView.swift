//
//  SleepCalculatorView.swift
//  IskrClockiOS
//

import SwiftUI

struct SleepCalculatorView: View {
    @EnvironmentObject var localization: LocalizationManager

    @State private var mode: CalculatorMode = .whenToSleep
    @State private var selectedTime = Date()
    @State private var results: [Date] = []

    enum CalculatorMode {
        case whenToSleep
        case whenToWake
    }

    var body: some View {
        ZStack {
            AnimatedBackgroundView()

            ScrollView {
                VStack(spacing: 30) {
                    // Header
                    HStack {
                        Text(localization.t("sleep_calc_title"))
                            .font(.system(size: 28, weight: .bold))
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

                    // Mode selector
                    VStack(spacing: 15) {
                        Button(action: {
                            mode = .whenToSleep
                            results = []
                        }) {
                            Text(localization.t("when_sleep"))
                                .font(.system(size: 16, weight: .medium))
                                .frame(maxWidth: .infinity)
                                .padding()
                                .background(mode == .whenToSleep ? Color.blue : Color.white.opacity(0.2))
                                .foregroundColor(.white)
                                .cornerRadius(12)
                        }

                        Button(action: {
                            mode = .whenToWake
                            results = []
                        }) {
                            Text(localization.t("when_wake"))
                                .font(.system(size: 16, weight: .medium))
                                .frame(maxWidth: .infinity)
                                .padding()
                                .background(mode == .whenToWake ? Color.blue : Color.white.opacity(0.2))
                                .foregroundColor(.white)
                                .cornerRadius(12)
                        }
                    }
                    .padding(.horizontal)

                    // Time picker
                    VStack(spacing: 15) {
                        Text(mode == .whenToSleep ? localization.t("wake_time") : localization.t("sleep_time"))
                            .font(.headline)
                            .foregroundColor(.white)

                        DatePicker("", selection: $selectedTime, displayedComponents: .hourAndMinute)
                            .datePickerStyle(.wheel)
                            .labelsHidden()
                            .colorScheme(.dark)
                    }
                    .padding()
                    .background(Color.black.opacity(0.3))
                    .cornerRadius(20)
                    .padding(.horizontal)

                    // Calculate button
                    Button(action: {
                        calculate()
                    }) {
                        Text(localization.t("calculate"))
                            .font(.system(size: 18, weight: .bold))
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color.green)
                            .foregroundColor(.white)
                            .cornerRadius(12)
                    }
                    .padding(.horizontal)

                    // Results
                    if !results.isEmpty {
                        VStack(alignment: .leading, spacing: 15) {
                            Text(localization.t("optimal_times"))
                                .font(.headline)
                                .foregroundColor(.white)
                                .padding(.horizontal)

                            VStack(spacing: 12) {
                                ForEach(Array(results.enumerated()), id: \.offset) { index, time in
                                    HStack {
                                        VStack(alignment: .leading, spacing: 4) {
                                            Text(timeString(from: time))
                                                .font(.system(size: 24, weight: .bold, design: .rounded))
                                                .foregroundColor(.white)

                                            Text("\(index + 1) \(localization.t("cycles")) (\(index * 90 + 90) min)")
                                                .font(.caption)
                                                .foregroundColor(.white.opacity(0.7))
                                        }

                                        Spacer()

                                        Image(systemName: "moon.stars.fill")
                                            .foregroundColor(.yellow)
                                            .font(.system(size: 24))
                                    }
                                    .padding()
                                    .background(Color.black.opacity(0.3))
                                    .cornerRadius(12)
                                }
                            }
                            .padding(.horizontal)
                        }
                        .padding(.top, 20)
                    }

                    Spacer(minLength: 40)
                }
            }
        }
    }

    private func calculate() {
        let calendar = Calendar.current
        let sleepCycleDuration = 90 * 60 // 90 minutes in seconds
        let fallAsleepTime = 14 * 60 // 14 minutes to fall asleep

        results = []

        if mode == .whenToSleep {
            // Calculate when to sleep to wake at selectedTime
            for cycles in (1...6).reversed() {
                let totalSleepTime = sleepCycleDuration * cycles + fallAsleepTime
                if let sleepTime = calendar.date(byAdding: .second, value: -totalSleepTime, to: selectedTime) {
                    results.append(sleepTime)
                }
            }
        } else {
            // Calculate when to wake if sleeping at selectedTime
            for cycles in 1...6 {
                let totalSleepTime = sleepCycleDuration * cycles + fallAsleepTime
                if let wakeTime = calendar.date(byAdding: .second, value: totalSleepTime, to: selectedTime) {
                    results.append(wakeTime)
                }
            }
        }
    }

    private func timeString(from date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "HH:mm"
        return formatter.string(from: date)
    }
}
