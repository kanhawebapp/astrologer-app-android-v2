package partner.dhwaniastro.com

import android.app.Activity
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.media.RingtoneManager
import android.os.Build
import android.util.Log
import androidx.core.app.NotificationCompat
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import org.json.JSONObject

class CallNotificationModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    companion object {
        const val PREFS_NAME = "call_notification_prefs"
        const val KEY_PENDING_ACTION = "pending_action"
        const val KEY_PENDING_DATA = "pending_data"
        const val CHANNEL_ID = "incoming_call_channel"
    }

    override fun getName(): String = "CallNotificationModule"

    @ReactMethod
    fun getPendingAction(promise: Promise) {
        try {
            val prefs = reactApplicationContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            val action = prefs.getString(KEY_PENDING_ACTION, null) ?: run {
                promise.resolve(null)
                return
            }
            if (
                action != "partner.dhwaniastro.com.ACCEPT_CALL" &&
                action != "partner.dhwaniastro.com.REJECT_CALL" &&
                action != "partner.dhwaniastro.com.ACCEPT_CHAT" &&
                action != "partner.dhwaniastro.com.REJECT_CHAT"
            ) {
                prefs.edit()
                    .remove(KEY_PENDING_ACTION)
                    .remove(KEY_PENDING_DATA)
                    .apply()
                promise.resolve(null)
                return
            }
            val json = prefs.getString(KEY_PENDING_DATA, null) ?: run {
                promise.resolve(null)
                return
            }

            Log.d("TRACE_NATIVE_6", json ?: "NULL")

            Log.d("TRACE_NATIVE_4", json)

            val result = Arguments.createMap()
            result.putString("action", action)

            val dataMap = Arguments.createMap()
            val jsonObject = JSONObject(json)
            jsonObject.keys().forEach { key ->
                Log.d("TRACE_NATIVE_4", "$key = ${jsonObject.optString(key)}")
                dataMap.putString(key, jsonObject.optString(key, ""))
            }
            result.putMap("data", dataMap)
            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("PENDING_ACTION_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun clearPendingAction(promise: Promise) {
        try {
            val prefs = reactApplicationContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            prefs.edit()
                .remove(KEY_PENDING_ACTION)
                .remove(KEY_PENDING_DATA)
                .apply()
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("CLEAR_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun getAppState(promise: Promise) {
        try {
            val activityManager = reactApplicationContext.getSystemService(Context.ACTIVITY_SERVICE) as android.app.ActivityManager
            val runningProcesses = activityManager.runningAppProcesses ?: run {
                promise.resolve(false)
                return
            }
            val packageName = reactApplicationContext.packageName
            val isForeground = runningProcesses.any { it.importance == android.app.ActivityManager.RunningAppProcessInfo.IMPORTANCE_FOREGROUND && it.processName == packageName }
            promise.resolve(isForeground)
        } catch (e: Exception) {
            promise.reject("APP_STATE_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun minimizeApp(promise: Promise) {
        try {
            val activity: Activity? = currentActivity
            if (activity != null) {
                activity.moveTaskToBack(true)
                promise.resolve(null)
            } else {
                promise.reject("NO_ACTIVITY", "No current activity found")
            }
        } catch (e: Exception) {
            promise.reject("MINIMIZE_ERROR", e.message, e)
        }
    }
}
