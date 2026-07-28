# chatNotify.md — Chat lifecycle (Normal open vs Notification accept)

> **Scope**: This document is generated strictly from repository implementation (React Native, Redux, Socket.IO, OneSignal, Android native bridge). **No code changes** and **no assumptions** beyond what is present in the codebase. 
>
> **Important note about terminology**:
> - In this app, the foreground chat request UI is controlled by Redux slice `src/store/slices/chatSlice.ts`.
> - Two distinct “sources” can drive Redux into the same UI state:
>   1) a foreground Socket.IO event (`new_chat_request`)
>   2) a notification click/pending-action path which dispatches the same Redux action and then triggers the exact same Accept/Reject handlers registered in `ChatRequestCard`.
>
> ---

## 1. Overall Architecture

### React Native

**Entry**
- `App.tsx` is the top-level component.
  - Mounts global providers and navigation.
  - Mounts socket/notification “bridge” hooks:
    - `useGlobalChatSocket()`
    - `useGlobalCallSocket()`
    - `useNotificationClickRouter()`
    - `useCallKeepIntegration()`
    - plus components `SocketAuthBridge` and `OneSignalSocketBridge`.

**Key UI components**
- `src/components/common/ChatRequestCard.tsx`
  - Renders the in-app popup for a **chat request**.
  - Uses Redux `state.chat.chatStatus` and `state.chat.latestRequest`.
  - Registers Accept/Reject triggers into module `chatRequestCardTriggers.ts`.
  - Implements `handleAccept()` and `handleReject()`.
  - On accept, it:
    - dispatches `setActiveSession(sessionData)`
    - navigates to `ChatScreen` with params
    - emits socket event via `chatSocketService.acceptChatAstrologer(sessionId, roomId)`

- `src/features/chat/presentation/screens/ChatScreen.tsx`
  - Screen for an active session.
  - Uses `useChatViewModel()`.
  - On mount, `useChatViewModel` emits `join_room`.
  - Displays messages and typing indicators using socket Redux-backed state.

**Chat ViewModel**
- `src/features/chat/presentation/viewmodels/ChatViewModel.ts`
  - Owns chat room join side effects and listeners.
  - Computes `effectiveRoomId` from route params / Redux.
  - Emits `socketManager.emit('join_room', { room_id: effectiveRoomId })` once per effective room.
  - Registers typing listener on socket event name `'typing'` through `socketManager.on/off('typing', ...)`.
  - Navigates back when Redux `chatStatus === 'ENDED'`.

**Hooks**
- `src/hooks/useNotificationClickRouter.ts`
  - Subscribes to OneSignal notification click events through `oneSignalService.onNotificationClick`.
  - Immediately dispatches chat request UI state via `handleRequestNotification(additionalData)`.
  - Ensures socket connectivity is established via `socketManager.connect()`.

- `src/hooks/notificationRequestHandler.ts`
  - Normalizes OneSignal `additionalData` and routes it by `type`:
    - `chat_request` → `handleChatRequest`
    - `call_request` → `handleCallRequest`
  - For chat requests: validates payload and dispatches `addChatRequest(data)` to Redux.

- `src/hooks/usePendingCallFromNative.ts`
  - Reads a pending action from native module `CallNotificationModule.getPendingAction()`.
  - For chat accept/reject pending actions, it calls:
    - `handleChatAcceptFromNative(pending.data)`
    - `handleChatRejectFromNative(pending.data)`

### Redux

**Slice**
- `src/store/slices/chatSlice.ts`
  - Core state:
    - `chatStatus: 'IDLE' | 'REQUEST' | 'ACTIVE' | 'ENDED'` (type `ChatStatus`)
    - `chatRequests[]`
    - `latestRequest: ChatRequest | null` (popup source of truth)
    - `activeSession: ActiveChatSession | null`
    - message state: `messages: Record<string, ChatMessage[]>`
    - typing state: `typingInfo: Record<string, TypingInfo>`
    - error, connecting, etc.

**Selectors**
- `src/store/selectors/chatSelectors.ts`
  - `selectMessagesByRoom(state, roomId)`
  - `selectChatRequests`, `selectActiveSession`, `selectChatStatus`, etc.

**Action flow to UI**
- When request arrives (socket or notification), Redux is set to:
  - `chatStatus='REQUEST'`
  - `latestRequest=payload`
- `ChatRequestCard` uses only `chatStatus === 'REQUEST' && latestRequest != null` to render.

**State transitions** (as implemented)
- `IDLE` → `REQUEST` via `addChatRequest()`
- `REQUEST` → `ACTIVE` via `setActiveSession()`
- `ACTIVE` → `ENDED` via `endChatSession()`
- `ENDED` → `IDLE` via `resetChatStatus()` (and/or full reset flows)

### SocketManager

