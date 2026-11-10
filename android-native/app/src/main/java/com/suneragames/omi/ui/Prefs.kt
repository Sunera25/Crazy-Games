package com.suneragames.omi.ui

import android.content.Context
import java.util.Calendar

/** Native replacement for the web build's localStorage state. */
class Prefs(context: Context) {
    private val sp = context.getSharedPreferences("omi-native", Context.MODE_PRIVATE)

    var coins: Int
        get() = sp.getInt("coins", 100)
        set(v) = sp.edit().putInt("coins", v).apply()
    var gems: Int
        get() = sp.getInt("gems", 0)
        set(v) = sp.edit().putInt("gems", v).apply()
    var lastDaily: String
        get() = sp.getString("lastDaily", "") ?: ""
        set(v) = sp.edit().putString("lastDaily", v).apply()
    var lastRescue: String
        get() = sp.getString("lastRescue", "") ?: ""
        set(v) = sp.edit().putString("lastRescue", v).apply()
    var playerName: String
        get() = sp.getString("playerName", "Player") ?: "Player"
        set(v) = sp.edit().putString("playerName", v).apply()
    var muted: Boolean
        get() = sp.getBoolean("muted", false)
        set(v) = sp.edit().putBoolean("muted", v).apply()
    var played: Int
        get() = sp.getInt("played", 0)
        set(v) = sp.edit().putInt("played", v).apply()
    var won: Int
        get() = sp.getInt("won", 0)
        set(v) = sp.edit().putInt("won", v).apply()
    var streak: Int
        get() = sp.getInt("streak", 0)
        set(v) = sp.edit().putInt("streak", v).apply()
    var best: Int
        get() = sp.getInt("best", 0)
        set(v) = sp.edit().putInt("best", v).apply()
    var kapothis: Int
        get() = sp.getInt("kapothis", 0)
        set(v) = sp.edit().putInt("kapothis", v).apply()

    fun todayKey(): String {
        val c = Calendar.getInstance()
        return "${c.get(Calendar.YEAR)}-${c.get(Calendar.MONTH) + 1}-${c.get(Calendar.DAY_OF_MONTH)}"
    }
}
