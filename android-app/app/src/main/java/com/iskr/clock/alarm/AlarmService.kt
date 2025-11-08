package com.iskr.clock.alarm

import android.app.*
import android.content.Intent
import android.os.Build
import android.os.IBinder
import androidx.core.app.NotificationCompat
import com.iskr.clock.MainActivity
import com.iskr.clock.R
import com.iskr.clock.data.database.ClockDatabase
import com.iskr.clock.data.repository.AlarmRepository
import com.iskr.clock.data.repository.RadioStationRepository
import com.iskr.clock.media.AudioPlayer
import kotlinx.coroutines.*

class AlarmService : Service() {

    private val serviceScope = CoroutineScope(Dispatchers.Main + SupervisorJob())
    private lateinit var alarmRepository: AlarmRepository
    private lateinit var stationRepository: RadioStationRepository
    private lateinit var audioPlayer: AudioPlayer

    private var currentAlarmId: Long = -1

    override fun onCreate() {
        super.onCreate()

        val database = ClockDatabase.getDatabase(applicationContext)
        alarmRepository = AlarmRepository(database.alarmDao())
        stationRepository = RadioStationRepository(database.radioStationDao())
        audioPlayer = AudioPlayer(applicationContext)

        createNotificationChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        currentAlarmId = intent?.getLongExtra("ALARM_ID", -1) ?: -1

        val notification = createNotification()
        startForeground(NOTIFICATION_ID, notification)

        // Start playing alarm sound
        serviceScope.launch {
            val alarm = alarmRepository.getAlarmById(currentAlarmId)
            if (alarm != null) {
                val station = stationRepository.getStationById(alarm.selectedStationId)
                audioPlayer.playAlarm(
                    station = station,
                    fadeIn = alarm.volumeFadeIn
                )
            }
        }

        return START_STICKY
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onDestroy() {
        super.onDestroy()
        audioPlayer.stop()
        serviceScope.cancel()
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Будильник",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Уведомления о срабатывании будильника"
                setSound(null, null)
            }

            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(channel)
        }
    }

    private fun createNotification(): Notification {
        val intent = Intent(this, MainActivity::class.java)
        val pendingIntent = PendingIntent.getActivity(
            this, 0, intent,
            PendingIntent.FLAG_IMMUTABLE
        )

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Будильник")
            .setContentText("Будильник сработал")
            .setSmallIcon(R.drawable.ic_launcher_foreground)
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .build()
    }

    companion object {
        private const val CHANNEL_ID = "alarm_channel"
        private const val NOTIFICATION_ID = 1
    }
}