- `src/services/socket/socketManager.ts`
  - Owns socket lifecycle and general-purpose socket API:
    - `connect()` / `disconnect()` / `reconnect(token)` / `emit()` / `emitWithAck()` / `on()` / `off()`
  - Performs auth-token gating in `connectSocket`:
    - if no `currentAuthToken`, it **defers connection**.
  - Registers global socket listeners when connecting:
    - `connect`, `disconnect`, `connect_error`
    - socket-level `authRequired/authSuccess/authFailed`
    - `socket.onAny` global debug logging
  - Maintains `connectionChangeCallbacks` used by `useOneSignalSocket`.

### SocketClient

- `src/services/socket/socketClient.ts`
  - Creates the actual socket.io-client instance with:
    - URL `https://dhwaniastro.com`
    - namespace `SocketNamespaces.DHWANI_ASTRO` (`/dhwani-astro`)
    - path `/astro-websocket-service-v2/socket.io`
    - `transports: ['websocket','polling']`
    - `autoConnect:false`
    - `reconnection:true`
  - Sets token by placing `Cookie: token=<JWT>` header.
  - Uses singleton `SocketClient.getInstance()`.

### ChatRequestCard

- `src/components/common/ChatRequestCard.tsx`
  - Popup display logic:
    ```ts
    popupShouldShow = chatStatus === 'REQUEST' && latestRequest != null
    ```
  - Accept button handler: `handleAccept()`.
  - Reject button handler: `handleReject()`.
  - Trigger registration:
    - In `useEffect`, it calls `setAcceptChatTrigger(() => handleAccept())` and `setRejectChatTrigger(() => handleReject())`.
    - Cleanup sets triggers back to null.

### ChatScreen / ChatViewModel

- `ChatScreen.tsx` delegates all behavior to `useChatViewModel`.
- `ChatViewModel`:
  - Computes room join id `effectiveRoomId`.
  - Emits `join_room` socket event once when `effectiveRoomId` exists and `hasJoinedRoomRef.current` is false.
  - Registers typing listener:
    - `socketManager.on('typing', handleTyping)`
    - before/after it calls `socketManager.off('typing', handleTyping)` to avoid duplicates.

### useChatSocket (chat domain socket binding)

- `src/features/chat/presentation/hooks/useChatSocket.ts`
  - Notifies Redux about socket callbacks via `chatSocketService` callback manager.
  - On mount it:
    - dispatches `setConnecting(true)`
    - `chatSocketService.addCallbacks(callbacks)`
    - calls `chatSocketService.setupListeners()`
  - On unmount it removes callbacks.
  - Provides functions:
    - `completeChat()`
    - `leaveChat()`

### chat socket service (ChatSocketService)

- `src/features/chat/data/chatSocketService.ts`
  - Singleton managing:
    - registering socket events (event handlers)
    - callback invocation
    - room session map
    - typing manager
    - emitters
  - `setupListeners()`:
    - uses `socketClient.getSocket()`
    - ensures event handlers are set up only once per socket instance
    - calls `setupEventHandlers()` from `chatEventHandlers.ts`
  - `acceptChatAstrologer(sessionId, roomId?)`:
    - instrumentation
    - calls `chatSocketEmitters.acceptChatAstrologer(sessionId, roomId)` → socketManager.emit('chat_accepted_astrologer', payload)
    - then emits `joinChat` directly:
      - `socket.emit('joinChat', { username:'astrologer', room_id, joinpersonid:'ASTROLOGER_ID_HERE' })`
      - (Note: `joinpersonid` is hardcoded in this implementation.)

### Socket events and their wiring

- Socket event names are defined in `src/features/chat/domain/chatEvents.ts`.
- Server-to-client listeners are wired in `src/features/chat/data/chatEventHandlers.ts`.
  - It calls `setupEventHandlers()` and sets `socket.on(...)` for each event.
  - It normalizes event payloads (e.g. `new_chat_request`, `chat_started_astrologer`, etc.)
  - Then calls `callbackManager.invokeCallbacks('<callbackKey>', data)`

### Notification handlers

There are two notification-derived entry points:

1) **OneSignal notification click** (JS side)
   - `src/hooks/useNotificationClickRouter.ts`
   - Uses `oneSignalService.onNotificationClick(event => ...)`
   - Dispatches Redux via `handleRequestNotification(additionalData)`.

2) **Android notification accept/reject actions** (native bridge → JS)
   - Native OneSignal Service Extension builds Accept/Reject PendingIntent actions.
   - Those actions are handled by `MainActivity.handleIncomingNotificationIntent` and stored in SharedPreferences.
   - JS reads pending action via `NativeModules.CallNotificationModule.getPendingAction()`.
   - JS then calls `handleChatAcceptFromNative()` / `handleChatRejectFromNative()`.

### Native Android

