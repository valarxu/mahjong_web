import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useStore } from '@/store';
import { friendsAPI } from '@/utils/api';
import { getRandomEmoji, formatDate } from '@/utils';
import { ArrowLeft, Plus, Edit, Trash2, UserPlus } from 'lucide-react';

const Friends: React.FC = () => {
  const { friends, setFriends, addFriend, removeFriend, updateFriend, loading, setLoading, errors, setError } = useStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingFriend, setEditingFriend] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', emoji: '' });

  // 加载好友列表
  useEffect(() => {
    loadFriends();
  }, []);

  const loadFriends = async () => {
    setLoading('friends', true);
    setError('friends', null);
    try {
      const data = await friendsAPI.getFriends();
      setFriends(data);
    } catch (error) {
      setError('friends', '加载好友列表失败');
      console.error('加载好友失败:', error);
    } finally {
      setLoading('friends', false);
    }
  };

  const handleAddFriend = async () => {
    if (!formData.name.trim()) {
      alert('请输入好友名称');
      return;
    }

    setLoading('friends', true);
    try {
      const newFriend = await friendsAPI.addFriend(
        formData.name.trim(),
        formData.emoji || getRandomEmoji()
      );
      
      if (newFriend) {
        addFriend(newFriend);
        setFormData({ name: '', emoji: '' });
        setShowAddForm(false);
      } else {
        alert('添加好友失败');
      }
    } catch (error) {
      console.error('添加好友失败:', error);
      alert('添加好友失败');
    } finally {
      setLoading('friends', false);
    }
  };

  const handleUpdateFriend = async (id: string) => {
    if (!formData.name.trim()) {
      alert('请输入好友名称');
      return;
    }

    setLoading('friends', true);
    try {
      const updatedFriend = await friendsAPI.updateFriend(
        id,
        formData.name.trim(),
        formData.emoji
      );
      
      if (updatedFriend) {
        updateFriend(id, updatedFriend);
        setFormData({ name: '', emoji: '' });
        setEditingFriend(null);
      } else {
        alert('更新好友失败');
      }
    } catch (error) {
      console.error('更新好友失败:', error);
      alert('更新好友失败');
    } finally {
      setLoading('friends', false);
    }
  };

  const handleDeleteFriend = async (id: string) => {
    if (!confirm('确定要删除这个好友吗？')) {
      return;
    }

    setLoading('friends', true);
    try {
      const success = await friendsAPI.deleteFriend(id);
      if (success) {
        removeFriend(id);
      } else {
        alert('删除好友失败');
      }
    } catch (error) {
      console.error('删除好友失败:', error);
      alert('删除好友失败');
    } finally {
      setLoading('friends', false);
    }
  };

  const startEdit = (friend: any) => {
    setEditingFriend(friend.id);
    setFormData({ name: friend.name, emoji: friend.emoji });
  };

  const cancelEdit = () => {
    setEditingFriend(null);
    setFormData({ name: '', emoji: '' });
  };

  const generateRandomEmoji = () => {
    setFormData({ ...formData, emoji: getRandomEmoji() });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部导航 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link to="/" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-xl font-semibold text-gray-800">好友管理</h1>
                <p className="text-sm text-gray-600">管理你的麻将好友</p>
              </div>
            </div>
            <Button
              onClick={() => setShowAddForm(true)}
              className="flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>添加好友</span>
            </Button>
          </div>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {loading.friends ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
            <p className="text-gray-600 mt-2">加载中...</p>
          </div>
        ) : errors.friends ? (
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{errors.friends}</p>
            <Button onClick={loadFriends} variant="secondary">
              重新加载
            </Button>
          </div>
        ) : friends.length === 0 ? (
          <div className="text-center py-12">
            <UserPlus className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-800 mb-2">还没有好友</h3>
            <p className="text-gray-600 mb-6">添加你的第一个麻将好友吧！</p>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              添加好友
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {friends.map((friend) => (
              <Card key={friend.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  {editingFriend === friend.id ? (
                    <div className="space-y-3">
                      <Input
                        label="好友名称"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="请输入好友名称"
                      />
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          头像
                        </label>
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl">{formData.emoji || friend.emoji}</span>
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={generateRandomEmoji}
                          >
                            随机
                          </Button>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => handleUpdateFriend(friend.id)}
                          loading={loading.friends}
                          className="flex-1"
                        >
                          保存
                        </Button>
                        <Button
                          onClick={cancelEdit}
                          variant="secondary"
                          className="flex-1"
                        >
                          取消
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="text-3xl">{friend.emoji}</div>
                        <div>
                          <h3 className="font-medium text-gray-800">{friend.name}</h3>
                          <p className="text-sm text-gray-500">
                            创建于 {formatDate(friend.createTime)}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEdit(friend)}
                          className="p-1"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteFriend(friend.id)}
                          className="p-1 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* 添加好友表单 */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>添加好友</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label="好友名称"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="请输入好友名称"
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    头像（可选）
                  </label>
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{formData.emoji || '🐶'}</span>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={generateRandomEmoji}
                    >
                      随机头像
                    </Button>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <Button
                    onClick={handleAddFriend}
                    loading={loading.friends}
                    className="flex-1"
                  >
                    添加
                  </Button>
                  <Button
                    onClick={() => {
                      setShowAddForm(false);
                      setFormData({ name: '', emoji: '' });
                    }}
                    variant="secondary"
                    className="flex-1"
                  >
                    取消
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default Friends;