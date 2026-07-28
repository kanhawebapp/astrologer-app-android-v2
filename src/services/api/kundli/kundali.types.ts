export interface GetKundaliVariables {
  requestSessionId: string;
}

export interface KundaliResponse {
  status: boolean;
  userId: string;
  requestType: string;
  requestSessionId: string;
  userName: string;
  data: string; // JSON string from backend
}

export interface GetKundaliData {
  getKundali: KundaliResponse;
}