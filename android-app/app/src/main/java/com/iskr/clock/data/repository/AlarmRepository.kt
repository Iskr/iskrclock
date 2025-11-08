package com.iskr.clock.data.repository

import com.iskr.clock.data.database.AlarmDao
import com.iskr.clock.data.model.AlarmData
import kotlinx.coroutines.flow.Flow

class AlarmRepository(private val alarmDao: AlarmDao) {

    fun getAllAlarms(): Flow<List<AlarmData>> = alarmDao.getAllAlarms()

    suspend fun getAlarmById(id: Long): AlarmData? = alarmDao.getAlarmById(id)

    suspend fun getActiveAlarm(): AlarmData? = alarmDao.getActiveAlarm()

    suspend fun insertAlarm(alarm: AlarmData): Long = alarmDao.insertAlarm(alarm)

    suspend fun updateAlarm(alarm: AlarmData) = alarmDao.updateAlarm(alarm)

    suspend fun deleteAlarm(alarm: AlarmData) = alarmDao.deleteAlarm(alarm)

    suspend fun deleteAlarmById(id: Long) = alarmDao.deleteAlarmById(id)
}
