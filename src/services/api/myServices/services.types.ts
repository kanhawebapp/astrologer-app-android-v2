export interface BookedService {
  id: string;
  amount: number;
  paymentStatus: string;
  bookingStatus: string;
  createdAt: string;

  service: {
    id: string;
    name: string;
  };
}

export interface GetBookedServicesVariables {
  page: number;
  limit: number;
  paymentStatus?: 'SUCCESS' | 'FAILED' | 'PENDING' | string;
  bookingStatus?: 'ASSIGNED' | 'COMPLETED' | 'CANCELLED' | string;
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