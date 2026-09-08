package com.dhwaniastrologer

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.graphics.BitmapFactory
import android.media.RingtoneManager
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.os.PowerManager
import androidx.core.app.NotificationCompat
import androidx.core.content.ContextCompat
import com.onesignal.notifications.INotification
import com.onesignal.notifications.INotificationServiceExtension
import com.onesignal.notifications.INotificationReceivedEvent
import org.json.JSONObject
private data class Quad(
    val title: String,
    val body: String,
    val acceptLabel: String,
    val rejectLabel: String
)

class CallNotificationServiceExtension : INotificationServiceExtension {

    companion object {
        private const val SCREEN_WAKE_TAG = "ONESIGNAL_SCREEN_WAKE"
        private const val SCREEN_WAKE_MS = 10_000L
        private val screenWakeHandler = Handler(Looper.getMainLooper())
        @Volatile
        private var screenWakeLock: PowerManager.WakeLock? = null

        private val releaseScreenWakeLockRunnable = Runnable {
            releaseScreenWakeLock("timeout")
        }

        private fun releaseScreenWakeLock(reason: String) {
            screenWakeHandler.removeCallbacks(releaseScreenWakeLockRunnable)
            val wakeLock = screenWakeLock
            if (wakeLock == null) {
                android.util.Log.d(SCREEN_WAKE_TAG, "WakeLock released skipped ($reason): none held")
                return
            }
            try {
                if (wakeLock.isHeld) {
                    wakeLock.release()
                    android.util.Log.d(SCREEN_WAKE_TAG, "WakeLock released ($reason)")
                } else {
                    android.util.Log.d(SCREEN_WAKE_TAG, "WakeLock already released ($reason)")
                }
            } catch (e: Exception) {
                android.util.Log.e(SCREEN_WAKE_TAG, "WakeLock release failed ($reason)", e)
            } finally {
                screenWakeLock = null
            }
        }
    }

