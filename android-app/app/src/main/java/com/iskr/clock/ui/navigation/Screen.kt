package com.iskr.clock.ui.navigation

sealed class Screen(val route: String, val title: String, val icon: String) {
    object Alarm : Screen("alarm", "⏰ Будильник", "⏰")
    object Timer : Screen("timer", "⏱️ Таймер", "⏱️")
    object Stopwatch : Screen("stopwatch", "⏲️ Секундомер", "⏲️")
    object SleepCalculator : Screen("sleep", "😴 Калькулятор сна", "😴")
    object Settings : Screen("settings", "⚙️ Настройки", "⚙️")
    object CustomStations : Screen("stations", "📻 Станции", "📻")
}

val bottomNavItems = listOf(
    Screen.Alarm,
    Screen.Timer,
    Screen.Stopwatch,
    Screen.SleepCalculator,
    Screen.Settings
)
