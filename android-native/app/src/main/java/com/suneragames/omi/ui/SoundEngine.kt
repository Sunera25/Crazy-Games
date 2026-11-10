package com.suneragames.omi.ui

import android.content.Context
import android.media.AudioAttributes
import android.media.AudioFormat
import android.media.AudioTrack
import android.media.MediaPlayer
import com.suneragames.omi.R
import kotlin.concurrent.thread
import kotlin.math.PI
import kotlin.math.sin
import kotlin.random.Random

/**
 * Native sound: the web build synthesizes its effects with Web Audio; here
 * the same kinds of sounds are synthesized as PCM and played via AudioTrack.
 * Music is the shared ambient loop (res/raw/ambient.mp3) on a MediaPlayer.
 */
class SoundEngine {
    @Volatile var muted: Boolean = false
    private var music: MediaPlayer? = null

    fun startMusic(context: Context) {
        try {
            if (music == null) {
                music = MediaPlayer.create(context.applicationContext, R.raw.ambient)?.apply {
                    isLooping = true
                }
            }
            applyMusicVolume()
            if (music?.isPlaying != true) music?.start()
        } catch (_: Exception) {
            // Music is decorative; never let it break the game.
        }
    }

    fun stopMusic() {
        try {
            if (music?.isPlaying == true) music?.pause()
        } catch (_: Exception) {
        }
    }

    fun applyMusicVolume() {
        val v = if (muted) 0f else 0.45f
        try {
            music?.setVolume(v, v)
        } catch (_: Exception) {
        }
    }

    fun click() = playNoise(durMs = 35, vol = 0.20, swell = false)
    fun deal() = playNoise(durMs = 80, vol = 0.30, swell = false)
    fun play() = playNoise(durMs = 150, vol = 0.30, swell = true)
    fun shuffle() = playNoise(durMs = 320, vol = 0.18, swell = true)
    fun score() = playTones(listOf(880.0 to 90), vol = 0.28)
    fun win() = playTones(listOf(523.25 to 110, 783.99 to 170), vol = 0.30)
    fun lose() = playTones(listOf(329.63 to 110, 261.63 to 170), vol = 0.26)

    private fun playTones(segments: List<Pair<Double, Int>>, vol: Double) {
        if (muted) return
        val totalMs = segments.sumOf { it.second }
        val count = SAMPLE_RATE * totalMs / 1000
        val samples = ShortArray(count)
        var offset = 0
        for ((freq, ms) in segments) {
            val n = SAMPLE_RATE * ms / 1000
            for (i in 0 until n) {
                val t = i.toDouble() / SAMPLE_RATE
                val envelope = 1.0 - (i.toDouble() / n) * 0.7
                val value = sin(2 * PI * freq * t) * vol * envelope
                if (offset + i < count) {
                    samples[offset + i] = (value * Short.MAX_VALUE).toInt().toShort()
                }
            }
            offset += n
        }
        playSamples(samples)
    }

    private fun playNoise(durMs: Int, vol: Double, swell: Boolean) {
        if (muted) return
        val count = SAMPLE_RATE * durMs / 1000
        val samples = ShortArray(count)
        var smoothed = 0.0
        for (i in 0 until count) {
            val white = Random.nextDouble(-1.0, 1.0)
            smoothed = smoothed * 0.72 + white * 0.28 // crude low-pass, softer snap
            val progress = i.toDouble() / count
            val envelope = if (swell) sin(PI * progress) else 1.0 - progress * 0.6
            samples[i] = (smoothed * vol * envelope * Short.MAX_VALUE).toInt().toShort()
        }
        playSamples(samples)
    }

    private fun playSamples(samples: ShortArray) {
        thread {
            try {
                val track = AudioTrack.Builder()
                    .setAudioAttributes(
                        AudioAttributes.Builder()
                            .setUsage(AudioAttributes.USAGE_GAME)
                            .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                            .build(),
                    )
                    .setAudioFormat(
                        AudioFormat.Builder()
                            .setEncoding(AudioFormat.ENCODING_PCM_16BIT)
                            .setSampleRate(SAMPLE_RATE)
                            .setChannelMask(AudioFormat.CHANNEL_OUT_MONO)
                            .build(),
                    )
                    .setBufferSizeInBytes(samples.size * 2)
                    .setTransferMode(AudioTrack.MODE_STATIC)
                    .build()
                track.write(samples, 0, samples.size)
                track.play()
                Thread.sleep(samples.size * 1000L / SAMPLE_RATE + 80)
                track.release()
            } catch (_: Exception) {
                // Audio device busy etc. — sound is best-effort.
            }
        }
    }

    companion object {
        private const val SAMPLE_RATE = 22050
    }
}
