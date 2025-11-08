package com.iskr.clock

import android.app.Application
import android.app.NotificationChannel
import android.app.NotificationManager
import android.os.Build
import com.iskr.clock.data.database.ClockDatabase
import com.iskr.clock.data.model.BuiltInStations
import com.iskr.clock.data.repository.RadioStationRepository
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch

class ClockApplication : Application() {

    val database by lazy { ClockDatabase.getDatabase(this) }

    override fun onCreate() {
        super.onCreate()

        createNotificationChannels()
        initializeDatabase()
    }

    private fun createNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channels = listOf(
                NotificationChannel(
                    "alarm_channel",
                    "Будильник",
                    NotificationManager.IMPORTANCE_HIGH
                ).apply {
                    description = "Уведомления о срабатывании будильника"
                    setSound(null, null)
                },
                NotificationChannel(
                    "timer_channel",
                    "Таймер",
                    NotificationManager.IMPORTANCE_HIGH
                ).apply {
                    description = "Уведомления таймера"
                }
            )

            val notificationManager = getSystemService(NotificationManager::class.java)
            channels.forEach { channel ->
                notificationManager.createNotificationChannel(channel)
            }
        }
    }

    private fun initializeDatabase() {
        CoroutineScope(Dispatchers.IO).launch {
            val stationRepository = RadioStationRepository(database.radioStationDao())

            // Initialize built-in stations if database is empty
            val existingStations = stationRepository.getAllStations().first()
            if (existingStations.isEmpty()) {
                stationRepository.insertStations(BuiltInStations.stations)
            }
        }
    }
}