    override fun onNotificationReceived(event: INotificationReceivedEvent) {
        android.util.Log.d(
            SCREEN_WAKE_TAG,
            "notification received sdk=${Build.VERSION.SDK_INT}"
        )
        wakeScreenIfOff(event.context)

        val notification = event.notification
        val additionalData = notification.additionalData
 android.util.Log.d("ONESIGNAL_PAYLOAD", "==============================")
    android.util.Log.d("ONESIGNAL_PAYLOAD", "Title = ${notification.title}")
    android.util.Log.d("ONESIGNAL_PAYLOAD", "Body = ${notification.body}")

    android.util.Log.d(
        "ONESIGNAL_PAYLOAD",
        "additionalData = ${additionalData?.toString(4)}"
    )

    additionalData?.keys()?.forEach { key ->
        android.util.Log.d(
            "ONESIGNAL_PAYLOAD",
            "$key = ${additionalData.opt(key)}"
        )
    }

    android.util.Log.d("ONESIGNAL_PAYLOAD", "==============================")

        android.util.Log.d("TRACE_NATIVE_1", "FULL additionalData")
        android.util.Log.d("TRACE_NATIVE_1", additionalData?.toString(4) ?: "null")

        android.util.Log.d(
            "CallExtension",
            "onNotificationReceived() invoked. notification=$notification additionalData=${additionalData.toString()}"
        )

        val notificationType = firstNonEmpty(
            additionalData?.optString("type", ""),
            additionalData?.optString("notificationType", ""),
            additionalData?.optString("requestType", "")
        )

        android.util.Log.d(
            "CallExtension",
            "Parsed additionalData types: notificationType=$notificationType"
        )

        val normalizedType = when (notificationType.lowercase()) {
            "call",
            "call_request" -> "call"

            "chat",
            "chat_request" -> "chat"

            else -> notificationType.lowercase()
        }

        android.util.Log.d(
            "CallExtension",
            "Normalized notification type: notificationType=$notificationType normalizedType=$normalizedType"
        )

        android.util.Log.d(
            "CallExtension",
            "Branch check: notificationType == call_request ? ${notificationType == "call_request"}"
        )

        val notificationKey = buildNotificationKey(notification)

        android.util.Log.d(
            "CallNotificationDedupe",
            "received notificationId=${notification.notificationId} dedupeKey=$notificationKey"
        )

        val roomIdForLog = firstNonEmpty(
            additionalData?.optString("roomId", ""),
            additionalData?.optString("room_id", "")
        )
        val callIdForLog = firstNonEmpty(
            additionalData?.optString("callId", ""),
            additionalData?.optString("call_id", "")
        )
        val sessionIdForLog = firstNonEmpty(
            additionalData?.optString("sessionId", ""),
            additionalData?.optString("session_id", ""),
            additionalData?.optString("chatRequestId", ""),
            additionalData?.optString("chat_request_id", "")
        )

        if (normalizedType == "call" || normalizedType == "chat") {
            android.util.Log.d(
                "NATIVE_NOTIFICATION",
                "notification received - no action"
            )
            val inForeground = isAppInForeground(event.context)
            android.util.Log.d(
                "CallExtension",
                "ENTERED: call/chat custom notification branch (notificationType=$notificationType). InForeground=$inForeground"
            )
            android.util.Log.d(
                "CallExtension",
                "request branch entered (call_request/chat_request). isAppInForeground=$inForeground"
            )

            android.util.Log.d("ANDROID_CALL_PAYLOAD", "notificationId=${notification.notificationId}")
            android.util.Log.d("ANDROID_CALL_PAYLOAD", "type=$notificationType")
            android.util.Log.d(
                "ANDROID_CALL_PAYLOAD",
                "callTime=${firstNonEmpty(additionalData?.optString("callTime", ""), additionalData?.optString("call_time", ""))}"
            )
            android.util.Log.d(
                "ANDROID_CALL_PAYLOAD",
                "callerId=${firstNonEmpty(additionalData?.optString("callerId", ""), additionalData?.optString("caller_id", ""))}"
            )
            android.util.Log.d(
                "ANDROID_CALL_PAYLOAD",
                "idd=${firstNonEmpty(additionalData?.optString("idd", ""), additionalData?.optString("id", ""))}"
            )
            android.util.Log.d(
                "ANDROID_CALL_PAYLOAD",
                "receiverId=${firstNonEmpty(additionalData?.optString("receiverId", ""), additionalData?.optString("receiver_id", ""), additionalData?.optString("receiverid", ""))}"
            )
            android.util.Log.d(
                "ANDROID_CALL_PAYLOAD",
                "room_id=${firstNonEmpty(additionalData?.optString("roomId", ""), additionalData?.optString("room_id", ""))}"
            )
            android.util.Log.d(
                "ANDROID_CALL_PAYLOAD",
                "userName=${firstNonEmpty(additionalData?.optString("userName", ""), additionalData?.optString("user_name", ""))}"
            )

            val requestType = if (normalizedType == "chat") "chat_request" else "call_request"

            val sdkNotificationId = notification.notificationId

            val pid = android.os.Process.myPid()
            val tid = android.os.Process.myTid()

            android.util.Log.d(
                "ANDROID_CALL_DEDUPE",
                "RECEIVED notificationId=$sdkNotificationId key=$notificationKey pid=$pid tid=$tid"
            )

            val dedupeStore = CallHandledStore(event.context)
            val isNew = dedupeStore.isNew(notificationKey)

            android.util.Log.d(
                "ANDROID_CALL_DEDUPE",
                if (isNew)
                    "MARKED_HANDLED notificationId=$sdkNotificationId key=$notificationKey pid=$pid tid=$tid"
                else
                    "DROPPED_DUPLICATE notificationId=$sdkNotificationId key=$notificationKey pid=$pid tid=$tid"
            )

            android.util.Log.d("CallNotificationDedupe", "notificationId=$sdkNotificationId")
            android.util.Log.d("CallNotificationDedupe", "roomId=$roomIdForLog")
            android.util.Log.d(
                "CallNotificationDedupe",
                if (isNew) "first occurrence -> processing"
                else "duplicate -> SKIPPED"
            )

            android.util.Log.d(
                "CallExtension",
                "NOTIFICATION_RECEIVED notificationId=$notificationKey callId=$callIdForLog sessionId=$sessionIdForLog roomId=$roomIdForLog requestType=$requestType duplicate=${!isNew} foreground=$inForeground"
            )

            if (!isNew) {
                event.preventDefault()
                android.util.Log.d(
                    "ANDROID_CALL_DEDUPE",
                    "DROPPED_DUPLICATE notificationId=$sdkNotificationId key=$notificationKey (preventDefault, no processing)"
                )
                android.util.Log.d(
                    "CallNotificationDedupe",
                    "notificationId=$sdkNotificationId SKIPPED (not posting custom notification)"
                )
                android.util.Log.d(
                    "CallExtension",
                    "DUPLICATE NOTIFICATION: preventDefault() called, returning without showCustomNotification(). customNotificationPosted=false"
                )
                return
            }

            if (inForeground) {
                android.util.Log.d(
                    "CallExtension",
                    "About to call event.preventDefault() (foreground)."
                )
                event.preventDefault()
                android.util.Log.d(
                    "CallExtension",
                    "event.preventDefault() returned (foreground)."
                )
                android.util.Log.d(
                    "CallExtension",
                    "Returning without showCustomNotification() due to foreground request. customNotificationPosted=false"
                )
                return
            }

            android.util.Log.d("CallExtension", "About to call event.preventDefault() (background).")
            event.preventDefault()
            android.util.Log.d("CallExtension", "event.preventDefault() returned (background).")

            android.util.Log.d("CallExtension", "About to call showCustomNotification().")

            android.util.Log.d(
                "ANDROID_CALL_DEDUPE",
                "ACCEPTED notificationId=$sdkNotificationId key=$notificationKey pid=$pid tid=$tid -> showCustomNotification()"
            )

            // Prefer additionalData name fields over OneSignal title. Title is often
            // a generic heading ("Incoming Call") and would hide the real callerName.
            val callerName = firstNonEmpty(
                additionalData?.optString("callerName", ""),
                additionalData?.optString("caller_name", ""),
                additionalData?.optString("userName", ""),
                additionalData?.optString("user_name", ""),
                notification.title
            ).ifEmpty { "Unknown Caller" }

            val (title, body, acceptLabel, rejectLabel) = if (normalizedType == "chat") {
                Quad(
                    "Incoming Chat Request",
                    "$callerName wants to start a chat.",
                    "Accept",
                    "Reject"
                )
            } else {
                Quad(
                    callerName,
                    "Incoming call",
                    "Accept",
                    "Reject"
                )
            }

            try {
                showCustomNotification(
                    event.context,
                    notification,
                    notificationKey,
                    requestType,
                    title,
                    body,
                    acceptLabel,
                    rejectLabel
                )
                android.util.Log.d(
                    "CallExtension",
                    "Returned from showCustomNotification(). customNotificationPosted=true"
                )
            } catch (e: Exception) {
                android.util.Log.e(
                    "CallExtension",
                    "showCustomNotification() failed. preventDefault() was already called so no default notification is displayed (avoids duplicate notifications). customNotificationPosted=false",
                    e
                )
            }
        } else {
            android.util.Log.d(
                "CallExtension",
                "Non-call_request branch taken. Calling notification.display() for fallback OneSignal notification UI. notificationType=$notificationType"
            )
            notification.display()
        }
    }

