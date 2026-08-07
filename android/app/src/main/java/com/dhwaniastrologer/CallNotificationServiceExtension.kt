package com.dhwaniastrologer

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.media.RingtoneManager
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.content.ContextCompat
import com.onesignal.notifications.INotification
import com.onesignal.notifications.INotificationServiceExtension
import com.onesignal.notifications.INotificationReceivedEvent
import org.json.JSONObject
import java.io.InputStream
import java.net.URL

private data class Quad(
    val title: String,
    val body: String,
    val acceptLabel: String,
    val rejectLabel: String
)

class CallNotificationServiceExtension : INotificationServiceExtension {
    override fun onNotificationReceived(event: INotificationReceivedEvent) {
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
            val inForeground = isAppInForeground(event.context)
            android.util.Log.d(
                "CallExtension",
                "ENTERED: CallStyle branch (notificationType=$notificationType). InForeground=$inForeground"
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

            val dedupeStore = CallHandledStore(event.context)
            val isNew = dedupeStore.isNew(notificationKey)

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

            val callerName = firstNonEmpty(
                notification.title,
                additionalData?.optString("callerName", ""),
                additionalData?.optString("caller_name", ""),
                additionalData?.optString("userName", ""),
                additionalData?.optString("user_name", "")
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

        val callerName = firstNonEmpty(
            osNotification.title,
            additionalData?.optString("callerName", ""),
            additionalData?.optString("caller_name", ""),
            additionalData?.optString("userName", ""),
            additionalData?.optString("user_name", "")
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

        val prefs = context.getSharedPreferences("call_notification_prefs", Context.MODE_PRIVATE)
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
            "issue" to issue
        ).toMap()).toString()

        android.util.Log.d("TRACE_NATIVE_2", dataJson)

        val pendingAction = when (requestType) {
            "chat_request" -> "chat_request"
            else -> "call_request"
        }

        android.util.Log.d("TRACE_NATIVE_2", dataJson.toString())

        android.util.Log.d("TRACE_NATIVE_3", dataJson)

        prefs.edit()
            .putString("pending_action", pendingAction)
            .putString("pending_data", dataJson)
            .apply()

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

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P && requestType != "chat_request") {
            // Notification.CallStyle requires API 28+. Chat requests use the
            // full-screen NotificationCompat builder below (CallStyle forces
            // system "Answer"/"Decline" labels and its button-text setters are
            // not available in this project's AndroidX/compile setup).
            val personBuilder = android.app.Person.Builder()
                .setName(callerName as CharSequence)

            val avatarBitmap = loadAvatarBitmap(context, callerAvatar)
            if (avatarBitmap != null) {
                personBuilder.setIcon(android.graphics.drawable.Icon.createWithBitmap(avatarBitmap))
            }

            android.util.Log.d(
                "CallExtension",
                "API=${Build.VERSION.SDK_INT} [showCustomNotification] requestType=$requestType Building CallStyle.forIncomingCall() person=${personBuilder.build().name}"
            )
            val callStyle = Notification.CallStyle.forIncomingCall(
                personBuilder.build(),
                rejectPendingIntent,
                acceptPendingIntent
            )

            callStyle.setAnswerButtonColorHint(
                ContextCompat.getColor(context, R.color.call_accept_green)
            )
            callStyle.setDeclineButtonColorHint(
                ContextCompat.getColor(context, R.color.call_reject_red)
            )

            val notification = Notification.Builder(context, "incoming_call_channel")
                .setSmallIcon(R.mipmap.ic_launcher)
                .setContentTitle(title)
                .setCategory(Notification.CATEGORY_CALL)
                .setPriority(Notification.PRIORITY_HIGH)
                .setSound(RingtoneManager.getDefaultUri(RingtoneManager.TYPE_RINGTONE))
                .setVibrate(longArrayOf(0, 1000, 500, 1000))
                .setOngoing(true)
                .setFullScreenIntent(acceptPendingIntent, true)
                .setVisibility(Notification.VISIBILITY_PUBLIC)
                .setStyle(callStyle)
                .setTimeoutAfter(30000)
                .setColor(ContextCompat.getColor(context, R.color.call_accept_green))
                .build()

            android.util.Log.d(
                "CallExtension",
                "API=${Build.VERSION.SDK_INT} [showCustomNotification] about to call builder.setStyle(callStyle), category=${notification.category}, channelId=${notification.channelId}, smallIcon=${notification.icon}, contentTitle=$title, contentText=$body, ongoing=${notification.flags and Notification.FLAG_ONGOING_EVENT != 0}, callStyleApplied=true"
            )
            android.util.Log.d(
                "CallExtension",
                "API=${Build.VERSION.SDK_INT} [showCustomNotification] DUMP notification before notify: [icon=$title, channel=incoming_call_channel, category=CATEGORY_CALL, priority=HIGH, ongoing=true, fullScreen=true, style=CallStyle, notificationId=$notificationId, requestType=$requestType, acceptAction=$acceptAction, rejectAction=$rejectAction]"
            )

            val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            manager.notify(notificationId, notification)
            android.util.Log.d(
                "CallExtension",
                "API=${Build.VERSION.SDK_INT} [showCustomNotification] NotificationManager.notify() EXECUTED with id=$notificationId notificationId=$notificationId requestType=$requestType"
            )
        } else {
            // Fallback path: API < 28 (CallStyle unavailable) OR chat requests.
            // NotificationCompat.Builder works from API 23+, and on API 26+ it
            // posts to the incoming_call_channel created above.
            val chatNotification = buildFullScreenNotification(
                context,
                title,
                body,
                acceptLabel,
                rejectLabel,
                acceptPendingIntent,
                rejectPendingIntent
            )
            val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            manager.notify(notificationId, chatNotification)
        }
    }

    private fun buildFullScreenNotification(
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
            .setTimeoutAfter(30000)
            .setFullScreenIntent(acceptPendingIntent, true)
            .addAction(R.drawable.ic_accept_call, acceptLabel, acceptPendingIntent)
            .addAction(R.drawable.ic_reject_call, rejectLabel, rejectPendingIntent)
            .setColor(ContextCompat.getColor(context, R.color.call_accept_green))
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .build()
    }

    private fun loadAvatarBitmap(context: Context, imageUrl: String?): Bitmap? {
        if (imageUrl.isNullOrBlank() || !imageUrl.startsWith("http")) {
            return null
        }

        return try {
            val url = URL(imageUrl)
            val connection = url.openConnection() as java.net.HttpURLConnection
            connection.doInput = true
            connection.connectTimeout = 5000
            connection.readTimeout = 5000
            connection.connect()
            val input: InputStream = connection.inputStream
            val bitmap = BitmapFactory.decodeStream(input)
            input.close()
            connection.disconnect()
            bitmap
        } catch (e: Exception) {
            null
        }
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
