package com.iskr.clock.ui.stopwatch

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.iskr.clock.ui.components.FlowBackground
import kotlinx.coroutines.delay

@Composable
fun StopwatchScreen() {
    var milliseconds by remember { mutableStateOf(0L) }
    var isRunning by remember { mutableStateOf(false) }
    var laps by remember { mutableStateOf(listOf<Long>()) }
    var lastLapTime by remember { mutableStateOf(0L) }

    LaunchedEffect(isRunning) {
        if (isRunning) {
            val startTime = System.currentTimeMillis() - milliseconds
            while (isRunning) {
                milliseconds = System.currentTimeMillis() - startTime
                delay(10)
            }
        }
    }

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
                        text = "⏲️ Секундомер",
                        style = MaterialTheme.typography.headlineMedium,
                        fontWeight = FontWeight.Bold
                    )

                    Spacer(modifier = Modifier.height(32.dp))

                    // Time display
                    Text(
                        text = formatStopwatchTime(milliseconds),
                        fontSize = 56.sp,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.primary
                    )

                    Spacer(modifier = Modifier.height(32.dp))

                    // Control buttons
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        Button(
                            onClick = {
                                isRunning = !isRunning
                            },
                            modifier = Modifier.weight(1f)
                        ) {
                            Text(if (isRunning) "Пауза" else if (milliseconds > 0) "Продолжить" else "Старт")
                        }

                        if (isRunning) {
                            Button(
                                onClick = {
                                    laps = laps + (milliseconds - lastLapTime)
                                    lastLapTime = milliseconds
                                },
                                modifier = Modifier.weight(1f)
                            ) {
                                Text("Круг")
                            }
                        } else {
                            Button(
                                onClick = {
                                    milliseconds = 0L
                                    laps = emptyList()
                                    lastLapTime = 0L
                                },
                                modifier = Modifier.weight(1f),
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = MaterialTheme.colorScheme.error
                                )
                            ) {
                                Text("Сброс")
                            }
                        }
                    }
                }
            }

            // Laps list
            if (laps.isNotEmpty()) {
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
                            text = "Круги",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold
                        )

                        Spacer(modifier = Modifier.height(8.dp))

                        LazyColumn {
                            itemsIndexed(laps.reversed()) { index, lapTime ->
                                val lapNumber = laps.size - index
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(vertical = 8.dp),
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Text("Круг $lapNumber")
                                    Text(
                                        text = formatStopwatchTime(lapTime),
                                        fontWeight = FontWeight.Bold
                                    )
                                }
                                if (index < laps.size - 1) {
                                    Divider()
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

private fun formatStopwatchTime(millis: Long): String {
    val totalSeconds = millis / 1000
    val minutes = totalSeconds / 60
    val seconds = totalSeconds % 60
    val millisDisplay = (millis % 1000) / 10
    return String.format("%02d:%02d.%02d", minutes, seconds, millisDisplay)
}
