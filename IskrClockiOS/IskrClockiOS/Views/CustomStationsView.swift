//
//  CustomStationsView.swift
//  IskrClockiOS
//

import SwiftUI

struct CustomStationsView: View {
    @StateObject private var stationsManager = CustomStationsManager()
    @EnvironmentObject var audioPlayer: AudioPlayer
    @EnvironmentObject var localization: LocalizationManager

    @State private var showingAddStation = false
    @State private var newStationName = ""
    @State private var newStationURL = ""
    @State private var selectedStationType: StationType = .radio

    var body: some View {
        ZStack {
            AnimatedBackgroundView()

            ScrollView {
                VStack(spacing: 25) {
                    // Header
                    HStack {
                        Text(localization.t("custom_stations_title"))
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

                    // Add station button
                    Button(action: {
                        showingAddStation.toggle()
                    }) {
                        HStack {
                            Image(systemName: "plus.circle.fill")
                            Text(localization.t("add_station"))
                        }
                        .font(.system(size: 18, weight: .medium))
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.blue)
                        .foregroundColor(.white)
                        .cornerRadius(12)
                    }
                    .padding(.horizontal)

                    // Add station form
                    if showingAddStation {
                        VStack(spacing: 15) {
                            TextField(localization.t("station_name"), text: $newStationName)
                                .textFieldStyle(RoundedBorderTextFieldStyle())
                                .padding(.horizontal)

                            // Station type picker
                            Picker(localization.t("station_type"), selection: $selectedStationType) {
                                Text(localization.t("radio_stream")).tag(StationType.radio)
                                Text(localization.t("youtube_video")).tag(StationType.youtube)
                            }
                            .pickerStyle(SegmentedPickerStyle())
                            .padding(.horizontal)

                            TextField(
                                selectedStationType == .radio ? localization.t("stream_url") : localization.t("youtube_url"),
                                text: $newStationURL
                            )
                            .textFieldStyle(RoundedBorderTextFieldStyle())
                            .autocapitalization(.none)
                            .padding(.horizontal)

                            HStack(spacing: 15) {
                                Button(action: {
                                    addStation()
                                }) {
                                    Text(localization.t("add"))
                                        .frame(maxWidth: .infinity)
                                        .padding()
                                        .background(Color.green)
                                        .foregroundColor(.white)
                                        .cornerRadius(10)
                                }

                                Button(action: {
                                    showingAddStation = false
                                    resetForm()
                                }) {
                                    Text(localization.t("cancel"))
                                        .frame(maxWidth: .infinity)
                                        .padding()
                                        .background(Color.red)
                                        .foregroundColor(.white)
                                        .cornerRadius(10)
                                }
                            }
                            .padding(.horizontal)
                        }
                        .padding(.vertical)
                        .background(Color.black.opacity(0.3))
                        .cornerRadius(15)
                        .padding(.horizontal)
                    }

                    // Built-in stations
                    VStack(alignment: .leading, spacing: 15) {
                        Text(localization.t("built_in_stations"))
                            .font(.headline)
                            .foregroundColor(.white)
                            .padding(.horizontal)

                        ForEach(RadioStation.builtInStations) { station in
                            StationRow(station: station, isPlaying: audioPlayer.currentStation?.id == station.id)
                        }
                    }

                    // Custom stations
                    if !stationsManager.customStations.isEmpty {
                        VStack(alignment: .leading, spacing: 15) {
                            Text(localization.t("my_stations"))
                                .font(.headline)
                                .foregroundColor(.white)
                                .padding(.horizontal)

                            ForEach(stationsManager.customStations) { station in
                                StationRow(
                                    station: station,
                                    isPlaying: audioPlayer.currentStation?.id == station.id,
                                    onDelete: {
                                        stationsManager.deleteStation(station)
                                    }
                                )
                            }
                        }
                    }

                    Spacer(minLength: 40)
                }
            }
        }
    }

    private func addStation() {
        guard !newStationName.isEmpty, !newStationURL.isEmpty else { return }

        let newStation = RadioStation(
            id: UUID().uuidString,
            name: newStationName,
            type: selectedStationType,
            url: newStationURL,
            isBuiltIn: false
        )

        stationsManager.addStation(newStation)
        resetForm()
        showingAddStation = false
    }

    private func resetForm() {
        newStationName = ""
        newStationURL = ""
        selectedStationType = .radio
    }
}

struct StationRow: View {
    let station: RadioStation
    let isPlaying: Bool
    var onDelete: (() -> Void)? = nil

    @EnvironmentObject var audioPlayer: AudioPlayer
    @EnvironmentObject var localization: LocalizationManager

    var body: some View {
        HStack(spacing: 15) {
            // Station icon
            Text(station.icon)
                .font(.system(size: 24))

            // Station info
            VStack(alignment: .leading, spacing: 4) {
                Text(station.name)
                    .font(.system(size: 16, weight: .medium))
                    .foregroundColor(.white)

                if let url = station.url {
                    Text(url)
                        .font(.caption)
                        .foregroundColor(.white.opacity(0.6))
                        .lineLimit(1)
                }
            }

            Spacer()

            // Play button
            Button(action: {
                if isPlaying {
                    audioPlayer.stop()
                } else {
                    audioPlayer.play(station: station, fadeIn: false)
                }
            }) {
                Image(systemName: isPlaying ? "pause.circle.fill" : "play.circle.fill")
                    .font(.system(size: 28))
                    .foregroundColor(isPlaying ? .orange : .green)
            }

            // Delete button (only for custom stations)
            if !station.isBuiltIn, let deleteAction = onDelete {
                Button(action: deleteAction) {
                    Image(systemName: "trash.circle.fill")
                        .font(.system(size: 28))
                        .foregroundColor(.red)
                }
            }
        }
        .padding()
        .background(Color.black.opacity(0.3))
        .cornerRadius(12)
        .padding(.horizontal)
    }
}

extension CustomStationsView {
    var cancelLocalizedKey: String {
        localization.currentLanguage == .russian ? "Отмена" : "Cancel"
    }
}
