package com.dhwaniastrologer

import android.content.Context
import android.content.SharedPreferences

/**
 * Persistent SharedPreferences-backed TTL store used to deduplicate incoming
 * call/chat notifications and the Accept/Reject intents they generate.
 *
 * A key is treated as a duplicate when it was recorded within [DEFAULT_TTL_MS].
 * Entries older than the TTL are considered new (the stored timestamp is
 * refreshed). Old entries are pruned so the file stays bounded.
 */
class CallHandledStore(context: Context) {

    companion object {
        private const val PREFS_NAME = "call_notification_dedupe_prefs"
        private const val TS_PREFIX = "ts_"
        const val DEFAULT_TTL_MS = 120_000L
        private const val MAX_ENTRIES = 100
    }

    private val prefs: SharedPreferences =
        context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

    /**
     * @return true when [key] has NOT been recorded inside the TTL window
     *   (i.e. it is a NEW event). The key's timestamp is (re)stored in that
     *   case. Returns false when the key is already recorded and still fresh
     *   (i.e. it is a DUPLICATE).
     */
    fun isNew(key: String, ttlMs: Long = DEFAULT_TTL_MS): Boolean {
        val now = System.currentTimeMillis()
        val recordedAt = prefs.getLong(TS_PREFIX + key, -1L)
        if (recordedAt != -1L && now - recordedAt < ttlMs) {
            return false
        }
        prefs.edit().putLong(TS_PREFIX + key, now).apply()
        prune(now, ttlMs)
        return true
    }

    private fun prune(now: Long, ttlMs: Long) {
        val all = prefs.all
        if (all.size <= MAX_ENTRIES) {
            return
        }
        val editor = prefs.edit()
        var removed = 0
        all.forEach { (entryKey, value) ->
            if (entryKey.startsWith(TS_PREFIX) && value is Long && now - value >= ttlMs) {
                editor.remove(entryKey)
                removed++
            }
        }
        if (removed > 0) {
            editor.apply()
        }
    }
}
