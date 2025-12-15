import type { Friend, GameRecord, Stats, AIChat } from '@/store';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000/api';

// API响应类型
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// 分页响应类型
interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

// 通用请求函数
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data as T;
  } catch (error) {
    console.error('API请求失败:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : '网络请求失败',
    } as unknown as T;
  }
}

// 好友管理API
export const friendsAPI = {
  // 获取好友列表
  async getFriends(): Promise<Friend[]> {
    const response = await request<ApiResponse<Friend[]>>('/friends');
    return response.success ? response.data || [] : [];
  },

  // 添加好友
  async addFriend(name: string, emoji?: string): Promise<Friend | null> {
    const response = await request<ApiResponse<Friend>>('/friends', {
      method: 'POST',
      body: JSON.stringify({ name, emoji }),
    });
    return response.success ? response.data || null : null;
  },

  // 更新好友
  async updateFriend(id: string, name: string, emoji?: string): Promise<Friend | null> {
    const response = await request<ApiResponse<Friend>>(`/friends/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name, emoji }),
    });
    return response.success ? response.data || null : null;
  },

  // 删除好友
  async deleteFriend(id: string): Promise<boolean> {
    const response = await request<ApiResponse<unknown>>(`/friends/${id}`, {
      method: 'DELETE',
    });
    return response.success;
  },
};

// 游戏记录API
export const recordsAPI = {
  // 获取游戏记录
  async getRecords(page = 1, limit = 10, friendId?: string): Promise<PaginatedResponse<GameRecord>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (friendId) {
      params.append('friendId', friendId);
    }
    
    const response = await request<PaginatedResponse<GameRecord>>(`/records?${params}`);
    return response.success ? response : { success: true, data: [], pagination: { page: 1, limit: 10, total: 0 } };
  },

  // 添加游戏记录
  async addRecord(records: {
    friendId: string;
    friendName: string;
    type: '胜' | '负';
    score: string;
  }[]): Promise<GameRecord | null> {
    const response = await request<ApiResponse<GameRecord>>('/records', {
      method: 'POST',
      body: JSON.stringify({ records }),
    });
    return response.success ? response.data || null : null;
  },

  // 删除游戏记录
  async deleteRecord(id: string): Promise<boolean> {
    const response = await request<ApiResponse<unknown>>(`/records/${id}`, {
      method: 'DELETE',
    });
    return response.success;
  },
};

// 统计数据API
export const statsAPI = {
  // 获取统计数据
  async getStats(): Promise<Stats[]> {
    const response = await request<ApiResponse<Stats[]>>('/stats');
    return response.success ? response.data || [] : [];
  },
};

// AI聊天API
export const aiAPI = {
  // 发送消息
  async sendMessage(message: string): Promise<{ reply: string; timestamp: string } | null> {
    const response = await request<ApiResponse<{ reply: string; timestamp: string }>>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
    return response.success ? response.data || null : null;
  },
};

// 健康检查
export const healthAPI = {
  async checkHealth(): Promise<boolean> {
    try {
      const response = await request<ApiResponse<unknown>>('/health');
      return response.success;
    } catch {
      return false;
    }
  },
};
