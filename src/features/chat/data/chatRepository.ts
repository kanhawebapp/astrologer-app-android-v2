import { graphqlRequest } from '../../../services/graphqlClient';
import { ChatRoomUI } from '../domain/chatTypes';

const GET_CHAT_HISTORY_QUERY = `
  query GetChatHistory($page: Int, $limit: Int) {
    getUserChatHistory(page: $page, limit: $limit) {
      roomId
      sessionId
      startedAt
      endedAt
      status
      user {
        id
        name
        mobile
      }
      astrologer {
        id
        name
        profilePic
        experience
        price
      }
      lastMessage {
        message
        sender
        createdAt
      }
    }
  }
`;

interface ApiChatRoom {
  roomId: string;
  sessionId: string;
  startedAt: string;
  endedAt: string | null;
  status: string;
  user: { id: string; name: string; mobile: string } | null;
  astrologer: {
    id: string;
    name: string;
    profilePic: string;
    experience: number;
    price: number;
  } | null;
  lastMessage: { message: string; sender: string; createdAt: string } | null;
}

interface GetChatHistoryResponse {
  getUserChatHistory: ApiChatRoom[];
}

const mapChatRoomToUI = (chat: ApiChatRoom): ChatRoomUI => {
  return {
    id: chat.sessionId,
    roomId: chat.roomId,
    sessionId: chat.sessionId,
    userName: chat.user?.name ?? 'Unknown User',
    astrologerName: chat.astrologer?.name ?? 'Unknown Astrologer',
    astrologerProfilePic: chat.astrologer?.profilePic ?? '',
    astrologerExperience: chat.astrologer?.experience ?? 0,
    astrologerPrice: chat.astrologer?.price ?? 0,
    lastMessage: chat.lastMessage?.message ?? '',
    startedAt: chat.startedAt,
    endedAt: chat.endedAt,
    status: chat.status as 'active' | 'completed' | 'missed',
    unreadCount: 0,
  };
};

export const getChatHistory = async (
  page: number = 1,
  limit: number = 20,
  token?: string,
): Promise<ChatRoomUI[]> => {
  console.log('=== getChatHistory CALLED ===');
  console.log('page:', page, 'limit:', limit);
  console.log('token present:', !!token);
  console.log(
    'token value:',
    token ? `${token.substring(0, 20)}...` : 'undefined/null',
  );
  console.log('================================');

  const response = await graphqlRequest<GetChatHistoryResponse>({
    // query: ' https://dhwaniastro.com/userAuth/graphql',
    query: GET_CHAT_HISTORY_QUERY,
    variables: { page, limit },
    token,
  });

  if (!response.getUserChatHistory) {
    return [];
  }

  const chats = response.getUserChatHistory;
  return chats.map(mapChatRoomToUI);
};

export { mapChatRoomToUI };
