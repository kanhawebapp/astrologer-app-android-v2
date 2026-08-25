import { useSelector } from 'react-redux';
import { socketManager } from '../../../services/socket/socketManager';
import { CallSocketEvents } from '../domain/callEvents';
import { RootState } from '../../../store';

export class CallSocketEmitters {
  async joinCall(roomId: string): Promise<void> {
    console.log('[CallSocketEmitters] Emitting join_call for room:', roomId);
    await socketManager.emit('join_call', { roomId });
  }

  // async acceptCall(roomId: string, astroId: string): Promise<void> {
  //   console.log('[CallSocketEmitters] Emitting callAcceptedByAstrologer', { roomId, astroId });
  //   await socketManager.emit(CallSocketEvents.CALL_ACCEPTED_BY_ASTROLOGER, {
  //     roomId,
  //     astroId,
  //   });
  // }
  // async acceptCall(
  //   roomId: string,
  //   astroId: string,
  //   callTime: number,
  // ): Promise<void> {

  //   console.log(
  //     'i m here with Emitting callAcceptedByAstrologer',
  //     {
  //       roomId,
  //       astroId,
  //       callTime,
  //     },
  //   );

  //   await socketManager.emit(
  //     CallSocketEvents.CALL_ACCEPTED_BY_ASTROLOGER,
  //     {
  //       roomId,
  //       astroId,
  //       callTime,
  //     },
  //   );
  // }

  async acceptCall(
    roomId: string,
    astroId: string,
    callTime: number,
  ): Promise<void> {

    const callTimeInSeconds = callTime * 60;

    console.log(
      'i m here with Emitting callAcceptedByAstrologer',
      {
        roomId,
        astroId,
        originalCallTime: callTime,
        callTimeInSeconds,
      },
    );

    await socketManager.emit(
      CallSocketEvents.CALL_ACCEPTED_BY_ASTROLOGER,
      {
        roomId,
        astroId,
        callTime: callTimeInSeconds,
      },
    );
  }

  async rejectCall(astroId: string, roomId: string): Promise<void> {
    console.log('[CallSocketEmitters] Emitting call_cancel_by_astrologer', { astroId, roomId });
    await socketManager.emit('call_cancel_by_astrologer', {
      astroId,
      roomId,
    });
  }
  // async rejectCall(callId: string, roomId: string): Promise<void> {
  //   console.log('[CallSocketEmitters] Emitting call_rejected_by_astrologer', { callId, roomId });
  //   await socketManager.emit('call_rejected_by_astrologer', {
  //     callId,
  //     roomId,
  //   });
  // }

  async endCall(roomId: string, astroId: any): Promise<void> {
    console.log('[CallSocketEmitters] Emitting call_ended_by_astrologer', { roomId, astroId });
    await socketManager.emit(CallSocketEvents.CALL_ENDED_BY_ASTROLOGER, { roomId, astroId });
  }

  async sendOffer(roomId: string, offer: { type: string; sdp: string }): Promise<void> {
    console.log('[CallSocketEmitters] Emitting offer', { roomId });
    await socketManager.emit(CallSocketEvents.OFFER, {
      room_id: roomId,
      offer,
    });
  }

  async sendAnswer(roomId: string, answer: { type: string; sdp: string }): Promise<void> {
    console.log('[CallSocketEmitters] Emitting answer', { roomId });

    if (!answer?.type || !answer?.sdp) {
      throw new Error('Invalid answer payload: missing type or sdp');
    }

    console.log('[CallSocketEmitters] Answer payload validated, emitting...');
    await socketManager.emit(CallSocketEvents.ANSWER, {
      room_id: roomId,
      answer,
    });
    console.log('[CallSocketEmitters] ✅ Answer emitted successfully');
  }

  async sendIceCandidate(
    roomId: string,
    candidate: { candidate: string; sdpMid?: string | null; sdpMLineIndex?: number | null },
  ): Promise<void> {
    await socketManager.emit(CallSocketEvents.ICE_CANDIDATE, {
      room_id: roomId,
      candidate,
    });
  }
}

export const callSocketEmitters = new CallSocketEmitters();