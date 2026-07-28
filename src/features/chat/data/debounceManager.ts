export class DebounceManager {
  private debounceMap: Map<string, number> = new Map();
  private static readonly DEFAULT_DEBOUNCE_MS = 500;
  private static readonly MAX_DEBOUNCE_MS = 5000;

  shouldProcess(
    key: string,
    debounceMs: number = DebounceManager.DEFAULT_DEBOUNCE_MS,
  ): boolean {
    const now = Date.now();
    const lastProcessed = this.debounceMap.get(key) || 0;

    if (now - lastProcessed < debounceMs) {
      return false;
    }

    this.debounceMap.set(key, now);
    return true;
  }

  markProcessed(key: string): void {
    this.debounceMap.set(key, Date.now());
  }

  isDuplicate(key: string, seenKeys: Set<string>): boolean {
    if (seenKeys.has(key)) {
      return true;
    }
    seenKeys.add(key);
    return false;
  }

  clear(): void {
    this.debounceMap.clear();
  }

  getDebounceMs(): number {
    return DebounceManager.DEFAULT_DEBOUNCE_MS;
  }

  getMaxDebounceMs(): number {
    return DebounceManager.MAX_DEBOUNCE_MS;
  }
}

export const debounceManager = new DebounceManager();
