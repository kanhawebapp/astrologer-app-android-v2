export interface PreviousRemedy {
  id: string;
  sessionId: string;
  sessionType: string;
  remedyText: string;
  createdAt: string;
  __typename?: string;
}

export interface GetPreviousRemediesVariables {
  userId: string;
}

export interface GetPreviousRemediesData {
  getPreviousRemedies: PreviousRemedy[];
}
