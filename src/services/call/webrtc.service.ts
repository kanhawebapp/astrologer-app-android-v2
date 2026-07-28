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
  private audioConstraints: any = {
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    },
  };

  async getLocalStream(): Promise<MediaStream> {
    try {
      console.log(`${DEBUG_PREFIX} Getting local audio stream...`);
      const stream = await mediaDevices.getUserMedia(this.audioConstraints);
      console.log(
        `${DEBUG_PREFIX} Local stream obtained, tracks:`,
        stream.getTracks().length,
      );
      this.localStream = stream;
      return stream;
    } catch (error) {
      console.log(`${DEBUG_PREFIX} Failed to get local stream:`, error);
      throw error;
    }
  }

  createPeerConnection(
    onIceCandidate?: (candidate: any) => void,
    onRemoteTrack?: (event: any) => void,
  ): RTCPeerConnection {
    if (this.pc) {
      console.log(`${DEBUG_PREFIX} Reusing existing peer connection`);
      return this.pc;
    }

    console.log(`${DEBUG_PREFIX} Creating new RTCPeerConnection`);
    this.pc = new RTCPeerConnection(iceConfig);

    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        console.log(`${DEBUG_PREFIX} Adding track:`, track.kind);
        this.pc!.addTrack(track, this.localStream!);
      });
    }

    (this.pc as any).onicecandidate = (event: any) => {
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

    (this.pc as any).ontrack = (event: any) => {
      console.log(`${DEBUG_PREFIX} Received remote track:`, {
        kind: event.track.kind,
        streams: event.streams?.length || 0,
      });
      if (event.streams && event.streams[0]) {
        this.remoteStream = event.streams[0];
        console.log(
          `${DEBUG_PREFIX} Remote stream set with tracks:`,
          this.remoteStream.getTracks().length,
        );
        if (onRemoteTrack) {
          onRemoteTrack(event);
        }
      }
    };

    (this.pc as any).onconnectionstatechange = () => {
      const state = (this.pc as any).connectionState;
      console.log(`${DEBUG_PREFIX} Connection state changed:`, state);
    };

    (this.pc as any).oniceconnectionstatechange = () => {
      const state = (this.pc as any).iceConnectionState;
      console.log(`${DEBUG_PREFIX} ICE connection state changed:`, state);
    };

    return this.pc;
  }

  async setRemoteDescription(description: any): Promise<void> {
    if (!this.pc) {
      throw new Error('PeerConnection not created');
    }
    const rtcDesc = new RTCSessionDescription(description);
    console.log(`${DEBUG_PREFIX} Setting remote description:`, rtcDesc.type);
    await this.pc.setRemoteDescription(rtcDesc);
    console.log(`${DEBUG_PREFIX} ✅ Remote description set successfully`);
  }

  async createAnswer(): Promise<{type: string; sdp: string}> {
    if (!this.pc) {
      throw new Error('PeerConnection not created');
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
      this.cleanup();
    }
  }

  isNegotiating(): boolean {
    return this.negotiationInProgress;
  }

  async setLocalDescription(description: any): Promise<void> {
    if (!this.pc) {
      throw new Error('PeerConnection not created');
    }
    const rtcDesc = new RTCSessionDescription(description);
    console.log(`${DEBUG_PREFIX} Setting local description:`, rtcDesc.type);
    await this.pc.setLocalDescription(rtcDesc);
    console.log(`${DEBUG_PREFIX} ✅ Local description set successfully`);
  }

  async addIceCandidate(candidate: any): Promise<void> {
    console.log(
      `${DEBUG_PREFIX} addIceCandidate called, pc exists: ${!!this.pc}`,
    );

    // Queue if peer connection doesn't exist yet
    if (!this.pc) {
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
    if (!this.pc || this.queuedIceCandidates.length === 0) {
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

  async cleanup(force: boolean = false): Promise<void> {
    console.log(
      `${DEBUG_PREFIX} Cleaning up WebRTC resources${force ? ' (forced)' : ''}`,
    );

    if (!force && this.negotiationInProgress) {
      console.log(
        `${DEBUG_PREFIX} Deferring cleanup during offer/answer negotiation`,
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

    if (this.pc) {
      this.pc.close();
      this.pc = null;
    }

    this.remoteStream = null;
    console.log(`${DEBUG_PREFIX} Cleanup complete`);
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
