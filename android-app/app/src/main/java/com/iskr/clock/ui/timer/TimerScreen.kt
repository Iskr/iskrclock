package com.iskr.clock.ui.timer

import androidx.compose.foundation.layout.*
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
fun TimerScreen() {
    var minutes by remember { mutableStateOf(5) }
    var seconds by remember { mutableStateOf(0) }
    var totalSeconds by remember { mutableStateOf(0) }
    var isRunning by remember { mutableStateOf(false) }
    var timeLeft by remember { mutableStateOf(0) }

    LaunchedEffect(isRunning) {
        if (isRunning && timeLeft > 0) {
            while (timeLeft > 0) {
                delay(1000)
                timeLeft--
            }
            isRunning = false
            // Timer finished - could play sound here
        }
    }

    Box(modifier = Modifier.fillMaxSize()) {
        FlowBackground()

        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
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
                        text = "⏱️ Таймер",
                        style = MaterialTheme.typography.headlineMedium,
                        fontWeight = FontWeight.Bold
                    )

                    Spacer(modifier = Modifier.height(32.dp))

                    if (isRunning) {
                        // Display countdown
                        Text(
                            text = formatTime(timeLeft),
                            fontSize = 64.sp,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.primary
                        )
                    } else {
                        // Time input
                        Row(
                            horizontalArrangement = Arrangement.Center,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            TimeInput(
                                value = minutes,
                                label = "Минуты",
                                onValueChange = { minutes = it.coerceIn(0, 99) }
                            )

                            Text(
                                text = ":",
                                fontSize = 48.sp,
                                modifier = Modifier.padding(horizontal = 16.dp)
                            )

                            TimeInput(
                                value = seconds,
                                label = "Секунды",
                                onValueChange = { seconds = it.coerceIn(0, 59) }
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(32.dp))

                    // Control buttons
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        Button(
                            onClick = {
                                if (!isRunning) {
                                    totalSeconds = minutes * 60 + seconds
                                    timeLeft = totalSeconds
                                    if (timeLeft > 0) {
                                        isRunning = true
                                    }
                                } else {
                                    isRunning = false
                                }
                            },
                            modifier = Modifier.weight(1f)
                        ) {
                            Text(if (isRunning) "Пауза" else "Старт")
                        }

                        Button(
                            onClick = {
                                isRunning = false
                                timeLeft = 0
                                minutes = 5
                                seconds = 0
                            },
                            modifier = Modifier.weight(1f),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = MaterialTheme.colorScheme.error
                            )
                        ) {
                            Text("Сброс")
                        }
                    }

                    // Progress indicator
                    if (isRunning && totalSeconds > 0) {
                        Spacer(modifier = Modifier.height(16.dp))
                        LinearProgressIndicator(
                            progress = timeLeft.toFloat() / totalSeconds.toFloat(),
                            modifier = Modifier.fillMaxWidth()
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun TimeInput(
    value: Int,
    label: String,
    onValueChange: (Int) -> Unit
) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(label, fontSize = 12.sp, color = Color.Gray)

        OutlinedTextField(
            value = String.format("%02d", value),
            onValueChange = { newValue ->
                newValue.toIntOrNull()?.let { onValueChange(it) }
            },
            modifier = Modifier.width(100.dp),
            textStyle = LocalTextStyle.current.copy(
                fontSize = 32.sp,
                fontWeight = FontWeight.Bold
            ),
            singleLine = true
        )
    }
}

private fun formatTime(totalSeconds: Int): String {
    val minutes = totalSeconds / 60
    val seconds = totalSeconds % 60
    return String.format("%02d:%02d", minutes, seconds)
}
