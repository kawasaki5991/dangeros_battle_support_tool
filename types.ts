
export type UnitType = 'character' | 'wall';
export type Gender = '男' | '女' | '両' | '無';
export type Team = '生徒会' | '番長G' | '転校生' | 'その他';

export interface Unit {
  id: string;
  room_id: string;
  type: UnitType;
  name: string;
  gender?: Gender;
  atk: number;
  def: number;
  hp: number;
  max_hp: number;
  mp: number;
  max_mp: number;
  fs_value: number;
  ability_name?: string;
  activation_rate?: number;
  success_rate?: number;
  remarks?: string;
  team?: Team;
  pos_x: number | null; // 0-6
  pos_y: number | null; // 0-4
  is_dead: boolean;
  is_leader: boolean;
  is_secret: boolean;
  is_ability_rest: boolean;
}

export interface Message {
  id: string;
  room_id: string;
  handle_name: string;
  content: string;
  is_system: boolean;
  created_at: string;
}

export interface UserSession {
  handleName: string;
  roomId: string | null;
  roomName: string | null;
  isHost: boolean;
  isConnected: boolean;
}

export type SyncPayload = 
  | { type: 'STATE_SYNC', units: Unit[], messages: Message[], teamDP: Record<Team, number>, users: string[] }
  | { type: 'UNIT_UPDATE', unit: Partial<Unit> & { id: string } }
  | { type: 'UNIT_DELETE', id: string }
  | { type: 'UNIT_ADD', unit: Unit }
  | { type: 'MESSAGE_ADD', message: Message }
  | { type: 'DP_UPDATE', team: Team, dp: number }
  | { type: 'USER_JOIN', handleName: string };
