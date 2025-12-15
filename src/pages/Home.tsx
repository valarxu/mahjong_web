import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/Card';
import { 
  PlusCircle, 
  Users, 
  History, 
  BarChart3, 
  Bot,
  Trophy 
} from 'lucide-react';

const Home: React.FC = () => {
  const features = [
    {
      title: '记录游戏',
      description: '快速记录麻将游戏成绩',
      icon: PlusCircle,
      path: '/record',
      color: 'bg-orange-500',
    },
    {
      title: '好友管理',
      description: '管理你的麻将好友',
      icon: Users,
      path: '/friends',
      color: 'bg-blue-500',
    },
    {
      title: '历史记录',
      description: '查看所有游戏记录',
      icon: History,
      path: '/history',
      color: 'bg-green-500',
    },
    {
      title: '对战统计',
      description: '查看战绩统计分析',
      icon: BarChart3,
      path: '/stats',
      color: 'bg-purple-500',
    },
    {
      title: 'AI助手',
      description: '智能麻将助手',
      icon: Bot,
      path: '/ai-assistant',
      color: 'bg-red-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部导航 */}
      <header className="bg-orange-500 text-white shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Trophy className="h-8 w-8" />
              <div>
                <h1 className="text-2xl font-bold">麻将计分器</h1>
                <p className="text-orange-100 text-sm">记录每一局的精彩</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* 欢迎区域 */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">欢迎使用麻将计分器</h2>
          <p className="text-gray-600">简单、快速、专业的麻将记分工具</p>
        </div>

        {/* 功能卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <Link
                key={index}
                to={feature.path}
                className="block transform hover:scale-105 transition-transform duration-200"
              >
                <Card className="h-full hover:shadow-lg transition-shadow duration-200">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className={`${feature.color} p-3 rounded-full text-white`}>
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-800 mb-1">
                          {feature.title}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* 使用说明 */}
        <div className="mt-12 bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">使用说明</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">快速开始</h4>
              <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                <li>点击"好友管理"添加你的麻将好友</li>
                <li>点击"记录游戏"开始记分</li>
                <li>选择参与游戏的好友</li>
                <li>输入胜负情况和得分</li>
                <li>提交保存游戏记录</li>
              </ol>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">功能特色</h4>
              <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                <li>支持多人同时记分</li>
                <li>自动计算总得分</li>
                <li>详细的战绩统计</li>
                <li>AI智能助手</li>
                <li>数据本地存储</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 底部信息 */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>专为麻将爱好者设计的个人计分工具</p>
          <p className="mt-1">数据存储在本地，安全可靠</p>
        </div>
      </main>
    </div>
  );
};

export default Home;