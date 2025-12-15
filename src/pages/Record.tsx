import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { useStore } from '@/store';
import { recordsAPI } from '@/utils/api';
import { ArrowLeft, Plus, Minus, Send } from 'lucide-react';

interface RecordItem {
  friendId: string;
  friendName: string;
  type: '胜' | '负';
  score: string;
}

const Record: React.FC = () => {
  const { friends, addRecord, loading, setLoading } = useStore();
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // 初始化至少一条记录
  useEffect(() => {
    if (friends.length > 0 && records.length === 0) {
      setRecords([
        {
          friendId: '',
          friendName: '',
          type: '胜',
          score: '',
        },
      ]);
    }
  }, [friends]);

  const addRecordRow = () => {
    setRecords([
      ...records,
      {
        friendId: '',
        friendName: '',
        type: '胜',
        score: '',
      },
    ]);
  };

  const removeRecordRow = (index: number) => {
    if (records.length > 1) {
      setRecords(records.filter((_, i) => i !== index));
    }
  };

  const updateRecord = (index: number, field: keyof RecordItem, value: string) => {
    const newRecords = [...records];
    if (field === 'friendId') {
      const friend = friends.find(f => f.id === value);
      newRecords[index].friendId = value;
      newRecords[index].friendName = friend?.name || '';
    } else {
      newRecords[index][field] = value as any;
    }
    setRecords(newRecords);
  };

  const handleSubmit = async () => {
    // 验证数据
    const validRecords = records.filter(r => r.friendId && r.score);
    if (validRecords.length === 0) {
      alert('请至少填写一条完整的记录');
      return;
    }

    // 检查是否有重复的好友
    const friendIds = validRecords.map(r => r.friendId);
    const uniqueIds = new Set(friendIds);
    if (friendIds.length !== uniqueIds.size) {
      alert('不能为同一个好友添加多条记录');
      return;
    }

    setSubmitting(true);
    try {
      const newRecord = await recordsAPI.addRecord(validRecords);
      if (newRecord) {
        addRecord(newRecord);
        alert('记录保存成功！');
        // 重置表单
        setRecords([
          {
            friendId: '',
            friendName: '',
            type: '胜',
            score: '',
          },
        ]);
      } else {
        alert('保存失败，请重试');
      }
    } catch (error) {
      console.error('保存记录失败:', error);
      alert('保存失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  const getTotalScore = () => {
    return records.reduce((total, record) => {
      const score = parseInt(record.score) || 0;
      return record.type === '胜' ? total + score : total - score;
    }, 0);
  };

  if (friends.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center space-x-3">
              <Link to="/" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-xl font-semibold text-gray-800">记录游戏</h1>
                <p className="text-sm text-gray-600">记录麻将游戏成绩</p>
              </div>
            </div>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 py-8 text-center">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">还没有好友</h2>
            <p className="text-gray-600 mb-6">请先添加一些好友再开始记录游戏</p>
            <Link to="/friends">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                添加好友
              </Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

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
                <h1 className="text-xl font-semibold text-gray-800">记录游戏</h1>
                <p className="text-sm text-gray-600">记录麻将游戏成绩</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                总分: <span className={`font-semibold ${getTotalScore() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {getTotalScore() >= 0 ? '+' : ''}{getTotalScore()}
                </span>
              </div>
              <Button onClick={handleSubmit} loading={submitting}>
                <Send className="h-4 w-4 mr-2" />
                提交
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        <Card>
          <CardHeader>
            <CardTitle>游戏记录</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {records.map((record, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <Select
                    value={record.friendId}
                    onChange={(e) => updateRecord(index, 'friendId', e.target.value)}
                    options={[
                      { value: '', label: '选择好友' },
                      ...friends.map(friend => ({
                        value: friend.id,
                        label: `${friend.emoji} ${friend.name}`,
                      })),
                    ]}
                  />
                </div>
                <div className="w-24">
                  <Select
                    value={record.type}
                    onChange={(e) => updateRecord(index, 'type', e.target.value as '胜' | '负')}
                    options={[
                      { value: '胜', label: '胜' },
                      { value: '负', label: '负' },
                    ]}
                  />
                </div>
                <div className="w-24">
                  <Input
                    type="number"
                    placeholder="分数"
                    value={record.score}
                    onChange={(e) => updateRecord(index, 'score', e.target.value)}
                  />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeRecordRow(index)}
                  disabled={records.length <= 1}
                  className="p-2"
                >
                  <Minus className="h-4 w-4" />
                </Button>
              </div>
            ))}

            <div className="flex justify-center pt-4">
              <Button
                variant="secondary"
                onClick={addRecordRow}
                className="flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>添加记录</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 说明信息 */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-800 mb-2">使用说明</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• 选择参与游戏的好友</li>
            <li>• 选择胜负情况（胜/负）</li>
            <li>• 输入得分</li>
            <li>• 系统会自动计算总分</li>
          </ul>
        </div>
      </main>
    </div>
  );
};

export default Record;