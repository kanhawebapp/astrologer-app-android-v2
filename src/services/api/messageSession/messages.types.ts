// messages.types.ts

export interface SessionMessage {
  id: string;
  sender: 'USER' | 'ASTROLOGER';
  message: string;
  image: string | null;
  createdAt: string;
}

export interface GetSessionMessagesResponse {
  success: boolean;
  totalCount: number;
  data: SessionMessage[];
}