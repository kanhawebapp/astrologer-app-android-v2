export interface Notice {
  id: string;
  title: string;
  description: string;
  targetType: string;
  isPinned: boolean;
  isActive: boolean;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
}

export interface GetAstrologerNoticesData {
  getAstrologerNotices: Notice[];
}