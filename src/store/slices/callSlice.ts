import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { CallStateData, CallState, Participant } from '../../features/call/domain/callTypes';

const initialState: CallStateData = {
   callState: 'idle',
   roomId: null,
   callId: null,
   callerId: null,
   participant: null,
   callTime: 0,
   isMuted: false,
   isSpeakerOn: false,
   callDuration: 0,
   error: null,
};

const callSlice = createSlice({
  name: 'call',
  initialState,
  reducers: {
    setCallState: (state, action: PayloadAction<CallState>) => {
      state.callState = action.payload;
    },
    setRoomId: (state, action: PayloadAction<string | null>) => {
      state.roomId = action.payload;
    },
    setCallId: (state, action: PayloadAction<string | null>) => {
      state.callId = action.payload;
    },
    setCallerId: (state, action: PayloadAction<string | null>) => {
      state.callerId = action.payload;
    },
    setParticipant: (state, action: PayloadAction<Participant | null>) => {
      state.participant = action.payload;
    },
    toggleMute: (state) => {
      state.isMuted = !state.isMuted;
    },
    setMuted: (state, action: PayloadAction<boolean>) => {
      state.isMuted = action.payload;
    },
    toggleSpeaker: (state) => {
      state.isSpeakerOn = !state.isSpeakerOn;
    },
    setSpeakerOn: (state, action: PayloadAction<boolean>) => {
      state.isSpeakerOn = action.payload;
    },
setCallDuration: (state, action: PayloadAction<number>) => {
       state.callDuration = action.payload;
     },
    setCallTime: (state, action: PayloadAction<number>) => {
       state.callTime = action.payload;
     },
    incrementCallDuration: (state) => {
       state.callDuration += 1;
     },
    decrementCallTime: (state) => {
       state.callTime = Math.max(0, state.callTime - 1);
     },
    resetCallDuration: (state) => {
      state.callDuration = 0;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    resetCall: () => initialState,
  },
});

export const {
   setCallState,
   setRoomId,
   setCallId,
   setCallerId,
   setParticipant,
   setCallTime,
   toggleMute,
   setMuted,
   toggleSpeaker,
   setSpeakerOn,
   setCallDuration,
   incrementCallDuration,
   decrementCallTime,
   resetCallDuration,
   setError,
   resetCall,
} = callSlice.actions;

export default callSlice.reducer;
