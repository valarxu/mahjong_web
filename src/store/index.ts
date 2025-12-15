import { create } from 'zustand';

// 好友类型
export interface Friend {
  id: string;
  name: string;
  emoji: string;
  createTime: string;
}

// 游戏记录类型
export interface GameRecord {
  id: string;
  createTime: string;
  records: {
    friendId: string;
    friendName: string;
    type: '胜' | '负';
    score: string;
  }[];
  totalScore: number;
}

// 统计数据类型
export interface Stats {
  friendId: string;
  friendName: string;
  totalScore: number;
  winCount: number;
  loseCount: number;
  winRate: number;
}

// AI聊天记录类型
export interface AIChat {
  id: string;
  message: string;
  reply: string;
  timestamp: string;
}

// 应用状态
interface AppState {
  // 数据
  friends: Friend[];
  records: GameRecord[];
  stats: Stats[];
  aiChats: AIChat[];
  
  // 加载状态
  loading: {
    friends: boolean;
    records: boolean;
    stats: boolean;
    aiChat: boolean;
  };
  
  // 错误状态
  errors: {
    friends: string | null;
    records: string | null;
    stats: string | null;
    aiChat: string | null;
  };
  
  // 操作方法
  setFriends: (friends: Friend[]) => void;
  setRecords: (records: GameRecord[]) => void;
  setStats: (stats: Stats[]) => void;
  setAIChats: (chats: AIChat[]) => void;
  
  // 加载状态操作
  setLoading: (key: keyof AppState['loading'], value: boolean) => void;
  setError: (key: keyof AppState['errors'], value: string | null) => void;
  
  // 添加单个项目
  addFriend: (friend: Friend) => void;
  addRecord: (record: GameRecord) => void;
  addAIChat: (chat: AIChat) => void;
  
  // 删除项目
  removeFriend: (id: string) => void;
  removeRecord: (id: string) => void;
  
  // 更新项目
  updateFriend: (id: string, friend: Partial<Friend>) => void;
}

export const useStore = create<AppState>((set) => ({
  // 初始状态
  friends: [],
  records: [],
  stats: [],
  aiChats: [],
  
  loading: {
    friends: false,
    records: false,
    stats: false,
    aiChat: false,
  },
  
  errors: {
    friends: null,
    records: null,
    stats: null,
    aiChat: null,
  },
  
  // 设置数据
  setFriends: (friends) => set({ friends }),
  setRecords: (records) => set({ records }),
  setStats: (stats) => set({ stats }),
  setAIChats: (aiChats) => set({ aiChats }),
  
  // 设置加载状态
  setLoading: (key, value) => set((state) => ({
    loading: { ...state.loading, [key]: value }
  })),
  
  // 设置错误状态
  setError: (key, value) => set((state) => ({
    errors: { ...state.errors, [key]: value }
  })),
  
  // 添加单个项目
  addFriend: (friend) => set((state) => ({
    friends: [...state.friends, friend]
  })),
  
  addRecord: (record) => set((state) => ({
    records: [record, ...state.records]
  })),
  
  addAIChat: (chat) => set((state) => ({
    aiChats: [...state.aiChats, chat]
  })),
  
  // 删除项目
  removeFriend: (id) => set((state) => ({
    friends: state.friends.filter(f => f.id !== id)
  })),
  
  removeRecord: (id) => set((state) => ({
    records: state.records.filter(r => r.id !== id)
  })),
  
  // 更新项目
  updateFriend: (id, friendData) => set((state) => ({
    friends: state.friends.map(f => 
      f.id === id ? { ...f, ...friendData } : f
    )
  })),
}));