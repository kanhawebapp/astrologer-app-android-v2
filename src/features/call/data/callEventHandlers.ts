import {socketClient} from '../../../services/socket/socketClient';
import {CallSocketEvents} from '../domain/callEvents';
import {callCallbackManager} from './callCallbackManager';
import {store} from '../../../store';
import {
  setCallState,
  setRoomId,
  setCallId,
  setCallerId,
  setParticipant,
  setCallTime,
  setError,
} from '../../../store/slices/callSlice';
import {webrtcService} from '../../../services/call/webrtc.service';
import {callSocketEmitters} from '../data/callSocketEmitters';
import {ringtoneManager} from '../../../services/call/ringtoneManager';
import {
  startCallAudio,
  stopCallAudio,
} from '../../../services/call/call.service';

const DEBUG_PREFIX = '[CallEventHandler]';

export const setupEventHandlers = async (): Promise<void> => {
  console.log(`${DEBUG_PREFIX} >>> SETUP EVENT HANDLERS CALLED <<<`);

  const socket = await socketClient.getSocket();
  console.log(`${DEBUG_PREFIX} Socket ID:`, socket.id);
  console.log(`${DEBUG_PREFIX} Socket connected:`, socket.connected);

  // Add GLOBAL logger to catch ALL events
  socket.onAny((eventName: string, ...args: any[]) => {
    console.log(`🔍 [ASTRO ALL EVENTS] ${eventName}`, args);
  });

  console.log(`${DEBUG_PREFIX} Registering call-specific listeners...`);

  socket.on(CallSocketEvents.INCOMING_CALL, (data: any) => {
    console.log(
      `${DEBUG_PREFIX} 📥 EVENT: "${CallSocketEvents.INCOMING_CALL}" received`,
    );

    // Deep payload debugging - normalize any structure
    console.log(`${DEBUG_PREFIX} 🔍 [PAYLOAD DEBUG] typeof data:`, typeof data);
    console.log(
      `${DEBUG_PREFIX} 🔍 [PAYLOAD DEBUG] Array.isArray(data):`,
      Array.isArray(data),
    );
    console.log(`${DEBUG_PREFIX} 🔍 [PAYLOAD DEBUG] Raw data:`, data);

    let normalizedData = data;

    // Case 2: Stringified JSON
    if (typeof data === 'string') {
      console.log(
        `${DEBUG_PREFIX} 🔍 [PAYLOAD DEBUG] Data is string, attempting parse...`,
      );
      try {
        normalizedData = JSON.parse(data);
        console.log(
          `${DEBUG_PREFIX} 🔍 [PAYLOAD DEBUG] Parsed string to object:`,
          normalizedData,
        );
      } catch (e) {
        console.log(
          `${DEBUG_PREFIX} 🔍 [PAYLOAD DEBUG] Failed to parse string:`,
          e,
        );
      }
    }

    // Case 3: Array with stringified JSON
    if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'string') {
      console.log(
        `${DEBUG_PREFIX} 🔍 [PAYLOAD DEBUG] Array with string first element, attempting parse...`,
      );
      try {
        normalizedData = JSON.parse(data[0]);
        console.log(
          `${DEBUG_PREFIX} 🔍 [PAYLOAD DEBUG] Parsed array[0] to object:`,
          normalizedData,
        );
      } catch (e) {
        console.log(
          `${DEBUG_PREFIX} 🔍 [PAYLOAD DEBUG] Failed to parse array[0]:`,
          e,
        );
      }
    }

    // Case 4: Array with object
    if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'object') {
      console.log(
        `${DEBUG_PREFIX} 🔍 [PAYLOAD DEBUG] Array with object first element`,
      );
      normalizedData = data[0];
    }

    // Case 5: Nested data property
    if (
      normalizedData &&
      typeof normalizedData === 'object' &&
      normalizedData.data
    ) {
      console.log(
        `${DEBUG_PREFIX} 🔍 [PAYLOAD DEBUG] Found nested data.data property`,
      );
      normalizedData = normalizedData.data;
    }

    console.log(
      `${DEBUG_PREFIX} 🔍 [PAYLOAD DEBUG] Object.keys(normalizedData):`,
      normalizedData ? Object.keys(normalizedData) : 'null/undefined',
    );
    console.log(
      `${DEBUG_PREFIX} 🔍 [PAYLOAD DEBUG] Final normalized payload:`,
      JSON.stringify(normalizedData, null, 2),
    );
    console.log(
      `${DEBUG_PREFIX} 📥 Payload:`,
      JSON.stringify(normalizedData, null, 2),
    );

    const astroId = store.getState().auth.user?.id;
    const receiverId =
      normalizedData?.receiverId ||
      normalizedData?.receiver_id ||
      normalizedData?.receiverid;
    const callerId = normalizedData?.callerId || normalizedData?.caller_id;
    const roomId = normalizedData?.room_id || normalizedData?.roomId;
    const callId = normalizedData?.callId || normalizedData?.call_id;
    const callTime = normalizedData?.callTime || normalizedData?.call_time || 0;
    const callerName =
      normalizedData?.callerName ||
      normalizedData?.caller_name ||
      normalizedData?.userName ||
      normalizedData?.user_name ||
      'Unknown';
    const callerAvatar =
      normalizedData?.callerAvatar ||
      normalizedData?.caller_avatar ||
      normalizedData?.userAvatar ||
      normalizedData?.user_avatar;

    console.log(
      `${DEBUG_PREFIX} 📥 Extracted - receiverId:${receiverId}, callerId:${callerId}, roomId:${roomId}, callId:${callId}, callTime:${callTime}`,
    );

    if (receiverId && astroId && receiverId !== astroId) {
      console.warn(`${DEBUG_PREFIX} ⚠️ Receiver ID mismatch! Ignoring.`);
      return;
    }

    // Dedup: ignore a socket-replayed incoming_call when the push notification
    // already drove the incoming call UI (see notificationRequestHandler). This
    // mirrors the existing call guard and prevents a duplicate CallKeep display
    // + ringtone if the same request arrives again after reconnect.
    const currentCallState = store.getState().call.callState;
    const currentRoomId = store.getState().call.roomId;
    const callAlreadyActive =
      currentCallState === 'ringing' ||
      currentCallState === 'connecting' ||
      currentCallState === 'connected';
    if (callAlreadyActive && (!roomId || roomId === currentRoomId)) {
      console.log(
        `${DEBUG_PREFIX} ⏭️ Skipping duplicate INCOMING_CALL (call already active for room ${currentRoomId})`,
      );
      return;
    }

    console.log(`${DEBUG_PREFIX} ✅ Setting call state for incoming call`);
    store.dispatch(setRoomId(roomId));
    store.dispatch(setCallId(callId));
    store.dispatch(setCallerId(callerId));
    store.dispatch(
      setParticipant({
        id: callerId,
        name: callerName,
        avatar: callerAvatar,
      }),
    );
    store.dispatch(setCallState('ringing'));
    store.dispatch(setError(null));
    store.dispatch(setCallTime(callTime * 60));

    console.log(`${DEBUG_PREFIX} Incoming call state set. Ready to show UI.`);
    console.log(
      `${DEBUG_PREFIX} 📥 INCOMING PAYLOAD callTime: ${callTime} (minutes)`,
    );
    console.log(
      `${DEBUG_PREFIX} 🕒 STORED COUNTDOWN VALUE: ${callTime * 60} (seconds)`,
    );

    // Start ringing sound immediately when incoming call arrives
    ringtoneManager.startRingtone();

    callCallbackManager.invokeCallbacks('onIncomingCall', normalizedData);
  });

  socket.on(CallSocketEvents.OFFER, async (data: any) => {
    console.log(`${DEBUG_PREFIX} 📥 EVENT: "${CallSocketEvents.OFFER}"`, data);

    // Stop ringtone when offer arrives (call is connecting)
    console.log(
      `${DEBUG_PREFIX} OFFER received - stopping ringtone if playing...`,
    );
    ringtoneManager.stopRingtone();

    const roomId = data?.room_id || data?.roomId;
    const offer = data?.offer;

    if (!offer) {
      console.log(`${DEBUG_PREFIX} Offer missing in payload`);
      return;
    }

    // Validate room matches current call
    const currentRoomId = store.getState().call.roomId;
    if (roomId !== currentRoomId) {
      console.warn(`${DEBUG_PREFIX} Offer room mismatch. Ignoring.`);
      return;
    }

    try {
      console.log(`${DEBUG_PREFIX} Processing offer for room:`, roomId);
      webrtcService.setNegotiation(true);

      // Get local audio stream FIRST (required for adding tracks to peer connection)
      const localStream = await webrtcService.getLocalStream();
      console.log(
        `${DEBUG_PREFIX} Local stream obtained, tracks:`,
        localStream.getTracks().length,
      );

      // Start InCallManager for audio routing (handles headset auto-detection)
      startCallAudio(roomId);

      const onIceCandidate = (candidate: any) => {
        console.log(`${DEBUG_PREFIX} Sending ICE candidate`, candidate);
        callSocketEmitters.sendIceCandidate(roomId, {
          candidate: candidate.candidate,
          sdpMid: candidate.sdpMid,
          sdpMLineIndex: candidate.sdpMLineIndex,
        });
      };

      const onRemoteTrack = (event: any) => {
        console.log(`${DEBUG_PREFIX} Remote track received, setting connected`);
        // CONNECTED state ONLY when remote track fires
        store.dispatch(setCallState('connected'));
        callCallbackManager.invokeCallbacks('onRemoteTrack', event);
      };

      // Create peer connection with local stream tracks
      webrtcService.createPeerConnection(onIceCandidate, onRemoteTrack);
      console.log(`${DEBUG_PREFIX} Peer connection created`);

      // 2. Set remote description (the offer)
      await webrtcService.setRemoteDescription(offer);
      console.log(`${DEBUG_PREFIX} Remote description set`);

      // Process any queued ICE candidates
      await webrtcService.processQueuedIceCandidates();

      // 3. Create answer
      console.log(`${DEBUG_PREFIX} About to create answer...`);
      const answer = await webrtcService.createAnswer();
      console.log(`${DEBUG_PREFIX} Answer created:`, answer);

      // 4. Send answer back - with defensive check
      console.log(
        `${DEBUG_PREFIX} Checking callSocketEmitters.sendAnswer exists:`,
        typeof callSocketEmitters.sendAnswer,
      );
      if (typeof callSocketEmitters.sendAnswer !== 'function') {
        throw new Error('sendAnswer is not a function - check import');
      }
      await callSocketEmitters.sendAnswer(roomId, answer);
      console.log(`${DEBUG_PREFIX} ✅ Answer sent`);
    } catch (error) {
      console.log(`${DEBUG_PREFIX} Error handling offer:`, error);
      store.dispatch(setError('Failed to process offer'));
    } finally {
      webrtcService.setNegotiation(false);
    }
  });

  socket.on(CallSocketEvents.ICE_CANDIDATE, async (data: any) => {
    console.log(
      `${DEBUG_PREFIX} 📥 EVENT: "${CallSocketEvents.ICE_CANDIDATE}"`,
      data,
    );

    const roomId = data?.room_id || data?.roomId;
    const candidate = data?.candidate;

    if (!candidate) {
      console.warn(`${DEBUG_PREFIX} ICE candidate missing`);
      return;
    }

    // Validate room
    const currentRoomId = store.getState().call.roomId;
    if (roomId !== currentRoomId) {
      console.warn(`${DEBUG_PREFIX} ICE candidate room mismatch. Ignoring.`);
      return;
    }

    try {
      console.log(`${DEBUG_PREFIX} Adding ICE candidate`);
      await webrtcService.addIceCandidate(candidate);
      console.log(`${DEBUG_PREFIX} ✅ ICE candidate added`);
    } catch (error) {
      console.log(`${DEBUG_PREFIX} Error adding ICE candidate:`, error);
    }
  });

  socket.on(CallSocketEvents.PEER_JOINED, (data: any) => {
    console.log(
      `${DEBUG_PREFIX} 📥 EVENT: "${CallSocketEvents.PEER_JOINED}"`,
      data,
    );
    callCallbackManager.invokeCallbacks('onPeerJoined', data);
  });

  socket.on(CallSocketEvents.CALL_ENDED_BY_USER, (data: any) => {
    console.log(
      `${DEBUG_PREFIX} 📥 EVENT: "${CallSocketEvents.CALL_ENDED_BY_USER}"`,
      data,
    );
    store.dispatch(setCallState('ended'));
    store.dispatch(setError('User ended the call'));
    ringtoneManager.stopRingtone();
    stopCallAudio();
    callCallbackManager.invokeCallbacks('onCallEndedByUser', data);
  });

  socket.on(CallSocketEvents.CALL_REJECTED, (data: any) => {
    console.log(
      `${DEBUG_PREFIX} 📥 EVENT: "${CallSocketEvents.CALL_REJECTED}"`,
      data,
    );
    store.dispatch(setCallState('ended'));
    ringtoneManager.stopRingtone();
    stopCallAudio();
    callCallbackManager.invokeCallbacks('onCallRejected', data);
  });

  socket.on(CallSocketEvents.CALL_TIMEOUT, (data: any) => {
    console.log(
      `${DEBUG_PREFIX} 📥 EVENT: "${CallSocketEvents.CALL_TIMEOUT}"`,
      data,
    );
    store.dispatch(setCallState('ended'));
    store.dispatch(setError('Call timed out'));
    ringtoneManager.stopRingtone();
    stopCallAudio();
    callCallbackManager.invokeCallbacks('onCallTimeout', data);
  });

  socket.on(CallSocketEvents.CALL_CANCEL_BY_USER, (data: any) => {
    console.log(
      `${DEBUG_PREFIX} 📥 EVENT: "${CallSocketEvents.CALL_CANCEL_BY_USER}" received`,
    );

    // Deep payload debugging - normalize any structure
    console.log(`${DEBUG_PREFIX} 🔍 [PAYLOAD DEBUG] typeof data:`, typeof data);
    console.log(
      `${DEBUG_PREFIX} 🔍 [PAYLOAD DEBUG] Array.isArray(data):`,
      Array.isArray(data),
    );
    console.log(`${DEBUG_PREFIX} 🔍 [PAYLOAD DEBUG] Raw data:`, data);
    console.log(
      `${DEBUG_PREFIX} 🔍 [PAYLOAD DEBUG] JSON.stringify(data):`,
      JSON.stringify(data),
    );

    let normalizedData = data;

    // Case 2: Stringified JSON
    if (typeof data === 'string') {
      console.log(
        `${DEBUG_PREFIX} 🔍 [PAYLOAD DEBUG] Data is string, attempting parse...`,
      );
      try {
        normalizedData = JSON.parse(data);
        console.log(
          `${DEBUG_PREFIX} 🔍 [PAYLOAD DEBUG] Parsed string to object:`,
          normalizedData,
        );
      } catch (e) {
        console.log(
          `${DEBUG_PREFIX} 🔍 [PAYLOAD DEBUG] Failed to parse string:`,
          e,
        );
      }
    }

    // Case 3: Array with stringified JSON
    if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'string') {
      console.log(
        `${DEBUG_PREFIX} 🔍 [PAYLOAD DEBUG] Array with string first element, attempting parse...`,
      );
      try {
        normalizedData = JSON.parse(data[0]);
        console.log(
          `${DEBUG_PREFIX} 🔍 [PAYLOAD DEBUG] Parsed array[0] to object:`,
          normalizedData,
        );
      } catch (e) {
        console.log(
          `${DEBUG_PREFIX} 🔍 [PAYLOAD DEBUG] Failed to parse array[0]:`,
          e,
        );
      }
    }

    // Case 4: Array with object
    if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'object') {
      console.log(
        `${DEBUG_PREFIX} 🔍 [PAYLOAD DEBUG] Array with object first element`,
      );
      normalizedData = data[0];
    }

    // Case 5: Nested data property
    if (
      normalizedData &&
      typeof normalizedData === 'object' &&
      normalizedData.data
    ) {
      console.log(
        `${DEBUG_PREFIX} 🔍 [PAYLOAD DEBUG] Found nested data.data property`,
      );
      normalizedData = normalizedData.data;
    }

    console.log(
      `${DEBUG_PREFIX} 🔍 [PAYLOAD DEBUG] Object.keys(normalizedData):`,
      normalizedData ? Object.keys(normalizedData) : 'null/undefined',
    );
    console.log(
      `${DEBUG_PREFIX} 🔍 [PAYLOAD DEBUG] Final normalized payload:`,
      JSON.stringify(normalizedData, null, 2),
    );

    let roomId = normalizedData?.roomId || normalizedData?.room_id;
    let astroid =
      normalizedData?.astroid ||
      normalizedData?.astroId ||
      normalizedData?.astro_id;
    const user_id = normalizedData?.user_id;

    console.log(
      `${DEBUG_PREFIX} 📥 EXTRACTED VALUES: roomId: ${roomId}, astroid: ${astroid}, user_id: ${user_id}`,
    );

    const currentRoomId = store.getState().call.roomId;
    const astroId = store.getState().auth.user?.id;

    console.log(
      `${DEBUG_PREFIX} CALL_CANCEL_BY_USER - roomId: ${roomId}, currentRoomId: ${currentRoomId}, astroid: ${astroid}, currentAstroId: ${astroId}`,
    );

    const roomMatches = roomId && roomId === currentRoomId;
    const astroMatches = astroid && astroid === astroId;

    if (!roomMatches && !astroMatches) {
      console.warn(
        `${DEBUG_PREFIX} CALL_CANCEL_BY_USER: No match - roomId:${roomId} vs current:${currentRoomId}, astroid:${astroid} vs astroId:${astroId}. Ignoring.`,
      );
      return;
    }

    console.log(
      `${DEBUG_PREFIX} ✅ CALL_CANCEL_BY_USER: Match found, ending call`,
    );
    store.dispatch(setCallState('ended'));
    store.dispatch(setError('User cancelled the call'));
    ringtoneManager.stopRingtone();
    stopCallAudio();
    callCallbackManager.invokeCallbacks(
      'onCallCancelledByUser',
      normalizedData,
    );
  });

  console.log(`${DEBUG_PREFIX} Call listeners registered`);
};

export const removeEventHandlers = async (): Promise<void> => {
  try {
    const socket = await socketClient.getSocket();

    socket.off(CallSocketEvents.INCOMING_CALL);
    socket.off(CallSocketEvents.PEER_JOINED);
    socket.off(CallSocketEvents.OFFER);
    socket.off(CallSocketEvents.ICE_CANDIDATE);
    socket.off(CallSocketEvents.CALL_ENDED_BY_USER);
    socket.off(CallSocketEvents.CALL_ENDED_BY_ASTROLOGER);
    socket.off(CallSocketEvents.CALL_REJECTED);
    socket.off(CallSocketEvents.CALL_TIMEOUT);
    socket.off(CallSocketEvents.CALL_CANCEL_BY_USER);

    // Ensure ringtone is stopped when all handlers are removed
    ringtoneManager.stopRingtone();
    stopCallAudio();
  } catch (error) {
    console.log('Error removing call event handlers:', error);
  }
};
