package com.dhwaniastrologer

import android.content.Context
import android.content.SharedPreferences
import java.util.concurrent.ConcurrentHashMap

/**
 * Persistent SharedPreferences-backed TTL store used to deduplicate incoming
 * call/chat notifications and the Accept/Reject intents they generate.
 *
 * A key is treated as a duplicate when it was recorded within [DEFAULT_TTL_MS].
 * Entries older than the TTL are considered new (the stored timestamp is
 * refreshed). Old entries are pruned so the file stays bounded.
 *
 * Thread-safety / atomicity: OneSignal can invoke [CallNotificationServiceExtension.onNotificationReceived]
 * concurrently for the same notification from two different code paths (the
 * live FCM delivery and the SDK's NotificationRestoreWorker, which re-processes
 * every suppressed notification). To guarantee that two simultaneous calls for
 * the same key cannot BOTH report "new", the check-and-set is serialized under
 * a process-wide lock and backed by a static in-memory map shared by every
 * [CallHandledStore] instance in this process.
 *
 * Persistence / cold start: the record is flushed to disk synchronously via
 * [SharedPreferences.Editor.commit] BEFORE returning, so if the process is
 * killed right after handling the first delivery, a duplicate delivery arriving
 * in a recreated process still finds the persisted timestamp.
 */
class CallHandledStore(context: Context) {

    companion object {
        private const val PREFS_NAME = "call_notification_dedupe_prefs"
        private const val TS_PREFIX = "ts_"

        /**
         * TTL for a handled key. Must comfortably span OneSignal's restore
         * cadence (the SDK re-fires suppressed notifications on a ~15-30s
         * WorkManager schedule for as long as they stay in its store).
         */
        const val DEFAULT_TTL_MS = 600_000L

        private const val MAX_ENTRIES = 200
        private const val MAX_MEMORY_ENTRIES = 500

        /** Process-wide lock; static so all [CallHandledStore] instances share it. */
        private val lock = Any()

        /** Recently-handled keys in this process; static across all instances. */
        private val inMemoryHandled = ConcurrentHashMap<String, Long>()
    }

    private val prefs: SharedPreferences =
        context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

    /**
     * @return true when [key] has NOT been recorded inside the TTL window
     *   (i.e. it is a NEW event). The key's timestamp is (re)stored in that
     *   case, atomically. Returns false when the key is already recorded and
     *   still fresh (i.e. it is a DUPLICATE).
     */
    fun isNew(key: String, ttlMs: Long = DEFAULT_TTL_MS): Boolean {
        val now = System.currentTimeMillis()
        val memoryTs = inMemoryHandled[key]
        if (memoryTs != null && now - memoryTs < ttlMs) {
            return false
        }

        return synchronized(lock) {
            val nowSync = System.currentTimeMillis()
            val mem = inMemoryHandled[key]
            if (mem != null && nowSync - mem < ttlMs) {
                false
            } else {
                val recordedAt = prefs.getLong(TS_PREFIX + key, -1L)
                if (recordedAt != -1L && nowSync - recordedAt < ttlMs) {
                    inMemoryHandled[key] = recordedAt
                    false
                } else {
                    prefs.edit().putLong(TS_PREFIX + key, nowSync).commit()
                    inMemoryHandled[key] = nowSync
                    trimMemory(nowSync, ttlMs)
                    prune(nowSync, ttlMs)
                    true
                }
            }
        }
    }

    private fun trimMemory(now: Long, ttlMs: Long) {
        val it = inMemoryHandled.entries.iterator()
        var count = 0
        while (it.hasNext()) {
            val entry = it.next()
            count++
            if (count > MAX_MEMORY_ENTRIES || now - entry.value >= ttlMs) {
                it.remove()
            }
        }
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
