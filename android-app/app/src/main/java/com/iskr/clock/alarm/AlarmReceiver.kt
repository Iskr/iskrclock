package com.iskr.clock.alarm

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
import com.iskr.clock.AlarmActivity

class AlarmReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        when (intent.action) {
            "com.iskr.clock.ALARM_TRIGGERED" -> {
                val alarmId = intent.getLongExtra("ALARM_ID", -1)

                // Start AlarmService
                val serviceIntent = Intent(context, AlarmService::class.java).apply {
                    putExtra("ALARM_ID", alarmId)
                }

                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    context.startForegroundService(serviceIntent)
                } else {
                    context.startService(serviceIntent)
                }

                // Start AlarmActivity (full screen)
                val activityIntent = Intent(context, AlarmActivity::class.java).apply {
                    flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
                    putExtra("ALARM_ID", alarmId)
                }
                context.startActivity(activityIntent)
            }

            Intent.ACTION_BOOT_COMPLETED -> {
                // Re-schedule all enabled alarms after device reboot
                // This will be handled by the application class
            }
        }
    }
}
