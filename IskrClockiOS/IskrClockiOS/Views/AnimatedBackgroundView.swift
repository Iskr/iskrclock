//
//  AnimatedBackgroundView.swift
//  IskrClockiOS
//

import SwiftUI

struct AnimatedBackgroundView: View {
    @State private var currentGradient: [Color] = []
    @State private var nextGradient: [Color] = []
    @State private var progress: Double = 0
    @State private var stars: [Star] = []

    private let transitionDuration: TimeInterval = 60.0
    private let starCount = 50

    init() {
        let initialColors = Self.getTimeBasedColors()
        _currentGradient = State(initialValue: initialColors)
        _nextGradient = State(initialValue: Self.getRandomGradient(for: Self.getTimeOfDay()))
    }

    var body: some View {
        ZStack {
            // Animated gradient background
            LinearGradient(
                gradient: Gradient(colors: interpolatedGradient),
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()

            // Stars (night time only)
            if isNightTime() {
                ForEach(stars) { star in
                    Circle()
                        .fill(Color.white.opacity(star.opacity))
                        .frame(width: star.size, height: star.size)
                        .position(x: star.x, y: star.y)
                        .opacity(star.twinkleOpacity)
                }
            }
        }
        .onAppear {
            generateStars()
            startGradientAnimation()
            startStarAnimation()
        }
    }

    private var interpolatedGradient: [Color] {
        currentGradient.indices.map { index in
            let currentColor = currentGradient[index]
            let nextColor = nextGradient[index]
            return Self.interpolateColor(from: currentColor, to: nextColor, progress: progress)
        }
    }

    private func generateStars() {
        stars = (0..<starCount).map { _ in
            Star(
                x: CGFloat.random(in: 0...UIScreen.main.bounds.width),
                y: CGFloat.random(in: 0...UIScreen.main.bounds.height),
                size: CGFloat.random(in: 1...3),
                opacity: Double.random(in: 0.3...1.0),
                twinkleOpacity: Double.random(in: 0.3...1.0)
            )
        }
    }

    private func startGradientAnimation() {
        Timer.scheduledTimer(withTimeInterval: 0.016, repeats: true) { _ in
            withAnimation(.linear(duration: 0.016)) {
                progress += 0.016 / transitionDuration

                if progress >= 1.0 {
                    progress = 0
                    currentGradient = nextGradient
                    nextGradient = Self.getRandomGradient(for: Self.getTimeOfDay())
                }
            }
        }
    }

    private func startStarAnimation() {
        Timer.scheduledTimer(withTimeInterval: 0.1, repeats: true) { _ in
            stars = stars.map { star in
                var newStar = star
                newStar.twinkleOpacity = Double.random(in: 0.3...1.0)
                return newStar
            }
        }
    }

    private func isNightTime() -> Bool {
        let hour = Calendar.current.component(.hour, from: Date())
        return hour >= 19 || hour < 6
    }

    // MARK: - Static Helper Functions

    private static func getTimeOfDay() -> TimeOfDay {
        let hour = Calendar.current.component(.hour, from: Date())

        switch hour {
        case 5..<9:
            return .sunrise
        case 9..<17:
            return .day
        case 17..<19:
            return .sunset
        default:
            return .night
        }
    }

    private static func getTimeBasedColors() -> [Color] {
        return getRandomGradient(for: getTimeOfDay())
    }

    private static func getRandomGradient(for timeOfDay: TimeOfDay) -> [Color] {
        switch timeOfDay {
        case .sunrise:
            return [
                Color(red: Double.random(in: 150...200) / 255, green: Double.random(in: 100...150) / 255, blue: Double.random(in: 120...170) / 255),
                Color(red: Double.random(in: 200...240) / 255, green: Double.random(in: 150...200) / 255, blue: Double.random(in: 150...200) / 255)
            ]
        case .day:
            return [
                Color(red: Double.random(in: 180...240) / 255, green: Double.random(in: 180...240) / 255, blue: Double.random(in: 190...250) / 255),
                Color(red: Double.random(in: 200...250) / 255, green: Double.random(in: 200...250) / 255, blue: Double.random(in: 210...255) / 255)
            ]
        case .sunset:
            return [
                Color(red: Double.random(in: 160...210) / 255, green: Double.random(in: 90...140) / 255, blue: Double.random(in: 130...180) / 255),
                Color(red: Double.random(in: 200...230) / 255, green: Double.random(in: 120...170) / 255, blue: Double.random(in: 140...190) / 255)
            ]
        case .night:
            return [
                Color(red: Double.random(in: 15...50) / 255, green: Double.random(in: 15...50) / 255, blue: Double.random(in: 25...60) / 255),
                Color(red: Double.random(in: 25...60) / 255, green: Double.random(in: 25...60) / 255, blue: Double.random(in: 35...70) / 255)
            ]
        }
    }

    private static func interpolateColor(from: Color, to: Color, progress: Double) -> Color {
        let fromComponents = UIColor(from).cgColor.components ?? [0, 0, 0, 1]
        let toComponents = UIColor(to).cgColor.components ?? [0, 0, 0, 1]

        let r = fromComponents[0] + (toComponents[0] - fromComponents[0]) * progress
        let g = fromComponents[1] + (toComponents[1] - fromComponents[1]) * progress
        let b = fromComponents[2] + (toComponents[2] - fromComponents[2]) * progress

        return Color(red: r, green: g, blue: b)
    }

    // MARK: - Supporting Types

    enum TimeOfDay {
        case sunrise, day, sunset, night
    }

    struct Star: Identifiable {
        let id = UUID()
        var x: CGFloat
        var y: CGFloat
        var size: CGFloat
        var opacity: Double
        var twinkleOpacity: Double
    }
}
