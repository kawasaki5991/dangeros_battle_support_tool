import { create } from 'zustand';
import { Unit, Message, UserSession, Team, SyncPayload } from './types';

interface DangerosState {
  session: UserSession;
  units: Unit[];
  messages: Message[];
  users: string[];
  teamDP: Record<Team, number>;
  
  // Actions
  setSession: (session: Partial<UserSession>) => void;
  setUnits: (units: Unit[]) => void;
  setMessages: (messages: Message[]) => void;
  setUsers: (users: string[]) => void;
  
  // Local Actions (Trigger Sync)
  addMessage: (message: Message, remote?: boolean) => void;
  updateUnit: (unit: Partial<Unit> & { id: string }, remote?: boolean) => void;
  addUnit: (unit: Unit, remote?: boolean) => void;
  deleteUnit: (id: string, remote?: boolean) => void;
  updateTeamDP: (team: Team, dp: number, remote?: boolean) => void;
  
  // Sync Callback
  onSync: (payload: SyncPayload) => void;
  broadcast: (payload: SyncPayload) => void;
  setBroadcastHandler: (handler: (payload: SyncPayload) => void) => void;
}

let broadcastHandler: ((payload: SyncPayload) => void) | null = null;

export const useStore = create<DangerosState>((set, get) => ({
  session: {
    handleName: '',
    roomId: null,
    roomName: null,
    isHost: false,
    isConnected: false,
  },
  units: [],
  messages: [],
  users: [],
  teamDP: {
    '生徒会': 0,
    '番長G': 0,
    '転校生': 0,
    'その他': 0,
  },

  setSession: (sessionUpdate) =>
    set((state) => ({ session: { ...state.session, ...sessionUpdate } })),
  
  setUnits: (units) => set({ units }),
  setMessages: (messages) => set({ messages }),
  setUsers: (users) => set({ users }),

  broadcast: (payload) => {
    if (broadcastHandler) broadcastHandler(payload);
  },

  setBroadcastHandler: (handler) => {
    broadcastHandler = handler;
  },

  addMessage: (message, remote = false) => {
    set((state) => ({ messages: [...state.messages, message] }));
    if (!remote) get().broadcast({ type: 'MESSAGE_ADD', message });
  },

  updateUnit: (update, remote = false) => {
    set((state) => ({
      units: state.units.map((u) => (u.id === update.id ? { ...u, ...update } : u)),
    }));
    if (!remote) get().broadcast({ type: 'UNIT_UPDATE', unit: update });
  },

  addUnit: (unit, remote = false) => {
    set((state) => ({ units: [...state.units, unit] }));
    if (!remote) get().broadcast({ type: 'UNIT_ADD', unit });
  },

  deleteUnit: (id, remote = false) => {
    set((state) => ({
      units: state.units.filter((u) => u.id !== id),
    }));
    if (!remote) get().broadcast({ type: 'UNIT_DELETE', id });
  },

  updateTeamDP: (team, dp, remote = false) => {
    set((state) => ({
      teamDP: { ...state.teamDP, [team]: dp },
    }));
    if (!remote) get().broadcast({ type: 'DP_UPDATE', team, dp });
  },

  onSync: (payload) => {
    switch (payload.type) {
      case 'STATE_SYNC':
        set({
          units: payload.units,
          messages: payload.messages,
          teamDP: payload.teamDP,
          users: payload.users,
        });
        break;
      case 'UNIT_UPDATE':
        get().updateUnit(payload.unit, true);
        break;
      case 'UNIT_ADD':
        get().addUnit(payload.unit, true);
        break;
      case 'UNIT_DELETE':
        get().deleteUnit(payload.id, true);
        break;
      case 'MESSAGE_ADD':
        get().addMessage(payload.message, true);
        break;
      case 'DP_UPDATE':
        get().updateTeamDP(payload.team, payload.dp, true);
        break;
      case 'USER_JOIN':
        set((state) => ({
          users: state.users.includes(payload.handleName) 
            ? state.users 
            : [...state.users, payload.handleName]
        }));
        break;
    }
  }
}));