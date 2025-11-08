package com.iskr.clock.ui.alarm

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.iskr.clock.alarm.AlarmScheduler
import com.iskr.clock.data.database.ClockDatabase
import com.iskr.clock.data.model.AlarmData
import com.iskr.clock.data.model.BuiltInStations
import com.iskr.clock.data.model.RadioStation
import com.iskr.clock.data.repository.AlarmRepository
import com.iskr.clock.data.repository.RadioStationRepository
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import java.util.Calendar

class AlarmViewModel(application: Application) : AndroidViewModel(application) {

    private val database = ClockDatabase.getDatabase(application)
    private val alarmRepository = AlarmRepository(database.alarmDao())
    private val stationRepository = RadioStationRepository(database.radioStationDao())
    private val alarmScheduler = AlarmScheduler(application)

    val allStations: StateFlow<List<RadioStation>> = stationRepository.getAllStations()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    private val _currentAlarm = MutableStateFlow<AlarmData?>(null)
    val currentAlarm: StateFlow<AlarmData?> = _currentAlarm.asStateFlow()

    private val _timeRemaining = MutableStateFlow("")
    val timeRemaining: StateFlow<String> = _timeRemaining.asStateFlow()

    init {
        // Initialize built-in stations
        viewModelScope.launch {
            val existingStations = stationRepository.getAllStations().first()
            if (existingStations.isEmpty()) {
                stationRepository.insertStations(BuiltInStations.stations)
            }

            // Load current alarm
            loadCurrentAlarm()
        }

        // Update time remaining every second
        viewModelScope.launch {
            while (true) {
                updateTimeRemaining()
                kotlinx.coroutines.delay(1000)
            }
        }
    }

    private suspend fun loadCurrentAlarm() {
        val alarm = alarmRepository.getActiveAlarm()
        _currentAlarm.value = alarm ?: AlarmData(
            hour = 8,
            minute = 0,
            enabled = false
        )
    }

    fun setAlarmTime(hour: Int, minute: Int) {
        viewModelScope.launch {
            val alarm = _currentAlarm.value ?: return@launch
            val updated = alarm.copy(hour = hour, minute = minute)
            saveAlarm(updated)
        }
    }

    fun setSnoozeDuration(duration: Int) {
        viewModelScope.launch {
            val alarm = _currentAlarm.value ?: return@launch
            val updated = alarm.copy(snoozeDuration = duration)
            saveAlarm(updated)
        }
    }

    fun setVolumeFadeIn(enabled: Boolean) {
        viewModelScope.launch {
            val alarm = _currentAlarm.value ?: return@launch
            val updated = alarm.copy(volumeFadeIn = enabled)
            saveAlarm(updated)
        }
    }

    fun setSelectedStation(stationId: String) {
        viewModelScope.launch {
            val alarm = _currentAlarm.value ?: return@launch
            val updated = alarm.copy(selectedStationId = stationId)
            saveAlarm(updated)
        }
    }

    fun toggleAlarm() {
        viewModelScope.launch {
            val alarm = _currentAlarm.value ?: return@launch
            val updated = alarm.copy(enabled = !alarm.enabled)

            if (updated.enabled) {
                // Schedule alarm
                val id = if (alarm.id == 0L) {
                    alarmRepository.insertAlarm(updated)
                } else {
                    alarmRepository.updateAlarm(updated)
                    updated.id
                }
                alarmScheduler.scheduleAlarm(updated.copy(id = id))
            } else {
                // Cancel alarm
                alarmScheduler.cancelAlarm(alarm.id)
                alarmRepository.updateAlarm(updated)
            }

            _currentAlarm.value = updated
        }
    }

    private suspend fun saveAlarm(alarm: AlarmData) {
        if (alarm.id == 0L) {
            val id = alarmRepository.insertAlarm(alarm)
            _currentAlarm.value = alarm.copy(id = id)
        } else {
            alarmRepository.updateAlarm(alarm)
            _currentAlarm.value = alarm
        }

        // Reschedule if enabled
        if (alarm.enabled) {
            alarmScheduler.scheduleAlarm(_currentAlarm.value!!)
        }
    }

    private fun updateTimeRemaining() {
        val alarm = _currentAlarm.value
        if (alarm != null && alarm.enabled) {
            val remaining = alarmScheduler.getTimeUntilAlarm(alarm)
            val hours = remaining / (1000 * 60 * 60)
            val minutes = (remaining % (1000 * 60 * 60)) / (1000 * 60)
            _timeRemaining.value = "${hours}ч ${minutes}мин"
        } else {
            _timeRemaining.value = ""
        }
    }
}
