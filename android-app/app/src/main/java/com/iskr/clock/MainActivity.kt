package com.iskr.clock

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.iskr.clock.ui.alarm.AlarmScreen
import com.iskr.clock.ui.navigation.Screen
import com.iskr.clock.ui.navigation.bottomNavItems
import com.iskr.clock.ui.sleep.SleepCalculatorScreen
import com.iskr.clock.ui.stopwatch.StopwatchScreen
import com.iskr.clock.ui.theme.IskrClockTheme
import com.iskr.clock.ui.timer.TimerScreen

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            IskrClockTheme {
                MainScreen()
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainScreen() {
    val navController = rememberNavController()
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route

    Scaffold(
        bottomBar = {
            NavigationBar {
                bottomNavItems.forEach { screen ->
                    NavigationBarItem(
                        icon = { Text(screen.icon) },
                        label = { Text(screen.title) },
                        selected = currentRoute == screen.route,
                        onClick = {
                            navController.navigate(screen.route) {
                                popUpTo(navController.graph.startDestinationId) {
                                    saveState = true
                                }
                                launchSingleTop = true
                                restoreState = true
                            }
                        }
                    )
                }
            }
        }
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = Screen.Alarm.route,
            modifier = Modifier.padding(innerPadding)
        ) {
            composable(Screen.Alarm.route) {
                AlarmScreen(
                    onNavigateToStations = {
                        // Navigate to stations screen
                    }
                )
            }

            composable(Screen.Timer.route) {
                TimerScreen()
            }

            composable(Screen.Stopwatch.route) {
                StopwatchScreen()
            }

            composable(Screen.SleepCalculator.route) {
                SleepCalculatorScreen()
            }

            composable(Screen.Settings.route) {
                SettingsScreen()
            }
        }
    }
}

@Composable
fun SettingsScreen() {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        Text(
            text = "⚙️ Настройки",
            style = MaterialTheme.typography.headlineMedium
        )
        Spacer(modifier = Modifier.height(16.dp))
        Text("Версия: 5.2")
        Text("IskrCLOCK Android")
    }
}