**Manifest**
- `android/app/src/main/AndroidManifest.xml`:
  - registers notification service extension:
    - `com.onesignal.NotificationServiceExtension` = `com.dhwaniastrologer.CallNotificationServiceExtension`

**Native module**
- `android/app/src/main/java/com/dhwaniastrologer/CallNotificationModule.kt`
  - `getPendingAction()` reads:
    - `pending_action` and `pending_data` from SharedPreferences `call_notification_prefs`.
  - `clearPendingAction()` clears them.

**MainActivity**
- `android/app/src/main/java/com/dhwaniastrologer/MainActivity.kt`
  - `onCreate` and `onNewIntent` call `handleIncomingNotificationIntent(intent)`.
  - If intent.action is one of:
    - `com.dhwaniastrologer.ACCEPT_CALL`
    - `com.dhwaniastrologer.REJECT_CALL`
    - `com.dhwaniastrologer.ACCEPT_CHAT`
    - `com.dhwaniastrologer.REJECT_CHAT`
  - It extracts extras (roomId, sessionId, userId, astrologerId, etc.)
  - It serializes all of them into a JSON string and writes to SharedPreferences:
    - `pending_action = action`
    - `pending_data = dataMap.toString()`

**Service Extension**
- `android/app/src/main/java/com/dhwaniastrologer/CallNotificationServiceExtension.kt`
  - `onNotificationReceived(event)` reads `notification.additionalData`.
  - Detects type:
    - normalizes to `notificationType` → `normalizedType` among `{call, chat}`.
  - Foreground behavior:
    - if app is in foreground, it `event.preventDefault()` and returns (no custom notification shown).
  - Background behavior:
    - it calls `showCustomNotification()` for call/chat requests.
  - `showCustomNotification()`:
    - extracts chat fields from additionalData via `chatField(keys...)` helper.
    - constructs `pendingAction` string:
      - chat_request → `chat_request`
    - builds Accept/Reject PendingIntents targeting `MainActivity`.
      - accept action for chat: `com.dhwaniastrologer.ACCEPT_CHAT`
      - reject action for chat: `com.dhwaniastrologer.REJECT_CHAT`
    - stores pending data in Intent extras (`extra_*`) which are then handled by `MainActivity` and persisted.

### OneSignal

- `src/services/onesignal/oneSignalService.ts`
  - Initializes OneSignal with `ONESIGNAL_APP_ID`.
  - Registers listeners:
    - `OneSignal.Notifications.addEventListener('click', handleNotificationClick)`
    - `foregroundWillDisplay` → `handleForegroundNotification`
    - push subscription change → `handleSubscriptionChange`
  - JS exposes:
    - `onNotificationClick(listener)`
    - `onSubscriptionChange(listener)`
    - `getPlayerId()` and `setExternalUserId()`

- `src/hooks/useOneSignalSocket.ts`
  - Emits socket event `register` (constant `REGISTER_EVENT='register'`) with payload:
    - `{ astrologerId, playerId }`
  - Emits `app_state` on AppState changes while socket is connected.

### GraphQL

**Not observed in the chat open/accept flow implementation** during the code paths reviewed. GraphQL client is present (`src/services/graphqlClient.ts`), but the chat flow documented here is driven by:
- Redux
- Socket.IO
- OneSignal events

> If GraphQL is used elsewhere for chat history loading or session fetches (e.g. `fetchChatHistory` thunk), it is part of broader chat list/history, not the explicit notification accept navigation/join flow in the code reviewed.

### Socket.IO (namespaces/rooms)

- Socket namespaces defined in `src/services/socket/socketEvents.ts`:
  - default: `/`
  - DHWANI: `/dhwani-astro`
  - CHAT: `/chat`
  - LIVE: `/live`
  - NOTIFICATIONS: `/notifications`

- In this repository, the SocketClient connects to namespace `SocketNamespaces.DHWANI_ASTRO` but chat emits use raw event names (e.g. `joinChat`) on that socket instance.

---

## 2. Cold App Launch Flow (Normal open)

### Goal
Describe exact sequence when app is opened normally (not from notification accept action).

### Observed code path

1. React entry
   - **File**: `App.tsx`
   - **Component**: `App`
   - Mount tree:
     - `GestureHandlerRootView`
     - `SafeAreaProvider`
     - `StoreProvider` (Redux Provider)
     - `ToastProvider`
     - `ErrorBoundary`
     - `AppContent`

2. `AppContent` mounting side effects (hooks)
   - **File**: `App.tsx`
   - **Component**: `AppContent`
   - Calls:
     - `useChatSimulation()`
     - `useGlobalChatSocket()`
     - `useGlobalCallSocket()` (not detailed here because not opened in this trace set)
     - `useNotificationClickRouter()`
     - `useCallKeepIntegration()` (not opened in trace set)

