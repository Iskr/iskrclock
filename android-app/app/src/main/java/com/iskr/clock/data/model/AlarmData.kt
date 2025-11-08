package com.iskr.clock.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "alarms")
data class AlarmData(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val hour: Int,
    val minute: Int,
    val enabled: Boolean = false,
    val snoozeDuration: Int = 5, // minutes
    val volumeFadeIn: Boolean = false,
    val selectedStationId: String = "classic_beep",
    val vibrate: Boolean = true,
    val repeatDays: Set<Int> = emptySet() // 0=Sunday, 1=Monday, etc.
)
