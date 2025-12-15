import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useStore } from '@/store';
import { recordsAPI } from '@/utils/api';
import { formatDate, mahjongUtils } from '@/utils';
import { ArrowLeft, Trash2, Calendar, User, Trophy, RotateCcw } from 'lucide-react';

const History: React.FC = () => {
  const { records, setRecords, removeRecord, loading, setLoading } = useStore();
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterFriend, setFilterFriend] = useState('');
  const limit = 10;

  // 加载历史记录
  useEffect(() => {
    loadRecords();
  }, [page, filterFriend]);

  const loadRecords = async () => {
    setLoading('records', true);
    try {
      const response = await recordsAPI.getRecords(page, limit, filterFriend);
      setRecords(response.data);
      setTotalPages(Math.ceil(response.pagination.total / limit));
    } catch (error) {
      console.error('加载历史记录失败:', error);
    } finally {
      setLoading('records', false);
    }
  };

  const handleDeleteRecord = async (id: string) => {
    if (!confirm('确定要删除这条记录吗？')) {
      return;
    }

    try {
      const success = await recordsAPI.deleteRecord(id);
      if (success) {
        removeRecord(id);
        // 如果当前页没有数据了，就回到上一页
        if (records.length === 1 && page > 1) {
          setPage(page - 1);
        } else {
          loadRecords();
        }
      } else {
        alert('删除失败');
      }
    } catch (error) {
      console.error('删除记录失败:', error);
      alert('删除失败');
    }
  };

  const groupRecordsByDate = (records: any[]) => {
    const groups: { [key: string]: any[] } = {};
    
    records.forEach(record => {
      const date = new Date(record.createTime).toLocaleDateString('zh-CN');
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(record);
    });

    return groups;
  };

  const groupedRecords = groupRecordsByDate(records);
  const sortedDates = Object.keys(groupedRecords).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

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
                <h1 className="text-xl font-semibold text-gray-800">历史记录</h1>
                <p className="text-sm text-gray-600">查看所有游戏记录</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* 筛选器 */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-500" />
                <select
                  value={filterFriend}
                  onChange={(e) => {
                    setFilterFriend(e.target.value);
                    setPage(1);
                  }}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">所有好友</option>
                  {/* 这里需要获取好友列表来显示好友筛选选项 */}
                </select>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setFilterFriend('');
                  setPage(1);
                }}
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                重置
              </Button>
            </div>
          </CardContent>
        </Card>

        {loading.records ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
            <p className="text-gray-600 mt-2">加载中...</p>
          </div>
        ) : sortedDates.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-800 mb-2">还没有游戏记录</h3>
            <p className="text-gray-600 mb-6">开始记录你的第一局游戏吧！</p>
            <Link to="/record">
              <Button>
                <Trophy className="h-4 w-4 mr-2" />
                开始记录
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedDates.map(date => (
              <div key={date}>
                <div className="flex items-center space-x-2 mb-3">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <h3 className="font-medium text-gray-700">{date}</h3>
                  <span className="text-sm text-gray-500">
                    ({groupedRecords[date].length} 局)
                  </span>
                </div>
                <div className="space-y-3">
                  {groupedRecords[date].map(record => (
                    <Card key={record.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="text-sm text-gray-500">
                            {formatDate(record.createTime)}
                          </div>
                          <div className="text-sm font-medium">
                            总分: <span className={record.totalScore >= 0 ? 'text-green-600' : 'text-red-600'}>
                              {record.totalScore >= 0 ? '+' : ''}{record.totalScore}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {record.records.map((item: any, index: number) => {
                            const resultType = mahjongUtils.getResultType(item.type);
                            return (
                              <div key={index} className="flex items-center justify-between py-1">
                                <div className="flex items-center space-x-2">
                                  <span className="text-lg">{/* 这里需要显示好友头像 */}</span>
                                  <span className="font-medium">{item.friendName}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span 
                                    className="px-2 py-1 rounded text-xs font-medium"
                                    style={{ 
                                      backgroundColor: resultType.color + '20',
                                      color: resultType.color 
                                    }}
                                  >
                                    {resultType.label}
                                  </span>
                                  <span className="font-medium text-gray-700">
                                    {item.score}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        <div className="flex justify-end mt-3 pt-3 border-t border-gray-100">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteRecord(record.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            删除
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}

            {/* 分页 */}
            {totalPages > 1 && (
              <div className="flex justify-center space-x-2 mt-8">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                >
                  上一页
                </Button>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
                    return (
                      <Button
                        key={pageNum}
                        variant={pageNum === page ? 'primary' : 'secondary'}
                        size="sm"
                        onClick={() => setPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                >
                  下一页
                </Button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default History;