3. SocketAuthBridge
   - **File**: `src/components/SocketAuthBridge.tsx`
   - **Component**: `SocketAuthBridge`
   - `useEffect([token])` reconnect logic:
     - if `token` is null: return (logout behavior)
     - if `prevTokenRef.current !== token`:
       - `await socketManager.reconnect(token)`
       - `await chatSocketService.setupListeners()`
       - `await callSocketService.setupListeners()`
   - This bridges auth token readiness to socket listeners.

4. OneSignal socket bridge
   - **File**: `src/components/OneSignalSocketBridge.tsx`
   - Component calls `useOneSignalSocket()`.

5. Socket connection and listeners
   - `socketManager.connect()` is invoked from:
     - `SocketAuthBridge` via `socketManager.reconnect(token)` (if no connected socket is preserved)
     - `useNotificationClickRouter` if notification is clicked and socket not connected
     - `chatSocketService.setupListeners()` calls `setupEventHandlers()` which calls `socketManager.connect()`

6. Chat listeners wiring
   - **File**: `src/hooks/useGlobalChatSocket.ts`
   - On token availability:
     - It runs effect and calls:
       - `chatSocketService.setCallbacks({ onNewChatRequest, onChatStarted, ... })`
       - `chatSocketService.setupListeners()`
     - Guard:
       - `socketInitializedRef.current.initialized` ensures setup happens once.

7. Navigation initialization
   - Root navigation determined by `useAuth()`.
   - **File**: `src/navigation/RootNavigator.tsx`
   - If authenticated:
     - shows `MainNavigator` and the `ChatScreen` route.

> **Cold app launch and “auth restore”**:
> In the code reviewed, the explicit logic for “auth restore” is not shown in the opened files. It is referenced as `state.auth.token` and `state.auth.isAuthenticated` used by bridges and `RootNavigator`.
> 
> For the lifecycle ordering below, **the key observable order is**:
> - `AppContent` mounts bridges immediately
> - socket connections are token-gated and will wait until token is present in Redux.

### Sequence (Normal open)

```text
App.tsx
  └─ AppContent mounts
      ├─ useChatSimulation()
      ├─ useGlobalChatSocket()   (waits for token; sets callbacks + setupListeners once)
      ├─ useNotificationClickRouter() (subscribes to onNotificationClick)
      ├─ SocketAuthBridge
      │    └─ useEffect([token])
      │        └─ if token changes
      │            ├─ socketManager.reconnect(token)
      │            ├─ chatSocketService.setupListeners()
      │            └─ callSocketService.setupListeners()
      ├─ OneSignalSocketBridge
      │    └─ useOneSignalSocket()
      │        ├─ oneSignalService.init()
      │        ├─ waits for socket connected + playerId + astrologerId
      │        └─ socketManager.emit('register', {astrologerId, playerId})
      └─ RootNavigator decides stacks

After authenticated:
  MainNavigator mounts
    └─ ChatRequestCard is always rendered

When server emits new_chat_request:
  chatEventHandlers → normalizeChatRequest → callbackManager.invoke('onNewChatRequest')
  useGlobalChatSocket callback → dispatch(setChatStatus('REQUEST')) via addChatRequest flow
  ChatRequestCard renders popup and registers triggers
```

---

## 3. Incoming Chat Request Flow (server → client)

### Step-by-step (as implemented)

> The exact event name for server request is `new_chat_request`.

#### Server emits
- **Socket.IO event name**: `new_chat_request`
- **Direction**: server → client

#### Socket listener registration
- **File**: `src/features/chat/data/chatEventHandlers.ts`
- **Function**: `setupEventHandlers()`
- It calls:
  - `socket.on(ChatSocketEvents.NEW_CHAT_REQUEST, setupNewChatRequestHandler())`

#### Handler logic
- **Function**: `setupNewChatRequestHandler()`
- **Normalization**:
  - calls `normalizeChatRequest(data)`
  - constructs `dedupeKey = new_request_${normalized.roomId}_${normalized.sessionId}`
  - dedupes and debounces via `debounceManager`

- **Redux actions dispatched**:
  - `store.dispatch(setChatUser({ userId, userName, userProfilePic }))`
  - `store.dispatch(setChatRequest(data))` (stores full raw request data globally; separate from slice)
  - callback invocation:
    - `callbackManager.invokeCallbacks('onNewChatRequest', normalized)`

- **Room session map**:
  - `roomSessionManager.setRoomSession(normalized.roomId, { sessionId, userId, userName, astrologerId })`

#### Callback invocation into React hook layer
- **File**: `src/hooks/useGlobalChatSocket.ts`
- **Function**: `useEffect` where it calls:
  - `chatSocketService.setCallbacks({ onNewChatRequest: handleNewChatRequest, ... })`
  - `chatSocketService.setupListeners()`

