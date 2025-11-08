package com.iskr.clock.ui.alarm

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.iskr.clock.ui.components.FlowBackground
import java.text.SimpleDateFormat
import java.util.*

@Composable
fun AlarmScreen(
    viewModel: AlarmViewModel = viewModel(),
    onNavigateToStations: () -> Unit
) {
    val alarm by viewModel.currentAlarm.collectAsState()
    val stations by viewModel.allStations.collectAsState()
    val timeRemaining by viewModel.timeRemaining.collectAsState()

    Box(modifier = Modifier.fillMaxSize()) {
        // Animated background
        FlowBackground()

        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Spacer(modifier = Modifier.height(32.dp))

            // Current time display
            CurrentTimeDisplay()

            Spacer(modifier = Modifier.height(48.dp))

            // Alarm time picker
            alarm?.let { alarmData ->
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(
                        containerColor = Color.White.copy(alpha = 0.9f)
                    )
                ) {
                    Column(
                        modifier = Modifier.padding(24.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(
                            text = "Будильник",
                            style = MaterialTheme.typography.headlineMedium,
                            fontWeight = FontWeight.Bold
                        )

                        Spacer(modifier = Modifier.height(16.dp))

                        // Time picker
                        Row(
                            horizontalArrangement = Arrangement.Center,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            TimePickerField(
                                value = alarmData.hour,
                                label = "Часы",
                                range = 0..23,
                                onValueChange = { viewModel.setAlarmTime(it, alarmData.minute) }
                            )

                            Text(
                                text = ":",
                                fontSize = 48.sp,
                                modifier = Modifier.padding(horizontal = 8.dp)
                            )

                            TimePickerField(
                                value = alarmData.minute,
                                label = "Минуты",
                                range = 0..59,
                                onValueChange = { viewModel.setAlarmTime(alarmData.hour, it) }
                            )
                        }

                        Spacer(modifier = Modifier.height(24.dp))

                        // Snooze duration
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text("Отложить на:")
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                IconButton(onClick = {
                                    if (alarmData.snoozeDuration > 1) {
                                        viewModel.setSnoozeDuration(alarmData.snoozeDuration - 1)
                                    }
                                }) {
                                    Text("-", fontSize = 24.sp)
                                }
                                Text(
                                    text = "${alarmData.snoozeDuration} мин",
                                    fontSize = 18.sp,
                                    modifier = Modifier.padding(horizontal = 16.dp)
                                )
                                IconButton(onClick = {
                                    if (alarmData.snoozeDuration < 60) {
                                        viewModel.setSnoozeDuration(alarmData.snoozeDuration + 1)
                                    }
                                }) {
                                    Text("+", fontSize = 24.sp)
                                }
                            }
                        }

                        Divider(modifier = Modifier.padding(vertical = 8.dp))

                        // Volume fade-in
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text("Плавное увеличение")
                            Switch(
                                checked = alarmData.volumeFadeIn,
                                onCheckedChange = { viewModel.setVolumeFadeIn(it) }
                            )
                        }

                        Divider(modifier = Modifier.padding(vertical = 8.dp))

                        // Station selector
                        Text("Мелодия будильника", fontWeight = FontWeight.Bold)
                        Spacer(modifier = Modifier.height(8.dp))

                        val selectedStation = stations.find { it.id == alarmData.selectedStationId }
                        var expanded by remember { mutableStateOf(false) }

                        ExposedDropdownMenuBox(
                            expanded = expanded,
                            onExpandedChange = { expanded = !expanded }
                        ) {
                            OutlinedTextField(
                                value = selectedStation?.name ?: "Выберите станцию",
                                onValueChange = {},
                                readOnly = true,
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .menuAnchor(),
                                trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded) }
                            )

                            ExposedDropdownMenu(
                                expanded = expanded,
                                onDismissRequest = { expanded = false }
                            ) {
                                stations.forEach { station ->
                                    DropdownMenuItem(
                                        text = { Text(station.name) },
                                        onClick = {
                                            viewModel.setSelectedStation(station.id)
                                            expanded = false
                                        }
                                    )
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(8.dp))

                        TextButton(onClick = onNavigateToStations) {
                            Text("Управление станциями →")
                        }

                        Spacer(modifier = Modifier.height(24.dp))

                        // Toggle alarm button
                        Button(
                            onClick = { viewModel.toggleAlarm() },
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(56.dp),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = if (alarmData.enabled) {
                                    MaterialTheme.colorScheme.error
                                } else {
                                    MaterialTheme.colorScheme.primary
                                }
                            )
                        ) {
                            Text(
                                text = if (alarmData.enabled) "Выключить будильник" else "Включить будильник",
                                fontSize = 18.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }

                        // Time remaining
                        if (timeRemaining.isNotEmpty()) {
                            Spacer(modifier = Modifier.height(16.dp))
                            Text(
                                text = "До будильника: $timeRemaining",
                                style = MaterialTheme.typography.bodyLarge,
                                color = MaterialTheme.colorScheme.primary
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(32.dp))
        }
    }
}

@Composable
fun CurrentTimeDisplay() {
    val currentTime = remember { mutableStateOf(getCurrentTimeString()) }
    val currentDate = remember { mutableStateOf(getCurrentDateString()) }

    LaunchedEffect(Unit) {
        while (true) {
            currentTime.value = getCurrentTimeString()
            currentDate.value = getCurrentDateString()
            kotlinx.coroutines.delay(1000)
        }
    }

    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(
            text = currentTime.value,
            fontSize = 72.sp,
            fontWeight = FontWeight.Bold,
            color = Color.White
        )
        Text(
            text = currentDate.value,
            fontSize = 20.sp,
            color = Color.White.copy(alpha = 0.9f)
        )
    }
}

@Composable
fun TimePickerField(
    value: Int,
    label: String,
    range: IntRange,
    onValueChange: (Int) -> Unit
) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(label, fontSize = 12.sp, color = Color.Gray)
        Card(
            colors = CardDefaults.cardColors(
                containerColor = MaterialTheme.colorScheme.primaryContainer
            )
        ) {
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                modifier = Modifier.padding(8.dp)
            ) {
                IconButton(onClick = {
                    val newValue = if (value + 1 > range.last) range.first else value + 1
                    onValueChange(newValue)
                }) {
                    Text("▲")
                }

                Text(
                    text = String.format("%02d", value),
                    fontSize = 36.sp,
                    fontWeight = FontWeight.Bold
                )

                IconButton(onClick = {
                    val newValue = if (value - 1 < range.first) range.last else value - 1
                    onValueChange(newValue)
                }) {
                    Text("▼")
                }
            }
        }
    }
}

private fun getCurrentTimeString(): String {
    val formatter = SimpleDateFormat("HH:mm", Locale.getDefault())
    return formatter.format(Date())
}

private fun getCurrentDateString(): String {
    val formatter = SimpleDateFormat("EEEE, d MMMM yyyy", Locale("ru"))
    return formatter.format(Date())
}