    private fun wakeScreenIfOff(context: Context) {
        android.util.Log.d(SCREEN_WAKE_TAG, "wake code executed")
        try {
            val powerManager =
                context.applicationContext.getSystemService(Context.POWER_SERVICE) as PowerManager
            val isScreenOn = powerManager.isInteractive
            android.util.Log.d(SCREEN_WAKE_TAG, "isInteractive=$isScreenOn")
            if (isScreenOn) {
                android.util.Log.d(SCREEN_WAKE_TAG, "screen already on, skip wake")
                return
            }

            screenWakeHandler.post {
                try {
                    releaseScreenWakeLock("replace")
                    @Suppress("DEPRECATION")
                    val wakeLock = powerManager.newWakeLock(
                        PowerManager.FULL_WAKE_LOCK or
                            PowerManager.ACQUIRE_CAUSES_WAKEUP or
                            PowerManager.ON_AFTER_RELEASE,
                        "com.dhwaniastrologer:onesignal_screen_wake"
                    )
                    wakeLock.setReferenceCounted(false)
                    screenWakeLock = wakeLock
                    wakeLock.acquire(SCREEN_WAKE_MS)
                    android.util.Log.d(
                        SCREEN_WAKE_TAG,
                        "WakeLock acquired held=${wakeLock.isHeld}"
                    )
                    screenWakeHandler.removeCallbacks(releaseScreenWakeLockRunnable)
                    screenWakeHandler.postDelayed(releaseScreenWakeLockRunnable, SCREEN_WAKE_MS)
                } catch (e: Exception) {
                    android.util.Log.e(SCREEN_WAKE_TAG, "WakeLock acquire failed", e)
                }
            }
        } catch (e: Exception) {
            android.util.Log.e(SCREEN_WAKE_TAG, "wakeScreenIfOff failed", e)
        }
    }

