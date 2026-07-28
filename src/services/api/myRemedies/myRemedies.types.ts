export interface SessionRemedy {
  id: string;
  sessionId: string;
  sessionType: string;
  remedyText: string;
  createdAt: string;
}

export interface SessionRemedyFilter {
  page?: number;
  limit?: number;
}

export interface GetSessionRemediesVariables {
  filter?: SessionRemedyFilter;
}

export interface SessionRemedyResponse {
  success: boolean;
  message: string;
  totalCount: number;
  currentPage: number;
  totalPages: number;
  data: SessionRemedy[];
}

export interface GetSessionRemediesData {
  [x: string]: any;
  getSessionRemedies: SessionRemedyResponse;
}