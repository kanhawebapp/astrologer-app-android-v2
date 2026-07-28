import { startIncomingRing, stopIncomingRing } from './call.service';

const DEBUG_PREFIX = '[RingtoneManager]';

const DEFAULT_RING_TIMEOUT_MS = 30000; // 30 seconds

class RingtoneManager {
  private isPlaying: boolean = false;
  private timeoutTimer: ReturnType<typeof setTimeout> | null = null;
  private static instance: RingtoneManager;

  private constructor() {}

  static getInstance(): RingtoneManager {
    if (!RingtoneManager.instance) {
      RingtoneManager.instance = new RingtoneManager();
    }
    return RingtoneManager.instance;
  }

  /**
   * Start the incoming ringtone.
   * If already playing, this is a no-op (prevents duplicate playback).
   * @param timeoutMs - Auto-stop timeout in milliseconds (default: 30s)
   */
  startRingtone(timeoutMs: number = DEFAULT_RING_TIMEOUT_MS): void {
    console.log(`${DEBUG_PREFIX} startRingtone() called, isPlaying:`, this.isPlaying);
    if (this.isPlaying) {
      console.log(`${DEBUG_PREFIX} Skipping ringtone start - already playing`);
      return;
    }

    this.isPlaying = true;

    try {
      startIncomingRing();
      console.log(`${DEBUG_PREFIX} Incoming ringtone started`);
    } catch (e) {
      console.log(`${DEBUG_PREFIX} Error starting ringtone:`, e);
      this.isPlaying = false;
      return;
    }

    // Auto-stop after timeout to prevent stuck ringtone
    this.timeoutTimer = setTimeout(() => {
      if (this.isPlaying) {
        console.log(`${DEBUG_PREFIX} Ringtone timeout (${timeoutMs}ms) reached, stopping`);
        this.stopRingtone();
      }
    }, timeoutMs);
  }

  /**
   * Stop the incoming ringtone.
   * If not playing, this is a no-op (safe to call multiple times).
   */
  stopRingtone(): void {
    console.log(`${DEBUG_PREFIX} stopRingtone() called, isPlaying:`, this.isPlaying);
    if (!this.isPlaying) {
      console.log(`${DEBUG_PREFIX} Skipping ringtone stop - not currently playing`);
      return;
    }

    this.isPlaying = false;

    // Clear timeout timer
    if (this.timeoutTimer) {
      clearTimeout(this.timeoutTimer);
      this.timeoutTimer = null;
    }

    try {
      stopIncomingRing();
      console.log(`${DEBUG_PREFIX} Incoming ringtone stopped`);
    } catch (e) {
      console.log(`${DEBUG_PREFIX} Error stopping ringtone:`, e);
    }
  }

  /**
   * Check if ringtone is currently playing.
   */
  isRingtonePlaying(): boolean {
    return this.isPlaying;
  }

  /**
   * Full cleanup - stops ringtone and clears all timers.
   */
  cleanup(): void {
    if (this.timeoutTimer) {
      clearTimeout(this.timeoutTimer);
      this.timeoutTimer = null;
    }
    if (this.isPlaying) {
      this.isPlaying = false;
      try {
        stopIncomingRing();
        console.log(`${DEBUG_PREFIX} Incoming ringtone stopped (cleanup)`);
      } catch (e) {
        console.log(`${DEBUG_PREFIX} Error stopping ringtone during cleanup:`, e);
      }
    }
  }
}

export const ringtoneManager = RingtoneManager.getInstance();
export default ringtoneManager;