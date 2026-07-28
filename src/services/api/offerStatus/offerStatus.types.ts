export interface UpdateOfferStatusInput {
  offerId: string;
  isActive: boolean;
}

export interface UpdateOfferStatusResponse {
  data: any;
  updateOfferStatus: {
    success: boolean;
    message: string;
  };
}