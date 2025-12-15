import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, RefreshCw } from 'lucide-react';
import { useStore } from '../store';
import { aiAPI } from '../utils/api';
import { Card } from '../components/ui/Card';
import Button from '../components/ui/Button';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const AIAssistant: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { friends, records } = useStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // 初始化时加载历史聊天记录
    const loadChatHistory = async () => {
      try {
        // 模拟加载聊天记录 - 实际项目中应该从API获取
        console.log('加载聊天记录功能待实现');
      } catch (error) {
        console.error('加载聊天记录失败:', error);
      }
    };
    loadChatHistory();
  }, []);

  const generateContextPrompt = () => {
    const totalGames = records.length;
    const playerStats = friends.map(friend => {
      const playerRecords = records.filter(record => 
        record.players.some((player: any) => player.name === friend.name)
      );
      const wins = playerRecords.filter(record => record.winner === friend.name).length;
      const games = playerRecords.length;
      const avgScore = games > 0 ? playerRecords.reduce((sum, record) => {
        const playerScore = record.players.find((p: any) => p.name === friend.name)?.score || 0;
        return sum + playerScore;
      }, 0) / games : 0;
      
      return {
        name: friend.name,
        games,
        wins,
        winRate: games > 0 ? (wins / games * 100).toFixed(1) : '0',
        avgScore: avgScore.toFixed(0)
      };
    });

    return `当前游戏数据：
- 总局数：${totalGames}
- 玩家数量：${friends.length}
- 玩家统计：${playerStats.map(p => `${p.name}(${p.games}局, ${p.wins}胜, 胜率${p.winRate}%, 平均分${p.avgScore})`).join(', ')}

请基于以上数据提供分析和建议。`;
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // 构建包含上下文的提示
      const contextPrompt = generateContextPrompt();
      const fullPrompt = `${contextPrompt}\n\n用户问题：${inputMessage}`;
      
      const response = await aiAPI.sendMessage(fullPrompt);
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.reply,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('发送消息失败:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '抱歉，我暂时无法回答您的问题。请稍后再试。',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAnalysis = async () => {
    setInputMessage('请分析当前的游戏数据，给出一些建议');
    // 延迟执行以确保状态更新
    setTimeout(() => {
      handleSendMessage();
    }, 100);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI麻将助手</h1>
          <p className="text-gray-600">智能分析您的麻将数据，提供游戏建议</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 聊天区域 */}
          <div className="lg:col-span-2">
            <Card className="h-[600px] flex flex-col">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">智能对话</h2>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-500 mt-8">
                    <Bot className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>欢迎使用AI麻将助手！</p>
                    <p className="text-sm mt-2">我可以帮您分析游戏数据，提供策略建议</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex items-start space-x-3 ${
                        message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                      }`}
                    >
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        message.role === 'user' 
                          ? 'bg-orange-500 text-white' 
                          : 'bg-blue-500 text-white'
                      }`}>
                        {message.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                      </div>
                      <div className={`flex-1 max-w-xs lg:max-w-md ${
                        message.role === 'user' ? 'text-right' : ''
                      }`}>
                        <div className={`inline-block px-4 py-2 rounded-lg ${
                          message.role === 'user'
                            ? 'bg-orange-500 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}>
                          {message.content}
                        </div>
                        <div className={`text-xs text-gray-500 mt-1 ${
                          message.role === 'user' ? 'text-right' : ''
                        }`}>
                          {formatTime(message.timestamp)}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                {isLoading && (
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg inline-block">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 border-t border-gray-200">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="输入您的问题..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    disabled={isLoading}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isLoading}
                    className="px-4 py-2"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* 快速操作和统计 */}
          <div className="space-y-6">
            <Card>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">快速分析</h3>
                <Button
                  onClick={handleQuickAnalysis}
                  variant="secondary"
                  className="w-full mb-3"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  分析游戏数据
                </Button>
                <div className="text-sm text-gray-600 space-y-2">
                  <p>• 胜率分析</p>
                  <p>• 策略建议</p>
                  <p>• 趋势预测</p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">数据概览</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">总局数:</span>
                    <span className="font-medium">{records.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">玩家数:</span>
                    <span className="font-medium">{friends.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">对话数:</span>
                    <span className="font-medium">{messages.length}</span>
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">使用提示</h3>
                <div className="text-sm text-gray-600 space-y-2">
                  <p>• 询问特定玩家的表现</p>
                  <p>• 请求游戏策略建议</p>
                  <p>• 分析胜负趋势</p>
                  <p>• 获取改进建议</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