    private fun isAppInForeground(context: Context): Boolean {
        val activityManager = context.getSystemService(Context.ACTIVITY_SERVICE) as android.app.ActivityManager
        val runningProcesses = activityManager.runningAppProcesses ?: return false
        val packageName = context.packageName
        return runningProcesses.any { it.importance == android.app.ActivityManager.RunningAppProcessInfo.IMPORTANCE_FOREGROUND && it.processName == packageName }
    }

    private fun showCustomNotification(
        context: Context,
        osNotification: com.onesignal.notifications.INotification,
        notificationKey: String,
        requestType: String?,
        title: String,
        body: String,
        acceptLabel: String,
        rejectLabel: String
    ) {
        val additionalData = osNotification.additionalData

        android.util.Log.d("TRACE_NATIVE_1", "RAW additionalData:")
        android.util.Log.d("TRACE_NATIVE_1", additionalData?.toString() ?: "null")
        android.util.Log.d("TRACE_NATIVE_1", "roomId=${additionalData?.optString("roomId")}")
        android.util.Log.d("TRACE_NATIVE_1", "room_id=${additionalData?.optString("room_id")}")
        android.util.Log.d("TRACE_NATIVE_1", "sessionId=${additionalData?.optString("sessionId")}")
        android.util.Log.d("TRACE_NATIVE_1", "session_id=${additionalData?.optString("session_id")}")
        android.util.Log.d("TRACE_NATIVE_1", "chatRequestId=${additionalData?.optString("chatRequestId")}")
        android.util.Log.d("TRACE_NATIVE_1", "chat_request_id=${additionalData?.optString("chat_request_id")}")

        android.util.Log.d("TRACE_NATIVE_1", "additionalData = ${additionalData?.toString()}")

        android.util.Log.d("TRACE_NATIVE_1", "roomId(raw camel) = ${additionalData?.optString("roomId")}")
        android.util.Log.d("TRACE_NATIVE_1", "room_id(raw snake) = ${additionalData?.optString("room_id")}")

        android.util.Log.d("TRACE_NATIVE_1", "sessionId(raw camel) = ${additionalData?.optString("sessionId")}")
        android.util.Log.d("TRACE_NATIVE_1", "session_id(raw snake) = ${additionalData?.optString("session_id")}")

        val roomId = firstNonEmpty(
            additionalData?.optString("roomId", ""),
            additionalData?.optString("room_id", "")
        )

        android.util.Log.d("TRACE_NATIVE_1", "final roomId = $roomId")

        android.util.Log.d(
            "CallNotificationDedupe",
            "final room_id=$roomId notificationId=${osNotification.notificationId}"
        )

        val idd = firstNonEmpty(
            additionalData?.optString("idd", ""),
            additionalData?.optString("id", "")
        )

        val callId = firstNonEmpty(
            additionalData?.optString("callId", ""),
            additionalData?.optString("call_id", ""),
            additionalData?.optString("sessionId", ""),
            additionalData?.optString("session_id", ""),
            additionalData?.optString("chatRequestId", ""),
            additionalData?.optString("chat_request_id", "")
        )

        // Prefer additionalData name fields over OneSignal title so kill-mode
        // Accept/Reject pending data carries the real callerName into JS.
        val callerName = firstNonEmpty(
            additionalData?.optString("callerName", ""),
            additionalData?.optString("caller_name", ""),
            additionalData?.optString("userName", ""),
            additionalData?.optString("user_name", ""),
            osNotification.title
        ).ifEmpty { "Unknown Caller" }

        val callerId = firstNonEmpty(
            additionalData?.optString("callerId", ""),
            additionalData?.optString("caller_id", ""),
            additionalData?.optString("userId", ""),
            additionalData?.optString("user_id", "")
        )

        val callerAvatar = firstNonEmpty(
            additionalData?.optString("callerAvatar", ""),
            additionalData?.optString("caller_avatar", ""),
            additionalData?.optString("userAvatar", ""),
            additionalData?.optString("user_avatar", "")
        )

        val sessionId = firstNonEmpty(
            additionalData?.optString("sessionId", ""),
            additionalData?.optString("session_id", ""),
            additionalData?.optString("chatRequestId", ""),
            additionalData?.optString("chat_request_id", "")
        )

        android.util.Log.d("TRACE_NATIVE_1", "final sessionId = $sessionId")

        val userId = firstNonEmpty(
            additionalData?.optString("userId", ""),
            additionalData?.optString("user_id", "")
        )
        val astrologerId = firstNonEmpty(
            additionalData?.optString("astrologerId", ""),
            additionalData?.optString("astrologer_id", ""),
            additionalData?.optString("astro_id", "")
        )
        val userName = firstNonEmpty(
            additionalData?.optString("userName", ""),
            additionalData?.optString("user_name", "")
        )
        val maximumTime = firstNonEmpty(
            additionalData?.optString("maximumTime", ""),
            additionalData?.optString("maximum_time", "")
        )
        val callTime = firstNonEmpty(
            additionalData?.optString("callTime", ""),
            additionalData?.optString("call_time", "")
        )
        val pricePerMinute = firstNonEmpty(
            additionalData?.optString("pricePerMinute", ""),
            additionalData?.optString("price_per_minute", "")
        )
        val userProfilePic = firstNonEmpty(
            additionalData?.optString("userProfilePic", ""),
            additionalData?.optString("user_profile_pic", ""),
            additionalData?.optString("profilePic", "")
        )
        val astrologerName = firstNonEmpty(
            additionalData?.optString("astrologerName", ""),
            additionalData?.optString("astrologer_name", "")
        )
        val astrologerProfilePic = firstNonEmpty(
            additionalData?.optString("astrologerProfilePic", ""),
            additionalData?.optString("astrologer_profile_pic", "")
        )
        val issue = firstNonEmpty(
            additionalData?.optString("issue", "")
        )
        val occupation = firstNonEmpty(
    additionalData?.optString("occupation", "")
)

val gender = firstNonEmpty(
    additionalData?.optString("gender", "")
)

val dateOfBirth = firstNonEmpty(
    additionalData?.optString("dateOfBirth", ""),
    additionalData?.optString("date_of_birth", "")
)

val location = firstNonEmpty(
    additionalData?.optString("location", "")
)

val timeOfBirth = firstNonEmpty(
    additionalData?.optString("timeOfBirth", "")
)


        val dataJson = JSONObject(mapOf(
            "roomId" to roomId,
            "callId" to callId,
            "callerName" to callerName,
            "callerId" to callerId,
            "callerAvatar" to callerAvatar,
            "sessionId" to sessionId,
            "userId" to userId,
            "astrologerId" to astrologerId,
            "userName" to userName,
            "maximumTime" to maximumTime,
            "callTime" to callTime,
            "pricePerMinute" to pricePerMinute,
            "userProfilePic" to userProfilePic,
            "astrologerName" to astrologerName,
            "astrologerProfilePic" to astrologerProfilePic,
            "issue" to issue,
             "occupation" to occupation,
            "gender" to gender,
            "dateOfBirth" to dateOfBirth,
            "location" to location,
            "timeOfBirth" to timeOfBirth

        ).toMap()).toString()

        android.util.Log.d("TRACE_NATIVE_2", dataJson)

        android.util.Log.d("TRACE_NATIVE_2", dataJson.toString())

        android.util.Log.d("TRACE_NATIVE_3", dataJson)

        val acceptAction = when (requestType) {
            "chat_request" -> "com.dhwaniastrologer.ACCEPT_CHAT"
            else -> "com.dhwaniastrologer.ACCEPT_CALL"
        }

        val rejectAction = when (requestType) {
            "chat_request" -> "com.dhwaniastrologer.REJECT_CHAT"
            else -> "com.dhwaniastrologer.REJECT_CALL"
        }

        val acceptIntent = Intent(context, MainActivity::class.java).apply {
            action = acceptAction
            putExtra("extra_notification_id", notificationKey)
            putExtra("extra_room_id", roomId)
            putExtra("extra_call_id", callId)
            putExtra("extra_idd", idd)
            putExtra("extra_caller_name", callerName)
            putExtra("extra_caller_id", callerId)
            putExtra("extra_caller_avatar", callerAvatar)
            putExtra("extra_session_id", sessionId)
            putExtra("extra_user_id", userId)
            putExtra("extra_astrologer_id", astrologerId)
            putExtra("extra_user_name", userName)
            putExtra("extra_maximum_time", maximumTime)
            putExtra("extra_call_time", callTime)
            putExtra("extra_price_per_minute", pricePerMinute)
            putExtra("extra_user_profile_pic", userProfilePic)
            putExtra("extra_astrologer_name", astrologerName)
            putExtra("extra_astrologer_profile_pic", astrologerProfilePic)
            putExtra("extra_issue", issue)
            putExtra("extra_occupation", occupation)
            putExtra("extra_gender", gender)
            putExtra("extra_date_of_birth", dateOfBirth)
            putExtra("extra_location", location)
            putExtra("extra_time_of_birth", timeOfBirth)

            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP)
        }


