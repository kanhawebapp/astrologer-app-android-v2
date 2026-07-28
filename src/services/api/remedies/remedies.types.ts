export interface Remedy {
  id: string;
  title: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GetRemediesResponse {
  success: boolean;
  message: string;
  data: Remedy[];
}

export interface SendRemedyInput {
  sessionId: string;
  remedyText: string;
}

export interface SendRemedyResponse {
  success: boolean;
  message: string;
}

export interface SessionRemedy {
  id: string;
  sessionId: string;
  sessionType: string;
  remedyText: string;
  createdAt: string;
}

export interface GetSessionRemediesResponse {
  success: boolean;
  message: string;
  totalCount: number;
  currentPage: number;
  totalPages: number;
  data: SessionRemedy[];
}