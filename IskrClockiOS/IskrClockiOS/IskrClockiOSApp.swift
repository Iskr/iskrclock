//
//  IskrClockiOSApp.swift
//  IskrClockiOS
//
//  Created by IskrCLOCK
//  Version 5.2
//

import SwiftUI

@main
struct IskrClockiOSApp: App {
    @StateObject private var alarmManager = AlarmManager.shared
    @StateObject private var audioPlayer = AudioPlayer.shared
    @StateObject private var localizationManager = LocalizationManager.shared

    init() {
        // Request notification permissions on app launch
        NotificationManager.shared.requestAuthorization()

        // Configure audio session for background playback
        AudioSessionManager.shared.configureAudioSession()
    }

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(alarmManager)
                .environmentObject(audioPlayer)
                .environmentObject(localizationManager)
                .preferredColorScheme(.dark)
        }
    }
}
