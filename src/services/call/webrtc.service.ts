import {
  RTCPeerConnection,
  RTCIceCandidate,
  RTCSessionDescription,
  MediaStream,
  mediaDevices,
} from 'react-native-webrtc';
import InCallManager from 'react-native-incall-manager';
import {Platform} from 'react-native';

const DEBUG_PREFIX = '[WebRTCService]';

export const iceConfig: any = {
  iceServers: [
    {urls: 'stun:stun.l.google.com:19302'},
    {urls: 'stun:stun1.l.google.com:19302'},
    {urls: 'stun:stun2.l.google.com:19302'},
    {
      urls: 'turn:openrelay.metered.ca:80',
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
    {
      urls: 'turn:openrelay.metered.ca:443',
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
  ],
  iceCandidatePoolSize: 10,
};

class WebRTCService {
  private pc: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private queuedIceCandidates: any[] = [];
  private pendingIceCandidateResolvers: ((value: void) => void)[] = [];
  private negotiationInProgress = false;
  private pendingCleanupAfterNegotiation = false;
  private pendingLocalStreamPromise: Promise<MediaStream> | null = null;
  private audioConstraints: any = {
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    },
  };

  async getLocalStream(): Promise<MediaStream> {
    // Reuse an existing live stream instead of calling getUserMedia again. On
    // a cold launch the accept flow (handleAccept) and the socket OFFER
    // handler can both request the mic concurrently; two overlapping
    // getUserMedia calls in react-native-webrtc can fail the second request,
    // which breaks the offer/answer path and makes the server end the call
    // ("User ended the call") because no answer is ever sent.
    if (this.localStream) {
      const tracks = this.localStream.getTracks();
      if (tracks.some(track => track.readyState === 'live')) {
        console.log(
          `${DEBUG_PREFIX} Reusing existing local stream (${tracks.length} tracks)`,
        );
        return this.localStream;
      }
      console.log(
        `${DEBUG_PREFIX} Existing local stream has no live tracks - requesting a new one`,
      );
    }

    // Serialize concurrent getUserMedia requests so a second caller waits for
    // the first instead of triggering a second (conflicting) mic capture.
    if (this.pendingLocalStreamPromise) {
      console.log(
        `${DEBUG_PREFIX} getUserMedia already in progress - awaiting shared promise`,
      );
      return this.pendingLocalStreamPromise;
    }

    this.pendingLocalStreamPromise = (async () => {
      console.log(`${DEBUG_PREFIX} Getting local audio stream...`);
      const stream = await mediaDevices.getUserMedia(this.audioConstraints);
      console.log(
        `${DEBUG_PREFIX} Local stream obtained, tracks:`,
        stream.getTracks().length,
      );
      this.localStream = stream;
      return stream;
    })();

    try {
      return await this.pendingLocalStreamPromise;
    } catch (error) {
      console.log(`${DEBUG_PREFIX} Failed to get local stream:`, error);
      throw error;
    } finally {
      this.pendingLocalStreamPromise = null;
    }
  }

  private isPcClosed(): boolean {
    if (!this.pc) {
      return true;
    }
    const state = (this.pc as any).connectionState;
    const signaling = (this.pc as any).signalingState;
    return state === 'closed' || signaling === 'closed';
  }

  createPeerConnection(
    onIceCandidate?: (candidate: any) => void,
    onRemoteTrack?: (event: any) => void,
  ): RTCPeerConnection {
    if (this.pc && !this.isPcClosed()) {
      console.log(`${DEBUG_PREFIX} Reusing existing peer connection`);
      return this.pc;
    }

    if (this.pc) {
      // The stored pc is already closed (e.g. a deferred cleanup closed it)
      // but was not nulled. Drop it so a fresh connection is created instead
      // of reusing a dead one.
      console.log(
        `${DEBUG_PREFIX} Existing peer connection is closed - discarding and recreating`,
      );
      this.pc = null;
    }

    console.log(`${DEBUG_PREFIX} Creating new RTCPeerConnection`);
    const pc = new RTCPeerConnection(iceConfig);
    this.pc = pc;

    // NOTE: every handler below closes over the local `pc` (NOT `this.pc`).
    // cleanup() closes the connection and nulls this.pc; react-native-webrtc
    // then fires connectionstatechange -> 'closed' / iceconnectionstatechange
    // -> 'closed' asynchronously. Reading this.pc inside those callbacks at
    // fire time crashed with "Cannot read property 'connectionState' of null".
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        console.log(`${DEBUG_PREFIX} Adding track:`, track.kind);
        pc.addTrack(track, this.localStream!);
      });
    }

    (pc as any).onicecandidate = (event: any) => {
      if ((pc as any).signalingState === 'closed') {
        return;
      }
      if (event.candidate) {
        console.log(`${DEBUG_PREFIX} New ICE candidate:`, {
          candidate: event.candidate.candidate,
          sdpMid: event.candidate.sdpMid,
          sdpMLineIndex: event.candidate.sdpMLineIndex,
        });
        if (onIceCandidate) {
          onIceCandidate(event.candidate);
        }
      } else {
        console.log(`${DEBUG_PREFIX} ICE gathering complete`);
      }
    };

    (pc as any).ontrack = (event: any) => {
      // Ignore remote-track events fired after the pc was closed/cleaned up
      // (a late track from a closing connection must not resurrect the call).
      if (
        (pc as any).signalingState === 'closed' ||
        pc.connectionState === 'closed'
      ) {
        console.log(
          `${DEBUG_PREFIX} Ignoring remote track from closed peer connection`,
        );
        return;
      }
      console.log(`${DEBUG_PREFIX} Received remote track:`, {
        kind: event.track.kind,
        streams: event.streams?.length || 0,
      });
      if (event.streams && event.streams[0]) {
        const remoteStream = event.streams[0];
        this.remoteStream = remoteStream;
        console.log(
          `${DEBUG_PREFIX} Remote stream set with tracks:`,
          remoteStream.getTracks().length,
        );
        if (onRemoteTrack) {
          onRemoteTrack(event);
        }
      }
    };

    (pc as any).onconnectionstatechange = () => {
      if (!pc) {
        return;
      }
      const state = pc.connectionState;
      console.log(
        `${DEBUG_PREFIX} Connection state changed: ${state} (pc active: ${
          this.pc === pc
        })`,
      );
    };

    (pc as any).oniceconnectionstatechange = () => {
      if (!pc) {
        return;
      }
      const state = pc.iceConnectionState;
      console.log(
        `${DEBUG_PREFIX} ICE connection state changed: ${state} (pc active: ${
          this.pc === pc
        })`,
      );
    };

    return pc;
  }

  async setRemoteDescription(description: any): Promise<void> {
    if (!this.pc || this.isPcClosed()) {
      throw new Error('PeerConnection not created or already closed');
    }
    const rtcDesc = new RTCSessionDescription(description);
    console.log(`${DEBUG_PREFIX} Setting remote description:`, rtcDesc.type);
    await this.pc.setRemoteDescription(rtcDesc);
    console.log(`${DEBUG_PREFIX} ✅ Remote description set successfully`);
  }

  async createAnswer(): Promise<{type: string; sdp: string}> {
    if (!this.pc || this.isPcClosed()) {
      throw new Error('PeerConnection not created or already closed');
    }
    console.log(`${DEBUG_PREFIX} Creating answer...`);
    const answer = await this.pc.createAnswer();
    await this.pc.setLocalDescription(answer);
    console.log(`${DEBUG_PREFIX} Answer created and set as local description`);
    return {
      type: answer.type,
      sdp: answer.sdp,
    };
  }

  setNegotiation(inProgress: boolean) {
    this.negotiationInProgress = inProgress;
    if (!inProgress && this.pendingCleanupAfterNegotiation) {
      this.pendingCleanupAfterNegotiation = false;
      this.cleanup('deferred_after_negotiation');
    }
  }

  isNegotiating(): boolean {
    return this.negotiationInProgress;
  }

  async setLocalDescription(description: any): Promise<void> {
    if (!this.pc || this.isPcClosed()) {
      throw new Error('PeerConnection not created or already closed');
    }
    const rtcDesc = new RTCSessionDescription(description);
    console.log(`${DEBUG_PREFIX} Setting local description:`, rtcDesc.type);
    await this.pc.setLocalDescription(rtcDesc);
    console.log(`${DEBUG_PREFIX} ✅ Local description set successfully`);
  }

  async addIceCandidate(candidate: any): Promise<void> {
    console.log(
      `${DEBUG_PREFIX} addIceCandidate called, pc exists: ${!!this
        .pc}, pc closed: ${this.isPcClosed()}`,
    );

    // Queue if peer connection doesn't exist yet
    if (!this.pc || this.isPcClosed()) {
      console.log(
        `${DEBUG_PREFIX} Peer connection not ready, queuing ICE candidate`,
      );
      this.queuedIceCandidates.push(candidate);
      return;
    }

    const remoteDesc = (this.pc as any).remoteDescription;
    if (!remoteDesc) {
      console.log(
        `${DEBUG_PREFIX} Remote description not ready, queuing ICE candidate`,
      );
      this.queuedIceCandidates.push(candidate);
      return;
    }

    try {
      const iceCandidate = new RTCIceCandidate(candidate);
      console.log(`${DEBUG_PREFIX} Adding ICE candidate`);
      await this.pc.addIceCandidate(iceCandidate);
      console.log(`${DEBUG_PREFIX} ICE candidate added`);
    } catch (error) {
      console.log(`${DEBUG_PREFIX} Error adding ICE candidate:`, error);
    }
  }

  async processQueuedIceCandidates(): Promise<void> {
    if (
      !this.pc ||
      this.isPcClosed() ||
      this.queuedIceCandidates.length === 0
    ) {
      return;
    }

    console.log(
      `${DEBUG_PREFIX} Processing ${this.queuedIceCandidates.length} queued ICE candidates`,
    );

    for (const candidate of this.queuedIceCandidates) {
      try {
        const iceCandidate = new RTCIceCandidate(candidate);
        await this.pc.addIceCandidate(iceCandidate);
        console.log(`${DEBUG_PREFIX} Queued ICE candidate added`);
      } catch (error) {
        console.log(
          `${DEBUG_PREFIX} Error adding queued ICE candidate:`,
          error,
        );
      }
    }

    this.queuedIceCandidates = [];
  }

  isRemoteDescriptionReady(): boolean {
    return !!(this.pc as any)?.remoteDescription;
  }

  getLocalStreamValue(): MediaStream | null {
    return this.localStream;
  }

  getRemoteStream(): MediaStream | null {
    return this.remoteStream;
  }

  getPeerConnection(): RTCPeerConnection | null {
    return this.pc;
  }

  // Safe snapshot of the peer connection state. Returns null when no
  // connection exists; never throws, unlike reading pc.connectionState /
  // pc.iceConnectionState directly when the pc has been closed and nulled.
  getConnectionStatus(): {
    connectionState: string;
    iceConnectionState: string;
    signalingState: string;
  } | null {
    if (!this.pc) {
      return null;
    }
    return {
      connectionState: (this.pc as any).connectionState,
      iceConnectionState: (this.pc as any).iceConnectionState,
      signalingState: (this.pc as any).signalingState,
    };
  }

  async cleanup(source?: string, force: boolean = false): Promise<void> {
    console.log(
      `${DEBUG_PREFIX} Cleaning up WebRTC resources` +
        `${source ? ` [trigger: ${source}]` : ''}` +
        `${force ? ' (forced)' : ''}`,
    );

    if (!force && this.negotiationInProgress) {
      console.log(
        `${DEBUG_PREFIX} Deferring cleanup during offer/answer negotiation` +
          `${source ? ` [trigger: ${source}]` : ''}`,
      );
      this.pendingCleanupAfterNegotiation = true;
      return;
    }

    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        console.log(`${DEBUG_PREFIX} Stopping track:`, track.kind);
        track.stop();
      });
      this.localStream = null;
    }

    const pc = this.pc;
    if (pc) {
      console.log(
        `${DEBUG_PREFIX} Destroying RTCPeerConnection (connection=${
          pc.connectionState
        }, ice=${pc.iceConnectionState}, signaling=${
          (pc as any).signalingState
        })`,
      );
      // Detach every handler BEFORE close(). react-native-webrtc fires
      // connectionstatechange -> 'closed' and iceconnectionstatechange ->
      // 'closed' asynchronously after close(); with this.pc already nulled,
      // the old handlers dereferenced this.pc and crashed with
      // "Cannot read property 'connectionState' of null".
      (pc as any).onicecandidate = null;
      (pc as any).ontrack = null;
      (pc as any).onconnectionstatechange = null;
      (pc as any).oniceconnectionstatechange = null;
      try {
        pc.close();
      } catch (e) {
        console.log(`${DEBUG_PREFIX} Error closing RTCPeerConnection:`, e);
      }
      this.pc = null;
    } else {
      console.log(
        `${DEBUG_PREFIX} No peer connection to destroy${
          source ? ` [trigger: ${source}]` : ''
        }`,
      );
    }

    this.remoteStream = null;
    this.queuedIceCandidates = [];
    console.log(
      `${DEBUG_PREFIX} Cleanup complete${
        source ? ` [trigger: ${source}]` : ''
      }`,
    );
  }

  async toggleMute(): Promise<boolean> {
    if (this.localStream) {
      const audioTracks = this.localStream.getAudioTracks();
      if (audioTracks.length > 0) {
        const track = audioTracks[0];
        track.enabled = !track.enabled;
        console.log(`${DEBUG_PREFIX} Mute toggled, enabled:`, track.enabled);
        return !track.enabled;
      }
    }
    return false;
  }

  setMute(enabled: boolean): boolean {
    if (this.localStream) {
      const audioTracks = this.localStream.getAudioTracks();
      if (audioTracks.length > 0) {
        const track = audioTracks[0];
        track.enabled = enabled;
        console.log(`${DEBUG_PREFIX} Mute set to:`, enabled);
        return true;
      }
    }
    return false;
  }

  /**
   * Toggle the audio output route between speaker and earpiece.
   * Uses InCallManager to switch the system audio output.
   * Automatically handles wired headset and Bluetooth headset routing.
   */
  async toggleAudioRoute(): Promise<boolean> {
    try {
      if (Platform.OS === 'android') {
        const currentSpeakerState = this._speakerOn;
        const newSpeakerState = !currentSpeakerState;

        if (newSpeakerState) {
          InCallManager.setForceSpeakerphoneOn(true);
        } else {
          InCallManager.setForceSpeakerphoneOn(false);
        }
        this._speakerOn = newSpeakerState;
        console.log(
          `${DEBUG_PREFIX} Audio route set to SPEAKER:`,
          newSpeakerState,
        );
        return newSpeakerState;
      }
      return false;
    } catch (e) {
      console.log(`${DEBUG_PREFIX} Error toggling audio route:`, e);
      return false;
    }
  }

  private _speakerOn = false;

  /**
   * Returns true if the handsfree / speaker route is active.
   */
  async isSpeakerOn(): Promise<boolean> {
    return this._speakerOn;
  }
}

export const webrtcService = new WebRTCService();
