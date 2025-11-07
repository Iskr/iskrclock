//
//  CustomStationsManager.swift
//  IskrClockiOS
//

import Foundation

class CustomStationsManager: ObservableObject {
    @Published var customStations: [RadioStation] = []

    init() {
        loadStations()
    }

    func addStation(_ station: RadioStation) {
        customStations.append(station)
        saveStations()
    }

    func deleteStation(_ station: RadioStation) {
        customStations.removeAll { $0.id == station.id }
        saveStations()
    }

    func updateStation(_ station: RadioStation) {
        if let index = customStations.firstIndex(where: { $0.id == station.id }) {
            customStations[index] = station
            saveStations()
        }
    }

    private func loadStations() {
        guard let data = UserDefaults.standard.data(forKey: "customStations"),
              let stations = try? JSONDecoder().decode([RadioStation].self, from: data) else {
            customStations = []
            return
        }
        customStations = stations
    }

    private func saveStations() {
        if let encoded = try? JSONEncoder().encode(customStations) {
            UserDefaults.standard.set(encoded, forKey: "customStations")
        }
    }
}