        val rejectIntent = Intent(context, MainActivity::class.java).apply {
            action = rejectAction
            putExtra("extra_notification_id", notificationKey)
            putExtra("extra_room_id", roomId)
            putExtra("extra_call_id", callId)
            putExtra("extra_idd", idd)
            putExtra("extra_caller_name", callerName)
            putExtra("extra_caller_id", callerId)
            putExtra("extra_caller_avatar", callerAvatar)
            putExtra("extra_session_id", sessionId)
            putExtra("extra_user_id", userId)
            putExtra("extra_astrologer_id", astrologerId)
            putExtra("extra_user_name", userName)
            putExtra("extra_maximum_time", maximumTime)
            putExtra("extra_call_time", callTime)
            putExtra("extra_price_per_minute", pricePerMinute)
            putExtra("extra_user_profile_pic", userProfilePic)
            putExtra("extra_astrologer_name", astrologerName)
            putExtra("extra_astrologer_profile_pic", astrologerProfilePic)
            putExtra("extra_issue", issue)
            // Chat user details
            putExtra("extra_occupation", occupation)
            putExtra("extra_gender", gender)
            putExtra("extra_date_of_birth", dateOfBirth)
            putExtra("extra_location", location)
            putExtra("extra_time_of_birth", timeOfBirth)

            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP)
        }


        val acceptPendingIntent = PendingIntent.getActivity(
            context,
            ("$notificationKey:accept:$requestType").hashCode(),
            acceptIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val rejectPendingIntent = PendingIntent.getActivity(
            context,
            ("$notificationKey:reject:$requestType").hashCode(),
            rejectIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val notificationId = notificationKey.hashCode() and 0x7fffffff

        android.util.Log.d(
            "ANDROID_CALL_ROOM",
            "final room_id=$roomId notificationId=${osNotification.notificationId}"
        )
        createNotificationChannel(context)

        val notification = buildActionOnlyNotification(
            context,
            title,
            body,
            acceptLabel,
            rejectLabel,
            acceptPendingIntent,
            rejectPendingIntent
        )
        android.util.Log.d(
            "CallExtension",
            "API=${Build.VERSION.SDK_INT} [showCustomNotification] DUMP notification before notify: [icon=$title, channel=incoming_call_channel, category=CATEGORY_CALL, priority=HIGH, ongoing=true, fullScreen=false, contentIntent=none, style=none, notificationId=$notificationId, requestType=$requestType, acceptAction=$acceptAction, rejectAction=$rejectAction]"
        )
        val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        manager.notify(notificationId, notification)
        android.util.Log.d(
            "NATIVE_NOTIFICATION",
            "notification displayed - action buttons only"
        )
        android.util.Log.d(
            "CallExtension",
            "API=${Build.VERSION.SDK_INT} [showCustomNotification] NotificationManager.notify() EXECUTED with id=$notificationId notificationId=$notificationId requestType=$requestType"
        )
    }

    private fun buildActionOnlyNotification(
        context: Context,
        title: String,
        body: String,
        acceptLabel: String,
        rejectLabel: String,
        acceptPendingIntent: PendingIntent,
        rejectPendingIntent: PendingIntent
    ): android.app.Notification {
        val largeIcon = BitmapFactory.decodeResource(context.resources, R.mipmap.ic_launcher)
        return NotificationCompat.Builder(context, "incoming_call_channel")
            .setSmallIcon(R.mipmap.ic_launcher)
            .setLargeIcon(largeIcon)
            .setContentTitle(title)
            .setContentText(body)
            .setPriority(NotificationCompat.PRIORITY_MAX)
            .setCategory(NotificationCompat.CATEGORY_CALL)
            .setSound(RingtoneManager.getDefaultUri(RingtoneManager.TYPE_RINGTONE))
            .setVibrate(longArrayOf(0, 1000, 500, 1000))
            .setAutoCancel(false)
            .setOngoing(true)
            .setTimeoutAfter(60000)
            .setContentIntent(null)
            .addAction(R.drawable.ic_accept_call, acceptLabel, acceptPendingIntent)
            .addAction(R.drawable.ic_reject_call, rejectLabel, rejectPendingIntent)
            .setColor(ContextCompat.getColor(context, R.color.call_accept_green))
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .build()
    }

    private fun createNotificationChannel(context: Context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                "incoming_call_channel",
                "Incoming Calls",
                NotificationManager.IMPORTANCE_HIGH
            )
            channel.description = "Incoming voice call notifications"
            channel.lockscreenVisibility = Notification.VISIBILITY_PUBLIC
            channel.setSound(
                RingtoneManager.getDefaultUri(RingtoneManager.TYPE_RINGTONE),
                null
            )
            val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            manager.createNotificationChannel(channel)
        }
    }

    private fun firstNonEmpty(vararg values: String?): String {
        for (value in values) {
            if (value != null && value.isNotEmpty()) {
                return value
            }
        }
        return ""
    }

    private fun buildNotificationKey(notification: INotification): String {
        val additionalData = notification.additionalData
        val uniqueId = firstNonEmpty(
            notification.notificationId,
            additionalData?.optString("notificationId", ""),
            additionalData?.optString("notification_id", ""),
            additionalData?.optString("callId", ""),
            additionalData?.optString("call_id", ""),
            additionalData?.optString("sessionId", ""),
            additionalData?.optString("session_id", ""),
            additionalData?.optString("chatRequestId", ""),
            additionalData?.optString("chat_request_id", "")
        )
        if (uniqueId.isNotEmpty()) {
            return "id:$uniqueId"
        }
        val rawPayload = notification.rawPayload
        val combined = "${rawPayload ?: additionalData?.toString() ?: ""}|${notification.title ?: ""}|${notification.body ?: ""}"
        return "hash:${sha256Hex(combined)}"
    }

    private fun sha256Hex(input: String): String {
        return try {
            val digest = java.security.MessageDigest.getInstance("SHA-256")
            digest.digest(input.toByteArray(Charsets.UTF_8))
                .joinToString("") { byte -> String.format("%02x", byte.toInt() and 0xff) }
        } catch (e: Exception) {
            input.hashCode().toString()
        }
    }
}
