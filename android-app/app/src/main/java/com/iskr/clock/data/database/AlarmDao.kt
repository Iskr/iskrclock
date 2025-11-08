package com.iskr.clock.data.database

import androidx.room.*
import com.iskr.clock.data.model.AlarmData
import kotlinx.coroutines.flow.Flow

@Dao
interface AlarmDao {
    @Query("SELECT * FROM alarms ORDER BY hour, minute")
    fun getAllAlarms(): Flow<List<AlarmData>>

    @Query("SELECT * FROM alarms WHERE id = :id")
    suspend fun getAlarmById(id: Long): AlarmData?

    @Query("SELECT * FROM alarms WHERE enabled = 1 LIMIT 1")
    suspend fun getActiveAlarm(): AlarmData?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAlarm(alarm: AlarmData): Long

    @Update
    suspend fun updateAlarm(alarm: AlarmData)

    @Delete
    suspend fun deleteAlarm(alarm: AlarmData)

    @Query("DELETE FROM alarms WHERE id = :id")
    suspend fun deleteAlarmById(id: Long)
}
