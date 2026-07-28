export type AstrologerServiceType =
  | 'CHAT'
  | 'CALL'
  | 'LIVE'
  | 'PROMOTIONAL';

export interface ToggleAstrologerServiceVariables {
  astrologerId: string;
  serviceType: AstrologerServiceType;
  status: boolean;
}

export interface ToggleAstrologerServiceResponse {
  data: any;
  toggleAstrologerService: {
    success: boolean;
    message: string;
  };
}

export interface GetAstrologerServicesVariables {
  astrologerId: string;
}

export interface AstrologerServices {
  isChatActive: boolean;
  isCallActive: boolean;
  isLiveActive: boolean;
  isPromotional: boolean;
}

export interface GetAstrologerServicesResponse {
  data: any;
  getAstrologerById: AstrologerServices;
}