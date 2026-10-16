/**
 * Tracks unique audience/presence IDs for live viewer counting.
 * Derives count from a Set so duplicate join events are ignored and
 * leave events never decrement below zero.
 */
export type AudiencePresenceTracker<T extends string | number> = {
  readonly ids: ReadonlySet<T>;
  readonly count: number;
};

export const createAudiencePresenceTracker = <
  T extends string | number,
>(): AudiencePresenceTracker<T> => ({
  ids: new Set<T>(),
  count: 0,
});

export const addAudiencePresence = <T extends string | number>(
  tracker: AudiencePresenceTracker<T>,
  id: T,
  /** Optional local id that must never be counted (e.g. broadcaster UID). */
  excludeId?: T | null,
): AudiencePresenceTracker<T> => {
  if (excludeId !== undefined && excludeId !== null && id === excludeId) {
    return tracker;
  }
  if (tracker.ids.has(id)) {
    return tracker;
  }
  const ids = new Set(tracker.ids);
  ids.add(id);
  return {ids, count: ids.size};
};

export const removeAudiencePresence = <T extends string | number>(
  tracker: AudiencePresenceTracker<T>,
  id: T,
): AudiencePresenceTracker<T> => {
  if (!tracker.ids.has(id)) {
    return tracker;
  }
  const ids = new Set(tracker.ids);
  ids.delete(id);
  return {ids, count: ids.size};
};

export const resetAudiencePresence = <
  T extends string | number,
>(): AudiencePresenceTracker<T> => createAudiencePresenceTracker<T>();

export const replaceAudiencePresence = <T extends string | number>(
  ids: Iterable<T>,
  excludeId?: T | null,
): AudiencePresenceTracker<T> => {
  const next = new Set<T>();
  for (const id of ids) {
    if (excludeId !== undefined && excludeId !== null && id === excludeId) {
      continue;
    }
    next.add(id);
  }
  return {ids: next, count: next.size};
};