- **Function**: `handleNewChatRequest(data: ChatRequest|ChatRequest[])`
  - extracts `roomId, sessionId, userId, astrologerId`
  - validates required fields
  - compares `astrologerId` to `state.auth.user.id`
  - dedupes against `latestNewChatRequestSessionIdRef`
  - **Redux actions**:
    - `dispatch(setChatStatus('REQUEST'))`
    - `dispatch(setLatestRequest(request))`
    - `dispatch(addChatRequest(request))`

> Note: `addChatRequest` reducer itself also sets `latestRequest` and forces `chatStatus='REQUEST'`.

#### UI reaction: ChatRequestCard
- **File**: `src/components/common/ChatRequestCard.tsx`
- **Render** condition:
  - `chatStatus === 'REQUEST' && latestRequest != null`
- It shows the popup with countdown.

#### ChatRequestCard trigger registration
- In `useEffect`, it calls:
  - `setAcceptChatTrigger(() => handleAccept())`
  - `setRejectChatTrigger(() => handleReject())`

---

## 4. Accept Chat Flow (Normal, user presses Accept button)

### Entry
- User taps Accept button inside `ChatRequestCard`.

### Exact call chain (from code)

#### 1) `ChatRequestCard.handleAccept()`
- **File**: `src/components/common/ChatRequestCard.tsx`
- **Function**: `handleAccept` (useCallback)

Early-return guard:
- if `!latestRequest` OR `accepting` OR `rejecting` OR `isAnimatingRef.current` → return

#### 2) Local UI updates
Inside `handleAccept()`:
- `setAccepting(true)`
- clears timer interval if any
- calls `closeCard()` (animated parallel to slide/fade)

#### 3) Delayed accept logic
- `setTimeout(async () => { ... }, 250)`

Within timeout:
- builds `sessionData = { sessionId, roomId, userId, userName, userProfilePic, astrologerId, astrologerName, astrologerProfilePic, startedAt: Date.now(), maximumTime, pricePerMinute, remainingTime }`

#### 4) Redux: set active session
- **File**: `src/store/slices/chatSlice.ts`
- **Reducer**: `setActiveSession(sessionData)`
- Side effects (from reducer):
  - `state.activeSession = action.payload`
  - `state.chatStatus = 'ACTIVE'`
  - `state.latestRequest = null`
  - removes corresponding entries from `chatRequests`

#### 5) Navigation
- **File**: `src/components/common/ChatRequestCard.tsx`
- **Call**:
  - `navigation.navigate('ChatScreen', { roomId, userId, userName, maximumTime })`

> The navigation target name must match RootNavigator route key `'ChatScreen'`.

#### 6) Socket: accept_chat_astrologer
- **File**: `src/features/chat/data/chatSocketService.ts`
- **Function**: `acceptChatAstrologer(sessionId, roomId)`

Sequence in `acceptChatAstrologer`:
1. calls `chatSocketEmitters.acceptChatAstrologer(sessionId, roomId)`
2. obtains socket via `socketClient.getSocket()`
3. emits `joinChat` directly:
   - `socket.emit('joinChat', { username:'astrologer', room_id: roomId, joinpersonid:'ASTROLOGER_ID_HERE' })`

#### 7) Socket emitter: `chatSocketEmitters.acceptChatAstrologer`
- **File**: `src/features/chat/data/chatSocketEmitters.ts`
- **Function**: `acceptChatAstrologer(sessionId, roomId?)`
- builds `emitPayload = { sessionId, room_id: roomId }`
- **Socket emit**:
  - `await socketManager.emit(ChatSocketEvents.CHAT_ACCEPTED_ASTROLOGER, emitPayload)`
- where `ChatSocketEvents.CHAT_ACCEPTED_ASTROLOGER = 'chat_accepted_astrologer'`.

#### 8) Server response events
After accept, server is expected to emit chat started events (the code has listener for `chat_started_astrologer`).

- **File**: `src/features/chat/data/chatEventHandlers.ts`
- **Listener**:
  - `socket.on(ChatSocketEvents.CHAT_STARTED_ASTROLOGER, setupChatStartedHandler())`

> The detailed payload mapping for `chat_started_astrologer` is in `chatEventHandlers.ts` (normalization and dispatch to callbackManager). 

### “Expected response” in this codebase
- The client does not wait for ACK on `accept_chat` emit (it uses `socketManager.emit`, not `emitWithAck`).
- It relies on subsequent server-emitted events handled in `chatEventHandlers.ts`.

### Sequence diagram (Normal Accept)

