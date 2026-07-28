export interface RoomSessionData {
  sessionId: string;
  userId: string;
  userName: string;
  astrologerId: string;
}

export class RoomSessionManager {
  private roomSessionMap: Map<string, RoomSessionData> = new Map();

  setRoomSession(roomId: string, data: RoomSessionData): void {
    this.roomSessionMap.set(roomId, data);
  }

  getRoomSession(roomId: string): RoomSessionData | undefined {
    return this.roomSessionMap.get(roomId);
  }

  deleteRoomSession(roomId: string): void {
    this.roomSessionMap.delete(roomId);
  }

  clearRoomSessionMap(): void {
    this.roomSessionMap.clear();
  }

  hasRoom(roomId: string): boolean {
    return this.roomSessionMap.has(roomId);
  }

  getAllRooms(): string[] {
    return Array.from(this.roomSessionMap.keys());
  }

  getFirstRoom(): string | undefined {
    const keys = this.getAllRooms();
    return keys[0];
  }
}

export const roomSessionManager = new RoomSessionManager();
