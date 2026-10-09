const PREFIX = '[LiveStreaming]';

type LogDetails = Record<string, string | number | boolean | null | undefined>;

// Callers must pass only non-secret metadata (presence flags, ids, codes) — never tokens or auth headers.
export const liveLog = (event: string, details?: LogDetails) => {
  if (__DEV__) {
    console.log(PREFIX, event, details ?? '');
  }
};

export const liveWarn = (event: string, details?: LogDetails) => {
  if (__DEV__) {
    console.warn(PREFIX, event, details ?? '');
  }
};

export const describeError = (error: unknown): LogDetails => {
  if (error instanceof Error) {
    const statusCode = (error as Error & { statusCode?: number }).statusCode;
    return { errorName: error.name, errorMessage: error.message, statusCode };
  }
  return { errorMessage: String(error) };
};
