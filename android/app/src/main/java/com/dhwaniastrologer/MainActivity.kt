package com.dhwaniastrologer

import android.app.Activity
import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.util.Log
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import org.json.JSONObject

class MainActivity : ReactActivity() {

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    handleIncomingNotificationIntent(intent)
  }

  override fun onNewIntent(intent: Intent) {
    super.onNewIntent(intent)
    setIntent(intent)
    handleIncomingNotificationIntent(intent)
  }

  override fun getMainComponentName(): String = "DhwaniAstrologer"

  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

  fun isAppInForeground(): Boolean {
    val activityManager = getSystemService(Context.ACTIVITY_SERVICE) as android.app.ActivityManager
    val runningProcesses = activityManager.runningAppProcesses ?: return false
    val packageName = packageName
    return runningProcesses.any { it.importance == android.app.ActivityManager.RunningAppProcessInfo.IMPORTANCE_FOREGROUND && it.processName == packageName }
  }

  private fun handleIncomingNotificationIntent(intent: Intent?) {
    if (intent == null) return

    Log.d("TRACE_NATIVE_4", "extras keySet=${intent.extras?.keySet()}")
    intent.extras?.keySet()?.forEach { key ->
      Log.d(
        "TRACE_NATIVE_4",
        "$key = ${intent.extras?.get(key)}"
      )
    }

    val action = intent.action ?: return
    if (
      action != "com.dhwaniastrologer.ACCEPT_CALL" &&
      action != "com.dhwaniastrologer.REJECT_CALL" &&
      action != "com.dhwaniastrologer.ACCEPT_CHAT" &&
      action != "com.dhwaniastrologer.REJECT_CHAT"
    ) {
      return
    }

    Log.d("MainActivity", "NATIVE_ACTION_RECEIVED action=$action")

    Log.d(
      "MainActivity",
      "ACTION_TS at=${System.currentTimeMillis()} action=$action " +
        "extras=[roomId=${intent.getStringExtra("extra_room_id")}, " +
        "callId=${intent.getStringExtra("extra_call_id")}, " +
        "callerId=${intent.getStringExtra("extra_caller_id")}, " +
        "callerName=${intent.getStringExtra("extra_caller_name")}, " +
        "astrologerId=${intent.getStringExtra("extra_astrologer_id")}, " +
        "callTime=${intent.getStringExtra("extra_call_time")}, " +
        "sessionId=${intent.getStringExtra("extra_session_id")}]",
    )

    val prefs = getSharedPreferences("call_notification_prefs", Context.MODE_PRIVATE)
    val roomId = intent.getStringExtra("extra_room_id") ?: ""
    val callId = intent.getStringExtra("extra_call_id") ?: ""
    val callerName = intent.getStringExtra("extra_caller_name") ?: ""
    val callerId = intent.getStringExtra("extra_caller_id") ?: ""
    val callerAvatar = intent.getStringExtra("extra_caller_avatar") ?: ""
val callTime = intent.getStringExtra("extra_call_time") ?: ""
    // Complete chat request payload forwarded from the notification.
    // These fields are required by the JS ChatRequestCard flow and must be
    // carried through so background/killed Accept/Reject behaves exactly like
    // foreground. No values are fabricated here; missing extras stay "".
    val sessionId = intent.getStringExtra("extra_session_id") ?: ""

    Log.d(
      "MainActivity",
      "INTENT_RECEIVED action=$action roomId=$roomId callId=$callId sessionId=$sessionId ts=${System.currentTimeMillis()}"
    )

 Log.d("TRACE_NATIVE_3", "extra_room_id=$roomId")
Log.d("TRACE_NATIVE_3", "extra_session_id=$sessionId")
Log.d("TRACE_NATIVE_3", "extra_call_time=$callTime")

    val userId = intent.getStringExtra("extra_user_id") ?: ""
    val astrologerId = intent.getStringExtra("extra_astrologer_id") ?: ""
    val userName = intent.getStringExtra("extra_user_name") ?: ""
    val maximumTime = intent.getStringExtra("extra_maximum_time") ?: ""
    val pricePerMinute = intent.getStringExtra("extra_price_per_minute") ?: ""
    val userProfilePic = intent.getStringExtra("extra_user_profile_pic") ?: ""
    val astrologerName = intent.getStringExtra("extra_astrologer_name") ?: ""
    val astrologerProfilePic = intent.getStringExtra("extra_astrologer_profile_pic") ?: ""
    val issue = intent.getStringExtra("extra_issue") ?: ""

    Log.d("TRACE_NATIVE_2", "extra_room_id = $roomId")
    Log.d("TRACE_NATIVE_2", "extra_session_id = $sessionId")

    Log.d(
    "MainActivity",
    "WRITING_PREFS action=$action " +
        "extras=[roomId=$roomId, " +
        "callId=$callId, " +
        "callerName=$callerName, " +
        "callerId=$callerId, " +
        "callerAvatar=$callerAvatar, " +
        "callTime=$callTime, " +
        "sessionId=$sessionId, " +
        "userId=$userId, " +
        "astrologerId=$astrologerId, " +
        "userName=$userName, " +
        "maximumTime=$maximumTime, " +
        "pricePerMinute=$pricePerMinute, " +
        "userProfilePic=$userProfilePic, " +
        "astrologerName=$astrologerName, " +
        "astrologerProfilePic=$astrologerProfilePic, " +
        "issue=$issue]"
)

   val dataMap = buildDataMap(
    roomId,
    callId,
    callerName,
    callerId,
    callerAvatar,
    callTime,
    sessionId,
    userId,
    astrologerId,
    userName,
    maximumTime,
    pricePerMinute,
    userProfilePic,
    astrologerName,
    astrologerProfilePic,
    issue
)
    Log.d("TRACE_NATIVE_2", "pending_data = $dataMap")

    Log.d("TRACE_NATIVE_3", dataMap.toString())

    Log.d("TRACE_NATIVE_5", dataMap.toString())

    val extraNotificationId = intent.getStringExtra("extra_notification_id") ?: ""
    val dedupeId = firstNonEmpty(extraNotificationId, callId, sessionId)
    val stableKey = if (dedupeId.isNotEmpty()) {
      "$dedupeId:$action"
    } else {
      "hash:${(roomId + callId + sessionId + callerId + callTime).hashCode()}:$action"
    }

    val dedupeStore = CallHandledStore(this)
    val isNew = dedupeStore.isNew(stableKey)
    Log.d(
      "MainActivity",
      "ACTION_DEDUPE action=$action key=$stableKey isNew=$isNew"
    )
    if (!isNew) {
      Log.d(
        "MainActivity",
        "DUPLICATE ACTION IGNORED action=$action key=$stableKey"
      )
      return
    }

    prefs.edit()
      .putString("pending_action", action)
      .putString("pending_data", dataMap)
      .apply()

    Log.d("MainActivity", "Stored pending action: $action for roomId: $roomId")
  }

 private fun buildDataMap(
    roomId: String,
    callId: String,
    callerName: String,
    callerId: String,
    callerAvatar: String,
    callTime: String,
    sessionId: String,
    userId: String,
    astrologerId: String,
    userName: String,
    maximumTime: String,
    pricePerMinute: String,
    userProfilePic: String,
    astrologerName: String,
    astrologerProfilePic: String,
    issue: String
): String {
    // Use JSONObject so string values are safely escaped into valid JSON.
    return JSONObject()
      .put("roomId", roomId)
      .put("callId", callId)
      .put("callerName", callerName)
      .put("callerId", callerId)
      .put("callerAvatar", callerAvatar)
      .put("callTime", callTime)
      .put("sessionId", sessionId)
      .put("userId", userId)
      .put("astrologerId", astrologerId)
      .put("userName", userName)
      .put("maximumTime", maximumTime)
      .put("pricePerMinute", pricePerMinute)
      .put("userProfilePic", userProfilePic)
      .put("astrologerName", astrologerName)
      .put("astrologerProfilePic", astrologerProfilePic)
      .put("issue", issue)
      .toString()
  }

  private fun firstNonEmpty(vararg values: String?): String {
    for (value in values) {
      if (value != null && value.isNotEmpty()) {
        return value
      }
    }
    return ""
  }
}
