export interface AstrologerServices {
  isChatActive: boolean;
  isCallActive: boolean;
  isLiveActive: boolean;
  isPromotional: boolean;
}

export interface GetAstrologerServicesResponse {
  success: boolean;
  message: string;
  data: AstrologerServices;
}

export interface ToggleAstrologerServiceInput {
  astrologerId: any;
  serviceType: string;
  status: boolean;
}

export interface ToggleAstrologerServiceResponse {
  success: boolean;
  message: string;
}