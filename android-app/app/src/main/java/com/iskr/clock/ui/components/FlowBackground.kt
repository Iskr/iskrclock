package com.iskr.clock.ui.components

import androidx.compose.animation.core.*
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import com.iskr.clock.ui.theme.FlowColors
import java.util.Calendar

enum class TimeOfDay {
    DAWN, DAY, DUSK, NIGHT
}

fun getCurrentTimeOfDay(): TimeOfDay {
    val hour = Calendar.getInstance().get(Calendar.HOUR_OF_DAY)
    return when (hour) {
        in 5..7 -> TimeOfDay.DAWN
        in 8..16 -> TimeOfDay.DAY
        in 17..19 -> TimeOfDay.DUSK
        else -> TimeOfDay.NIGHT
    }
}

fun getGradientColors(timeOfDay: TimeOfDay): List<Color> {
    return when (timeOfDay) {
        TimeOfDay.DAWN -> listOf(
            FlowColors.DawnStart,
            FlowColors.DawnMid,
            FlowColors.DawnEnd
        )
        TimeOfDay.DAY -> listOf(
            FlowColors.DayStart,
            FlowColors.DayMid,
            FlowColors.DayEnd
        )
        TimeOfDay.DUSK -> listOf(
            FlowColors.DuskStart,
            FlowColors.DuskMid,
            FlowColors.DuskEnd
        )
        TimeOfDay.NIGHT -> listOf(
            FlowColors.NightStart,
            FlowColors.NightMid,
            FlowColors.NightEnd
        )
    }
}

@Composable
fun FlowBackground(modifier: Modifier = Modifier) {
    val timeOfDay by remember {
        mutableStateOf(getCurrentTimeOfDay())
    }

    val infiniteTransition = rememberInfiniteTransition(label = "flow")

    val animatedProgress by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 10000, easing = LinearEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "gradient_animation"
    )

    val colors = getGradientColors(timeOfDay)

    Canvas(modifier = modifier.fillMaxSize()) {
        val width = size.width
        val height = size.height

        // Animated gradient offset
        val gradientOffset = animatedProgress * height * 0.3f

        drawRect(
            brush = Brush.verticalGradient(
                colors = colors,
                startY = -gradientOffset,
                endY = height + gradientOffset
            )
        )

        // Add subtle overlay patterns based on time of day
        when (timeOfDay) {
            TimeOfDay.NIGHT -> {
                // Draw stars
                val starCount = 20
                for (i in 0 until starCount) {
                    val x = (width * ((i * 37) % 100) / 100f)
                    val y = (height * ((i * 53) % 100) / 100f)
                    val alpha = (0.3f + (i % 3) * 0.2f)

                    drawCircle(
                        color = Color.White.copy(alpha = alpha),
                        radius = 2f,
                        center = Offset(x, y)
                    )
                }
            }
            TimeOfDay.DAY -> {
                // Draw sun
                drawCircle(
                    color = Color(0xFFFFE066).copy(alpha = 0.6f),
                    radius = 80f,
                    center = Offset(width * 0.85f, height * 0.15f)
                )
            }
            TimeOfDay.DAWN, TimeOfDay.DUSK -> {
                // Draw clouds
                val cloudAlpha = 0.2f
                drawCircle(
                    color = Color.White.copy(alpha = cloudAlpha),
                    radius = 60f,
                    center = Offset(width * 0.3f, height * 0.2f)
                )
                drawCircle(
                    color = Color.White.copy(alpha = cloudAlpha),
                    radius = 70f,
                    center = Offset(width * 0.7f, height * 0.25f)
                )
            }
        }
    }
}
