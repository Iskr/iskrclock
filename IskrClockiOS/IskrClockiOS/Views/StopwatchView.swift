//
//  StopwatchView.swift
//  IskrClockiOS
//

import SwiftUI

struct StopwatchView: View {
    @StateObject private var stopwatchManager = StopwatchManager()
    @EnvironmentObject var localization: LocalizationManager

    var body: some View {
        ZStack {
            AnimatedBackgroundView()

            VStack(spacing: 30) {
                // Header
                HStack {
                    Text(localization.t("stopwatch_title"))
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

                // Stopwatch display
                Text(stopwatchManager.stopwatchState.timeString)
                    .font(.system(size: 56, weight: .bold, design: .rounded))
                    .foregroundColor(.white)
                    .padding()

                // Control buttons
                HStack(spacing: 20) {
                    if !stopwatchManager.stopwatchState.isRunning && !stopwatchManager.stopwatchState.isPaused {
                        Button(action: {
                            stopwatchManager.start()
                        }) {
                            Text(localization.t("start"))
                                .font(.system(size: 20, weight: .bold))
                                .frame(width: 120)
                                .padding()
                                .background(Color.green)
                                .foregroundColor(.white)
                                .cornerRadius(12)
                        }
                    } else {
                        if stopwatchManager.stopwatchState.isPaused {
                            Button(action: {
                                stopwatchManager.resume()
                            }) {
                                Text(localization.t("resume"))
                                    .font(.system(size: 18, weight: .bold))
                                    .frame(width: 110)
                                    .padding()
                                    .background(Color.green)
                                    .foregroundColor(.white)
                                    .cornerRadius(12)
                            }
                        } else {
                            Button(action: {
                                stopwatchManager.pause()
                            }) {
                                Text(localization.t("pause"))
                                    .font(.system(size: 18, weight: .bold))
                                    .frame(width: 110)
                                    .padding()
                                    .background(Color.orange)
                                    .foregroundColor(.white)
                                    .cornerRadius(12)
                            }
                        }

                        Button(action: {
                            stopwatchManager.lap()
                        }) {
                            Text(localization.t("lap"))
                                .font(.system(size: 18, weight: .bold))
                                .frame(width: 110)
                                .padding()
                                .background(Color.blue)
                                .foregroundColor(.white)
                                .cornerRadius(12)
                        }
                        .disabled(stopwatchManager.stopwatchState.isPaused)
                    }

                    if stopwatchManager.stopwatchState.isRunning || stopwatchManager.stopwatchState.isPaused {
                        Button(action: {
                            stopwatchManager.reset()
                        }) {
                            Text(localization.t("reset"))
                                .font(.system(size: 18, weight: .bold))
                                .frame(width: 110)
                                .padding()
                                .background(Color.red)
                                .foregroundColor(.white)
                                .cornerRadius(12)
                        }
                    }
                }
                .padding()

                // Laps list
                if !stopwatchManager.stopwatchState.laps.isEmpty {
                    VStack(alignment: .leading, spacing: 10) {
                        Text(localization.t("laps"))
                            .font(.headline)
                            .foregroundColor(.white)
                            .padding(.horizontal)

                        ScrollView {
                            VStack(spacing: 8) {
                                ForEach(stopwatchManager.stopwatchState.laps.indices.reversed(), id: \.self) { index in
                                    HStack {
                                        Text("Lap \(index + 1)")
                                            .foregroundColor(.white.opacity(0.8))

                                        Spacer()

                                        Text(stopwatchManager.stopwatchState.lapString(index: index))
                                            .font(.system(.body, design: .monospaced))
                                            .foregroundColor(.white)
                                    }
                                    .padding(.horizontal)
                                    .padding(.vertical, 8)
                                    .background(Color.black.opacity(0.2))
                                    .cornerRadius(8)
                                }
                            }
                            .padding(.horizontal)
                        }
                        .frame(maxHeight: 300)
                    }
                    .padding(.top, 20)
                }

                Spacer()
            }
        }
    }
}
