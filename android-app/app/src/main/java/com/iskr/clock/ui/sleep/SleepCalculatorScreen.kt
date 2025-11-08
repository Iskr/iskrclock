package com.iskr.clock.ui.sleep

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.iskr.clock.ui.components.FlowBackground
import java.text.SimpleDateFormat
import java.util.*

@Composable
fun SleepCalculatorScreen() {
    var mode by remember { mutableStateOf(SleepMode.WAKE_TIME) }
    var selectedHour by remember { mutableStateOf(22) }
    var selectedMinute by remember { mutableStateOf(0) }
    var cycles by remember { mutableStateOf(5) }
    var results by remember { mutableStateOf<List<String>>(emptyList()) }

    Box(modifier = Modifier.fillMaxSize()) {
        FlowBackground()

        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Spacer(modifier = Modifier.height(32.dp))

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
                        text = "😴 Калькулятор сна",
                        style = MaterialTheme.typography.headlineMedium,
                        fontWeight = FontWeight.Bold
                    )

                    Spacer(modifier = Modifier.height(24.dp))

                    // Mode selector
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Button(
                            onClick = { mode = SleepMode.WAKE_TIME },
                            modifier = Modifier.weight(1f),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = if (mode == SleepMode.WAKE_TIME) {
                                    MaterialTheme.colorScheme.primary
                                } else {
                                    MaterialTheme.colorScheme.surfaceVariant
                                }
                            )
                        ) {
                            Text("Когда проснуться")
                        }

                        Button(
                            onClick = { mode = SleepMode.SLEEP_TIME },
                            modifier = Modifier.weight(1f),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = if (mode == SleepMode.SLEEP_TIME) {
                                    MaterialTheme.colorScheme.primary
                                } else {
                                    MaterialTheme.colorScheme.surfaceVariant
                                }
                            )
                        ) {
                            Text("Когда лечь")
                        }
                    }

                    Spacer(modifier = Modifier.height(24.dp))

                    // Time picker
                    Row(
                        horizontalArrangement = Arrangement.Center,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        TimePickerColumn(
                            value = selectedHour,
                            label = "Часы",
                            range = 0..23,
                            onValueChange = { selectedHour = it }
                        )

                        Text(
                            text = ":",
                            fontSize = 48.sp,
                            modifier = Modifier.padding(horizontal = 16.dp)
                        )

                        TimePickerColumn(
                            value = selectedMinute,
                            label = "Минуты",
                            range = 0..59,
                            onValueChange = { selectedMinute = it }
                        )
                    }

                    Spacer(modifier = Modifier.height(24.dp))

                    // Cycles selector
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("Циклы сна (по 90 мин):")
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            IconButton(onClick = { if (cycles > 1) cycles-- }) {
                                Text("-", fontSize = 24.sp)
                            }
                            Text(
                                text = "$cycles",
                                fontSize = 24.sp,
                                fontWeight = FontWeight.Bold,
                                modifier = Modifier.padding(horizontal = 16.dp)
                            )
                            IconButton(onClick = { if (cycles < 10) cycles++ }) {
                                Text("+", fontSize = 24.sp)
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(24.dp))

                    // Calculate button
                    Button(
                        onClick = {
                            results = calculateSleepTimes(
                                mode,
                                selectedHour,
                                selectedMinute,
                                cycles
                            )
                        },
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text("Рассчитать")
                    }
                }
            }

            // Results
            if (results.isNotEmpty()) {
                Spacer(modifier = Modifier.height(16.dp))

                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .weight(1f),
                    colors = CardDefaults.cardColors(
                        containerColor = Color.White.copy(alpha = 0.9f)
                    )
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(
                            text = if (mode == SleepMode.WAKE_TIME) {
                                "Оптимальное время пробуждения:"
                            } else {
                                "Оптимальное время засыпания:"
                            },
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold
                        )

                        Spacer(modifier = Modifier.height(8.dp))

                        LazyColumn {
                            items(results) { time ->
                                Card(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(vertical = 4.dp),
                                    colors = CardDefaults.cardColors(
                                        containerColor = MaterialTheme.colorScheme.primaryContainer
                                    )
                                ) {
                                    Text(
                                        text = time,
                                        fontSize = 20.sp,
                                        fontWeight = FontWeight.Bold,
                                        modifier = Modifier.padding(16.dp)
                                    )
                                }
                            }
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))
        }
    }
}

@Composable
fun TimePickerColumn(
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
                    fontSize = 32.sp,
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

enum class SleepMode {
    WAKE_TIME, SLEEP_TIME
}

fun calculateSleepTimes(
    mode: SleepMode,
    hour: Int,
    minute: Int,
    cycles: Int
): List<String> {
    val calendar = Calendar.getInstance()
    calendar.set(Calendar.HOUR_OF_DAY, hour)
    calendar.set(Calendar.MINUTE, minute)
    calendar.set(Calendar.SECOND, 0)

    val format = SimpleDateFormat("HH:mm", Locale.getDefault())
    val results = mutableListOf<String>()

    // Add 14 minutes for falling asleep
    val fallAsleepTime = 14

    if (mode == SleepMode.WAKE_TIME) {
        // Calculate wake times from current time
        val currentTime = Calendar.getInstance()
        currentTime.add(Calendar.MINUTE, fallAsleepTime)

        // Generate options for 4-6 cycles
        for (cycleCount in 4..6) {
            val wakeTime = currentTime.clone() as Calendar
            wakeTime.add(Calendar.MINUTE, cycleCount * 90)
            results.add("${format.format(wakeTime.time)} ($cycleCount циклов)")
        }
    } else {
        // Calculate sleep times for given wake time
        for (cycleCount in 4..6) {
            val sleepTime = calendar.clone() as Calendar
            sleepTime.add(Calendar.MINUTE, -(cycleCount * 90 + fallAsleepTime))
            results.add("${format.format(sleepTime.time)} ($cycleCount циклов)")
        }
    }

    return results
}
