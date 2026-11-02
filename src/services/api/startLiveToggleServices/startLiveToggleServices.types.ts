export type LiveToggleServiceType = 'LIVE';

/** Exact success message required before starting Agora LIVE. */
export const LIVE_ENABLED_SUCCESS_MESSAGE =
  'LIVE enabled successfully. CHAT and CALL disabled.';

/** Exact success message required before stopping Agora LIVE. */
export const LIVE_DISABLED_SUCCESS_MESSAGE = 'LIVE disabled successfully';

export interface StartLiveToggleServicesVariables {
  astrologerId: string;
  serviceType: LiveToggleServiceType | string;
  status: boolean;
}

export interface ToggleServiceResponse {
  success: boolean;
  message: string;
  __typename?: string;
}

export interface StartLiveToggleServicesResponse {
  startLiveToggleServices: ToggleServiceResponse;
}