```text
User
  ↓ taps Accept
ChatRequestCard
  ├─ handleAccept()
  ├─ dispatch(setActiveSession(sessionData))  // chatStatus→ACTIVE
  ├─ navigation.navigate('ChatScreen', {roomId,...})
  └─ chatSocketService.acceptChatAstrologer(sessionId, roomId)
        ├─ socketManager.emit('chat_accepted_astrologer', {sessionId, room_id})
        └─ socket.emit('joinChat', {username:'astrologer', room_id, joinpersonid:'ASTROLOGER_ID_HERE'})

Server
  ↓ emits chat_started_astrologer
chatEventHandlers
  └─ normalizeSocketEvent → callbackManager.invoke('onChatStarted', enhanced)

useGlobalChatSocket callback
  └─ dispatch(setActiveSession(data))

MainNavigator effect
  └─ navigates to ChatScreen when activeSession exists (but guard prevents repeat)
```

---

## 5. Notification Accept Flow (Android: notification buttons → native pending-action bridge → JS)

### Entry condition
- User taps Accept on the **Android custom chat notification**.

### Native layer sequence (as implemented)

1) OneSignal Service Extension receives push
- **File**: `android/app/src/main/java/com/dhwaniastrologer/CallNotificationServiceExtension.kt`
- **Function**: `onNotificationReceived(event: INotificationReceivedEvent)`

- Determines `normalizedType`:
  - chat_request → normalizedType becomes `chat`

- If app is **not** in foreground:
  - it calls `showCustomNotification()`.

2) Build Accept/Reject PendingIntent
- **File**: same as above
- **Function**: `showCustomNotification()`

- Creates:
  - accept action string: `com.dhwaniastrologer.ACCEPT_CHAT`
  - reject action string: `com.dhwaniastrologer.REJECT_CHAT`

- Builds Accept Intent extras:
  - `extra_room_id`, `extra_session_id`, `extra_user_id`, `extra_astrologer_id`, `extra_user_name`, `extra_maximum_time`, `extra_price_per_minute`, `extra_user_profile_pic`, `extra_astrologer_name`, `extra_astrologer_profile_pic`, `extra_issue`, etc.

- PendingIntent created via:
  - `PendingIntent.getActivity(context, (roomId+"accept"+requestType).hashCode(), acceptIntent, FLAG_UPDATE_CURRENT|FLAG_IMMUTABLE)`

3) User taps notification button
- Android launches `MainActivity` with intent action.

4) MainActivity stores pending action into SharedPreferences
- **File**: `android/app/src/main/java/com/dhwaniastrologer/MainActivity.kt`
- **Function**: `handleIncomingNotificationIntent(intent)`

- If intent.action matches ACCEPT_CHAT or REJECT_CHAT:
  - extracts extras
  - builds JSON `dataMap` using `JSONObject().put(...)...toString()`
  - writes:
    - `pending_action = action`
    - `pending_data = dataMap`
  - to SharedPreferences name `call_notification_prefs`

5) JS reads pending action
- **File**: `src/hooks/usePendingCallFromNative.ts`
- In `useEffect`:
  - `processPending()` called on mount and when AppState becomes active.

- `processPending()` calls:
  - Native module: `NativeModules.CallNotificationModule.getPendingAction()`
  - which returns:
    - `{ action: string, data: Record<string, any> } | null`

6) When action is `com.dhwaniastrologer.ACCEPT_CHAT`
- **File**: `src/hooks/usePendingCallFromNative.ts`
- It calls:
  - `handleAcceptChat(pending.data)`

7) handleAcceptChat delegates to chatRequestCardNativeHandlers
- **File**: same
- `handleAcceptChat(data)` does:
  - `handleChatAcceptFromNative(data)`

8) handleChatAcceptFromNative routes to ChatRequestCard’s trigger
- **File**: `src/components/common/chatRequestCardNativeHandlers.ts`
- **Function**: `handleChatAcceptFromNative(data)`

Main steps:
- stops ringtone
- ensures `sessionId` exists:
  - if missing: `data.sessionId = session_${data.roomId}`
- validates payload via `isCompleteChatRequest(data)`
  - requires roomId, userId, astrologerId, etc.
- dispatches Redux:
  - `store.dispatch(addChatRequest(data))`
  - this sets `latestRequest` and `chatStatus='REQUEST'`
- then calls `fireAfterTriggerRegistered(triggerAcceptChat)`
  - which runs `setTimeout(fire, 100)`

9) Trigger execution
- **File**: `src/components/common/chatRequestCardTriggers.ts`
- `triggerAcceptChat()` retries until `acceptChatTrigger` is registered.
- When registered:
  - calls the stored `acceptChatTrigger()` which is set by `ChatRequestCard`.

10) Trigger calls exact same business handler
- **File**: `src/components/common/ChatRequestCard.tsx`
- In its effect, it sets:
  - `setAcceptChatTrigger(() => handleAccept())`

Therefore, the native notification accept path ends up calling:
- `ChatRequestCard.handleAccept()`

So the rest of the flow is **identical** to normal pressing Accept (Redux setActiveSession → navigate ChatScreen → socket acceptChatAstrologer → joinChat emit).

### Sequence diagram (Notification Accept)

