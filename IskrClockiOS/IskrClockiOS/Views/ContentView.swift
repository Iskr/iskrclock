//
//  ContentView.swift
//  IskrClockiOS
//

import SwiftUI

struct ContentView: View {
    @State private var selectedTab = 0

    var body: some View {
        TabView(selection: $selectedTab) {
            AlarmView()
                .tabItem {
                    Label("Alarm", systemImage: "alarm.fill")
                }
                .tag(0)

            TimerView()
                .tabItem {
                    Label("Timer", systemImage: "timer")
                }
                .tag(1)

            StopwatchView()
                .tabItem {
                    Label("Stopwatch", systemImage: "stopwatch.fill")
                }
                .tag(2)

            SleepCalculatorView()
                .tabItem {
                    Label("Sleep", systemImage: "bed.double.fill")
                }
                .tag(3)

            CustomStationsView()
                .tabItem {
                    Label("Stations", systemImage: "music.note.list")
                }
                .tag(4)
        }
        .accentColor(.blue)
    }
}
