import {
  addAudiencePresence,
  createAudiencePresenceTracker,
  removeAudiencePresence,
  replaceAudiencePresence,
  resetAudiencePresence,
} from '../audiencePresenceTracker';

describe('audiencePresenceTracker', () => {
  it('starts at zero', () => {
    const tracker = createAudiencePresenceTracker<number>();
    expect(tracker.count).toBe(0);
    expect(tracker.ids.size).toBe(0);
  });

  it('adds unique ids and ignores duplicates', () => {
    let tracker = createAudiencePresenceTracker<number>();
    tracker = addAudiencePresence(tracker, 101);
    tracker = addAudiencePresence(tracker, 202);
    tracker = addAudiencePresence(tracker, 101);

    expect(tracker.count).toBe(2);
    expect([...tracker.ids].sort((a, b) => a - b)).toEqual([101, 202]);
  });

  it('never counts the excluded local id', () => {
    let tracker = createAudiencePresenceTracker<number>();
    tracker = addAudiencePresence(tracker, 42, 42);
    tracker = addAudiencePresence(tracker, 99, 42);

    expect(tracker.count).toBe(1);
    expect(tracker.ids.has(42)).toBe(false);
    expect(tracker.ids.has(99)).toBe(true);
  });

  it('removes ids without going below zero', () => {
    let tracker = createAudiencePresenceTracker<number>();
    tracker = addAudiencePresence(tracker, 1);
    tracker = addAudiencePresence(tracker, 2);
    tracker = removeAudiencePresence(tracker, 1);
    tracker = removeAudiencePresence(tracker, 1);
    tracker = removeAudiencePresence(tracker, 999);

    expect(tracker.count).toBe(1);
    expect([...tracker.ids]).toEqual([2]);

    tracker = removeAudiencePresence(tracker, 2);
    expect(tracker.count).toBe(0);
  });

  it('resets between sessions', () => {
    let tracker = addAudiencePresence(
      createAudiencePresenceTracker<number>(),
      7,
    );
    tracker = resetAudiencePresence<number>();
    expect(tracker.count).toBe(0);
    expect(tracker.ids.size).toBe(0);
  });

  it('replaces the whole set while excluding the local id', () => {
    const tracker = replaceAudiencePresence(
      ['host-chat', 'viewer-a', 'viewer-b', 'host-chat'],
      'host-chat',
    );
    expect(tracker.count).toBe(2);
    expect(tracker.ids.has('host-chat')).toBe(false);
    expect(tracker.ids.has('viewer-a')).toBe(true);
    expect(tracker.ids.has('viewer-b')).toBe(true);
  });

  it('returns the same reference when nothing changes', () => {
    const initial = addAudiencePresence(
      createAudiencePresenceTracker<number>(),
      5,
    );
    expect(addAudiencePresence(initial, 5)).toBe(initial);
    expect(removeAudiencePresence(initial, 99)).toBe(initial);
  });
});