```text
Android Notification Button
  ↓ taps Accept
CallNotificationServiceExtension (background)
  └─ builds PendingIntent for MainActivity with action=ACCEPT_CHAT
MainActivity
  └─ handleIncomingNotificationIntent()
       └─ stores SharedPreferences:
           pending_action=ACCEPT_CHAT
           pending_data={roomId, sessionId, userId, astrologerId, ...}

JS runtime (already running or becomes active)
  └─ usePendingCallFromNative()
       └─ NativeModules.CallNotificationModule.getPendingAction()
            └─ handleChatAcceptFromNative(pending.data)
                 ├─ dispatch(addChatRequest(data)) // chatStatus→REQUEST
                 └─ triggerAcceptChat() via registered ChatRequestCard trigger

ChatRequestCard
  └─ handleAccept()
       ├─ dispatch(setActiveSession(sessionData)) // chatStatus→ACTIVE
       ├─ navigation.navigate('ChatScreen', {roomId,...})
       └─ chatSocketService.acceptChatAstrologer()
            ├─ socketManager.emit('chat_accepted_astrologer', {sessionId, room_id})
            └─ socket.emit('joinChat', {...})
```

---

## 6. Socket Events (table)

> This list is derived from code that registers listeners and emits.
> Some events may be handled elsewhere (call socket, etc.), but this table focuses on chat + notification-related socket interactions observed.

| Event Name | Direction | Payload (as emitted/assumed from code) | Expected ACK | Expected Next Event | Who emits | Who listens |
|---|---|---|---|---|---|---|
| `register` | client → server | `{ astrologerId, playerId }` (from `useOneSignalSocket`) | none (`emit`) | `...` not shown | `useOneSignalSocket` via `socketManager.emit` | server |
| `app_state` | client → server | `{ state: nextState }` (from `useOneSignalSocket`) | none (`emit`) | - | `useOneSignalSocket` | server |
| `new_chat_request` | server → client | normalized in `normalizeChatRequest(data)` | none | `chat_started_astrologer` after accept | server | `chatEventHandlers.ts` listener → `callbackManager.invoke onNewChatRequest` |
| `chat_accepted_astrologer` | client → server | `{ sessionId, room_id }` (from `chatSocketEmitters.acceptChatAstrologer`) | none | `chat_started_astrologer` | `chatSocketService.acceptChatAstrologer()` | server |
| `joinChat` | client → server | `{ username:'astrologer', room_id, joinpersonid:'ASTROLOGER_ID_HERE' }` | none | server-specific | `chatSocketService.acceptChatAstrologer()` | server /
| `chat_started_astrologer` | server → client | normalized by `normalizeSocketEvent` | none | enables active session dispatch | server | `chatEventHandlers.ts` listener → callback `onChatStarted` |
| `receive_message` | server → client | normalized and augmented in `setupReceiveMessageHandler` | none | message appears in Redux and UI | server | `chatEventHandlers.ts` listener `socket.on('receive_message', ...)` |
| `typing` | server → client | `handleTyping` expects data containing room_id/roomId/roomid and typing boolean in `data.typing` plus `data.user_name` | none | UI typing indicator | server | `ChatViewModel` listener `socketManager.on('typing', ...)` and `chatEventHandlers.ts` typing handler mapping start/stop |
| `typing` (`typingStart`/`typingStop`) | client → server | `{ roomId }` (from `typingManager.sendTyping`) | none | typing updates | `typingManager` | server |
| `completed_chat` | client → server | `{ sessionId, roomId }` (from `chatSocketEmitters.completeChat`) | none | server emits `completed_chat`? or leave_chat | `useChatSocket.completeChat()` | server |
| `leave_chat` | client → server | `{ sessionId, roomId, reason }` (from `chatSocketEmitters.leaveChat`) | none | server emits `leave_chat` or triggers reset | `useChatSocket.leaveChat()` | server |
| `chat_reject_auto` | server → client | passed to callbacks | none | UI updated | server | `chatEventHandlers.ts` listener `ChatSocketEvents.CHAT_REJECT_AUTO` |
| `chat_cancel_by_user` | server → client | normalized in `setupChatCancelByUserHandler` | none | resets UI | server | `chatEventHandlers.ts` listener |
| `message_read` / `message_delivered` | server → client | used for `updateMessageStatus` | none | message status updated | server | `chatEventHandlers.ts` listeners |
| `user_disconnected` | server → client | `{ sessionId, roomId, userId }` | none | error state set | server | `chatEventHandlers.ts` listener |
| `chat_timeout` | server → client | `{ sessionId, roomId }` | none | chat ends | server | `chatEventHandlers.ts` listener |

> **Note**: The requested exhaustive “do not miss any” across the entire project cannot be guaranteed in this session because the repo search tool fails without `rg` (ripgrep) binary. However, the above table includes every chat socket event that is explicitly declared in `chatEvents.ts` and registered in `chatEventHandlers.ts`, plus the additional `joinChat` emission.

