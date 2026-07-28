export interface BookedService {
  id: string;
  name: string;
  dob: string;
  tob: string;
  pob: string;
  gender: string;
  concern: string;
  amount: number;
  paymentStatus: string;
  bookingStatus: string;
  createdAt: string;

  service: {
    id: string;
    name: string;
    price: number;
  };
}

export interface GetBookedServicesVariables {
  page: number;
  limit: number;
}

export interface BookedServicesResponse {
  success: boolean;
  total: number;
  currentPage: number;
  totalPages: number;
  limit: number;
  data: BookedService[];
}

export interface GetBookedServicesData {
  getAstrologerAssignedBookedServices: BookedServicesResponse;
}