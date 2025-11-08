package com.iskr.clock.media

import android.content.Context
import android.media.AudioAttributes
import android.media.MediaPlayer
import android.net.Uri
import androidx.media3.common.MediaItem
import androidx.media3.common.PlaybackException
import androidx.media3.common.Player
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.exoplayer.hls.HlsMediaSource
import androidx.media3.datasource.DefaultHttpDataSource
import com.iskr.clock.data.model.RadioStation
import com.iskr.clock.data.model.StationType
import kotlinx.coroutines.*

class AudioPlayer(private val context: Context) {

    private var exoPlayer: ExoPlayer? = null
    private var mediaPlayer: MediaPlayer? = null
    private var fadeInJob: Job? = null

    fun playAlarm(station: RadioStation?, fadeIn: Boolean) {
        stop()

        if (station == null || station.id == "classic_beep") {
            playClassicBeep(fadeIn)
        } else {
            when (station.type) {
                StationType.BUILT_IN -> playClassicBeep(fadeIn)
                StationType.LOCAL_FILE -> playLocalFile(station.localFilePath, fadeIn)
                StationType.RADIO_STREAM -> playStream(station.url, fadeIn)
                StationType.YOUTUBE -> playYouTube(station.url, fadeIn)
            }
        }
    }

    private fun playClassicBeep(fadeIn: Boolean) {
        // Using MediaPlayer for system default alarm sound
        mediaPlayer = MediaPlayer().apply {
            setAudioAttributes(
                AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_ALARM)
                    .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                    .build()
            )

            // Use system default alarm ringtone
            try {
                val alarmUri = android.media.RingtoneManager.getDefaultUri(
                    android.media.RingtoneManager.TYPE_ALARM
                ) ?: android.media.RingtoneManager.getDefaultUri(
                    android.media.RingtoneManager.TYPE_NOTIFICATION
                )

                setDataSource(context, alarmUri)
                isLooping = true
                prepare()

                if (fadeIn) {
                    setVolume(0f, 0f)
                    start()
                    startFadeIn(this)
                } else {
                    setVolume(1f, 1f)
                    start()
                }
            } catch (e: Exception) {
                e.printStackTrace()
                // If all fails, at least vibrate
            }
        }
    }

    private fun playLocalFile(filePath: String?, fadeIn: Boolean) {
        if (filePath == null) {
            playClassicBeep(fadeIn)
            return
        }

        mediaPlayer = MediaPlayer().apply {
            setAudioAttributes(
                AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_ALARM)
                    .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
                    .build()
            )

            try {
                setDataSource(filePath)
                isLooping = true
                prepare()

                if (fadeIn) {
                    setVolume(0f, 0f)
                    start()
                    startFadeIn(this)
                } else {
                    setVolume(1f, 1f)
                    start()
                }
            } catch (e: Exception) {
                e.printStackTrace()
                playClassicBeep(fadeIn)
            }
        }
    }

    private fun playStream(url: String, fadeIn: Boolean) {
        exoPlayer = ExoPlayer.Builder(context).build().apply {
            val mediaItem = MediaItem.fromUri(url)

            // Check if HLS stream
            val mediaSource = if (url.contains(".m3u8") || url.contains("hls")) {
                val dataSourceFactory = DefaultHttpDataSource.Factory()
                HlsMediaSource.Factory(dataSourceFactory)
                    .createMediaSource(mediaItem)
            } else {
                null
            }

            if (mediaSource != null) {
                setMediaSource(mediaSource)
            } else {
                setMediaItem(mediaItem)
            }

            repeatMode = Player.REPEAT_MODE_ALL

            addListener(object : Player.Listener {
                override fun onPlayerError(error: PlaybackException) {
                    // Fallback to classic beep on error
                    playClassicBeep(fadeIn)
                }
            })

            prepare()

            if (fadeIn) {
                volume = 0f
                play()
                startFadeInExo(this)
            } else {
                volume = 1f
                play()
            }
        }
    }

    private fun playYouTube(url: String, fadeIn: Boolean) {
        // For YouTube, we'll extract the audio stream URL
        // In a real app, you'd use YouTube API or a library
        // For simplicity, we'll fall back to classic beep
        playClassicBeep(fadeIn)
    }

    private fun startFadeIn(player: MediaPlayer) {
        fadeInJob?.cancel()
        fadeInJob = CoroutineScope(Dispatchers.Main).launch {
            val duration = 30_000L // 30 seconds
            val steps = 100
            val stepDuration = duration / steps
            val volumeIncrement = 1f / steps

            var currentVolume = 0f
            repeat(steps) {
                currentVolume += volumeIncrement
                player.setVolume(currentVolume, currentVolume)
                delay(stepDuration)
            }
            player.setVolume(1f, 1f)
        }
    }

    private fun startFadeInExo(player: ExoPlayer) {
        fadeInJob?.cancel()
        fadeInJob = CoroutineScope(Dispatchers.Main).launch {
            val duration = 30_000L // 30 seconds
            val steps = 100
            val stepDuration = duration / steps
            val volumeIncrement = 1f / steps

            var currentVolume = 0f
            repeat(steps) {
                currentVolume += volumeIncrement
                player.volume = currentVolume
                delay(stepDuration)
            }
            player.volume = 1f
        }
    }

    fun stop() {
        fadeInJob?.cancel()

        mediaPlayer?.apply {
            if (isPlaying) stop()
            release()
        }
        mediaPlayer = null

        exoPlayer?.apply {
            stop()
            release()
        }
        exoPlayer = null
    }
}