---

## 7. Payload Definitions

> Payload interfaces for chat events are not consistently implemented as explicit `interface` declarations in the reviewed files. Where TypeScript types exist, they are in `src/features/chat/domain/chatTypes.ts` (not opened in this trace set). 
>
> This section documents **payload shapes actually used in emitters and in handler logic**.

### Chat accept payload

**Emitter**
- **File**: `src/features/chat/data/chatSocketEmitters.ts`
- **Function**: `acceptChatAstrologer(sessionId, roomId?)`

**Event**: `chat_accepted_astrologer`

**Emitted payload (exact)**
```ts
{
  sessionId: string,
  room_id: string | undefined,
}
```

### joinChat payload

**Emitter**
- **File**: `src/features/chat/data/chatSocketService.ts`
- **Function**: `acceptChatAstrologer(sessionId, roomId?)`

**Event**: `joinChat`

**Emitted payload (exact)**
```ts
{
  __chat_accept_trace_joinChat: true, // instrumentation
  username: 'astrologer',
  room_id: roomId,
  joinpersonid: 'ASTROLOGER_ID_HERE',
}
```

### join_room payload

**Emitter**
- **File**: `src/features/chat/presentation/viewmodels/ChatViewModel.ts`
- **Effect**: “Join room on mount/room change”

**Event**: `join_room`

**Emitted payload (exact)**
```ts
{
  room_id: effectiveRoomId,
}
```

### typing payload (client → server)

**Emitter**
- **File**: `src/features/chat/data/typingManager.ts`
- **Function**: `sendTyping(roomId, isTyping)`

**Events**
- Start: emits `ChatSocketEvents.TYPING_START` which equals `'typing'`
- Stop: emits `ChatSocketEvents.TYPING_STOP` which equals `'typing'`

**Payload**
```ts
{
  roomId: string,
}
```

### typing payload (server → client)

**Listener**
- **File**: `src/features/chat/presentation/viewmodels/ChatViewModel.ts`
- **Function** `handleTyping(data)`

Expected fields used:
- `data.room_id || data.roomId || data.roomid`
- `data.typing ?? false`
- `data.user_name` compared to `'Astrologer'`

The logic:
- If incoming room matches effectiveRoomId:
  - `setIsTyping(typingStatus)` where typingStatus is derived from `data.typing`.

### chat request payload (Redux-driven)

The chat request object is passed from:
- socket new_chat_request normalization result (in `useGlobalChatSocket.handleNewChatRequest`)
- notification payload (in `notificationRequestHandler.handleChatRequest`)
- native accept/reject (in `chatRequestCardNativeHandlers.handleChatAcceptFromNative`)

From those handlers, the required fields are checked in `isCompleteChatRequest` and `handleNewChatRequest`:

Required by native handler `isCompleteChatRequest(data)`:
- `roomId` or `room_id` (normalized to `roomId`)
- `userId`
- `astrologerId`

Required by `useGlobalChatSocket.handleNewChatRequest`:
- `roomId`
- `sessionId`
- `userId`
- `astrologerId`

**sessionId handling**
- Native handler: if `!data.sessionId`, it creates `session_${data.roomId}`.
- Socket handler and OneSignal normalization expects sessionId/session_id/chatRequestId.

---

## 8. Redux Flow

> This section documents reducers and their state transitions. Exact action list is taken from `chatSlice.ts` reducers.

### Reducers used in the chat accept flows

#### `addChatRequest(chatRequest)`
- **File**: `src/store/slices/chatSlice.ts`
- **Effect**:
  - `state.latestRequest = action.payload`
  - `state.chatRequests.push(action.payload)` if id not exists
  - `state.chatStatus='REQUEST'`

#### `setActiveSession(activeSession)`
- **Effect**:
  - `state.activeSession = payload`
  - `state.chatStatus='ACTIVE'`
  - `state.latestRequest=null`
  - filters chatRequests to remove matching sessionId or roomId

#### `endChatSession()`
- **Effect**:
  - `state.activeSession=null`
  - `state.latestRequest=null`
  - `state.chatStatus='ENDED'`

#### `removeChatRequest(sessionId)`
- **Effect**:
  - removes from `chatRequests` by `sessionId`
  - if `latestRequest.sessionId===sessionId` → clears latestRequest
  - if no chatRequests and chatStatus was REQUEST → `chatStatus='IDLE'`

#### `resetChatStatus()`
- **Effect**:
  - `state.chatStatus='IDLE'`
  - `state.activeSession=null`
  - `state.latestRequest=null`
  - `state.error=null`

### Selectors consumed by UI

- `ChatRequestCard`: reads `state.chat.chatStatus`, `state.chat.connecting`, `state.chat.latestRequest`.
