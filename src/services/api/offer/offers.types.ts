
export interface Offer {
  id: string;
  offerName: string;
  price: number;
  description: string;
  isActive: boolean;
  selected: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GetOffersResponse {
  success: boolean;
  message: string;
  data: Offer[];
}

export interface UpdateOfferStatusInput {
  offerId: string;
  isActive: boolean;
}

export interface UpdateOfferStatusResponse {
  success: boolean;
  message: string;
}