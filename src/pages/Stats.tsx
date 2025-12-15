import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useStore } from '@/store';
import { statsAPI } from '@/utils/api';
import { mahjongUtils } from '@/utils';
import { ArrowLeft, Trophy, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';

const Stats: React.FC = () => {
  const { stats, setStats, loading, setLoading } = useStore();
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);

  // 加载统计数据
  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading('stats', true);
    try {
      const data = await statsAPI.getStats();
      setStats(data);
    } catch (error) {
      console.error('加载统计数据失败:', error);
    } finally {
      setLoading('stats', false);
    }
  };

  const getWinRateColor = (winRate: number) => {
    if (winRate >= 0.6) return 'text-green-600';
    if (winRate >= 0.4) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreColor = (score: number) => {
    if (score > 0) return 'text-green-600';
    if (score < 0) return 'text-red-600';
    return 'text-gray-600';
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
                <h1 className="text-xl font-semibold text-gray-800">对战统计</h1>
                <p className="text-sm text-gray-600">查看战绩统计分析</p>
              </div>
            </div>
            <Button onClick={loadStats} variant="secondary" size="sm">
              <BarChart3 className="h-4 w-4 mr-1" />
              刷新
            </Button>
          </div>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {loading.stats ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
            <p className="text-gray-600 mt-2">加载中...</p>
          </div>
        ) : stats.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-800 mb-2">还没有统计数据</h3>
            <p className="text-gray-600 mb-6">先添加一些游戏记录再来查看统计吧！</p>
            <Link to="/record">
              <Button>
                <Trophy className="h-4 w-4 mr-2" />
                开始记录
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 总体统计 */}
            <Card>
              <CardHeader>
                <CardTitle>总体统计</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{stats.length}</div>
                    <div className="text-sm text-gray-600">参与玩家</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {stats.reduce((sum, s) => sum + s.winCount + s.loseCount, 0)}
                    </div>
                    <div className="text-sm text-gray-600">总局数</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {stats.reduce((sum, s) => sum + s.winCount, 0)}
                    </div>
                    <div className="text-sm text-gray-600">总胜利</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {stats.reduce((sum, s) => sum + s.loseCount, 0)}
                    </div>
                    <div className="text-sm text-gray-600">总失败</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 排行榜 */}
            <Card>
              <CardHeader>
                <CardTitle>排行榜</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.map((stat, index) => (
                    <div
                      key={stat.friendId}
                      className={`flex items-center justify-between p-4 rounded-lg border transition-all cursor-pointer hover:shadow-md ${
                        selectedPlayer === stat.friendId ? 'border-orange-300 bg-orange-50' : 'border-gray-200'
                      }`}
                      onClick={() => setSelectedPlayer(selectedPlayer === stat.friendId ? null : stat.friendId)}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="text-2xl font-bold text-gray-400 w-8">
                          {mahjongUtils.getRankIcon(index + 1)}
                        </div>
                        <div className="text-3xl">🐶</div>
                        <div>
                          <div className="font-semibold text-gray-800">{stat.friendName}</div>
                          <div className="text-sm text-gray-600">
                            {stat.winCount + stat.loseCount} 局 • {stat.winCount} 胜 {stat.loseCount} 负
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${getScoreColor(stat.totalScore)}`}>
                          {stat.totalScore >= 0 ? '+' : ''}{stat.totalScore}
                        </div>
                        <div className={`text-sm ${getWinRateColor(stat.winRate)}`}>
                          胜率 {(stat.winRate * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 详细分析 */}
            {selectedPlayer && (
              <Card>
                <CardHeader>
                  <CardTitle>详细分析</CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const player = stats.find(s => s.friendId === selectedPlayer);
                    if (!player) return null;
                    
                    return (
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <div className="text-2xl font-bold text-orange-600">{player.totalScore}</div>
                            <div className="text-sm text-gray-600">总得分</div>
                          </div>
                          <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">{player.winCount}</div>
                            <div className="text-sm text-gray-600">胜利次数</div>
                          </div>
                          <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <div className="text-2xl font-bold text-red-600">{player.loseCount}</div>
                            <div className="text-sm text-gray-600">失败次数</div>
                          </div>
                          <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <div className={`text-2xl font-bold ${getWinRateColor(player.winRate)}`}>
                              {(player.winRate * 100).toFixed(1)}%
                            </div>
                            <div className="text-sm text-gray-600">胜率</div>
                          </div>
                          <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">
                              {player.winCount + player.loseCount}
                            </div>
                            <div className="text-sm text-gray-600">总局数</div>
                          </div>
                          <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <div className="text-2xl font-bold text-purple-600">
                              {player.winCount + player.loseCount > 0 
                                ? Math.round(player.totalScore / (player.winCount + player.loseCount))
                                : 0
                              }
                            </div>
                            <div className="text-sm text-gray-600">平均得分</div>
                          </div>
                        </div>

                        {/* 胜负趋势 */}
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-3">胜负趋势</h4>
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              <TrendingUp className="h-5 w-5 text-green-600" />
                              <span className="text-sm text-gray-600">
                                最近表现: {player.winRate >= 0.5 ? '良好' : '需要提升'}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              {player.winRate >= 0.6 ? (
                                <>
                                  <Trophy className="h-5 w-5 text-yellow-500" />
                                  <span className="text-sm text-yellow-600">高手水平</span>
                                </>
                              ) : player.winRate >= 0.4 ? (
                                <>
                                  <BarChart3 className="h-5 w-5 text-blue-500" />
                                  <span className="text-sm text-blue-600">稳定发挥</span>
                                </>
                              ) : (
                                <>
                                  <TrendingDown className="h-5 w-5 text-red-500" />
                                  <span className="text-sm text-red-600">需要加油</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Stats;