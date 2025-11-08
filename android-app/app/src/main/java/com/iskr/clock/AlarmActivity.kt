package com.iskr.clock

import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.iskr.clock.alarm.AlarmScheduler
import com.iskr.clock.alarm.AlarmService
import com.iskr.clock.data.database.ClockDatabase
import com.iskr.clock.data.repository.AlarmRepository
import com.iskr.clock.ui.theme.IskrClockTheme
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.*

class AlarmActivity : ComponentActivity() {

    private lateinit var alarmRepository: AlarmRepository
    private lateinit var alarmScheduler: AlarmScheduler
    private var alarmId: Long = -1

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val database = ClockDatabase.getDatabase(applicationContext)
        alarmRepository = AlarmRepository(database.alarmDao())
        alarmScheduler = AlarmScheduler(applicationContext)

        alarmId = intent.getLongExtra("ALARM_ID", -1)

        setContent {
            IskrClockTheme {
                AlarmTriggeredScreen(
                    onStop = { stopAlarm() },
                    onSnooze = { snoozeAlarm() }
                )
            }
        }
    }

    private fun stopAlarm() {
        // Stop the alarm service
        val serviceIntent = Intent(this, AlarmService::class.java)
        stopService(serviceIntent)

        // Disable the alarm
        kotlinx.coroutines.GlobalScope.launch {
            if (alarmId != -1L) {
                val alarm = alarmRepository.getAlarmById(alarmId)
                alarm?.let {
                    alarmRepository.updateAlarm(it.copy(enabled = false))
                }
            }
        }

        finish()
    }

    private fun snoozeAlarm() {
        // Stop the alarm service
        val serviceIntent = Intent(this, AlarmService::class.java)
        stopService(serviceIntent)

        // Schedule snooze
        kotlinx.coroutines.GlobalScope.launch {
            if (alarmId != -1L) {
                val alarm = alarmRepository.getAlarmById(alarmId)
                alarm?.let {
                    val snoozeAlarm = it.copy(
                        hour = Calendar.getInstance().apply {
                            add(Calendar.MINUTE, it.snoozeDuration)
                        }.get(Calendar.HOUR_OF_DAY),
                        minute = Calendar.getInstance().apply {
                            add(Calendar.MINUTE, it.snoozeDuration)
                        }.get(Calendar.MINUTE)
                    )
                    alarmScheduler.scheduleAlarm(snoozeAlarm)
                }
            }
        }

        finish()
    }
}

@Composable
fun AlarmTriggeredScreen(
    onStop: () -> Unit,
    onSnooze: () -> Unit
) {
    val currentTime = remember { mutableStateOf(getCurrentTime()) }

    LaunchedEffect(Unit) {
        while (true) {
            currentTime.value = getCurrentTime()
            kotlinx.coroutines.delay(1000)
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFFE94560)),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier.padding(32.dp)
        ) {
            Text(
                text = "⏰",
                fontSize = 80.sp
            )

            Spacer(modifier = Modifier.height(24.dp))

            Text(
                text = "БУДИЛЬНИК!",
                fontSize = 48.sp,
                fontWeight = FontWeight.Bold,
                color = Color.White
            )

            Spacer(modifier = Modifier.height(16.dp))

            Text(
                text = currentTime.value,
                fontSize = 64.sp,
                fontWeight = FontWeight.Bold,
                color = Color.White
            )

            Spacer(modifier = Modifier.height(48.dp))

            Button(
                onClick = onStop,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(72.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = Color.White
                )
            ) {
                Text(
                    text = "ОСТАНОВИТЬ",
                    fontSize = 24.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFFE94560)
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            OutlinedButton(
                onClick = onSnooze,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(64.dp),
                colors = ButtonDefaults.outlinedButtonColors(
                    contentColor = Color.White
                )
            ) {
                Text(
                    text = "Отложить",
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold
                )
            }
        }
    }
}

private fun getCurrentTime(): String {
    val formatter = SimpleDateFormat("HH:mm", Locale.getDefault())
    return formatter.format(Date())
}
