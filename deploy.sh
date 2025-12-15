#!/bin/bash

# 麻将计分器部署脚本

set -e

echo "🀄 开始部署麻将计分器..."

# 检查必要的命令是否存在
command -v node >/dev/null 2>&1 || { echo "❌ Node.js 未安装"; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "❌ npm 未安装"; exit 1; }
command -v pm2 >/dev/null 2>&1 || { echo "❌ PM2 未安装，正在安装..."; npm install -g pm2; }

# 创建必要的目录
echo "📁 创建必要的目录..."
mkdir -p logs
mkdir -p data

# 安装依赖
echo "📦 安装依赖..."
npm install

# 安装前端生产服务器
echo "🔧 安装前端生产服务器..."
npm install -g serve

# 构建前端
echo "🏗️  构建前端..."
npm run build

# 停止现有的PM2进程
echo "🛑 停止现有的PM2进程..."
pm2 stop mahjong-scorer-api mahjong-scorer-frontend 2>/dev/null || true

# 启动应用
echo "🚀 启动应用..."
pm2 start ecosystem.config.js

# 保存PM2配置
echo "💾 保存PM2配置..."
pm2 save

# 设置PM2开机自启（可选）
echo "🔧 设置PM2开机自启..."
pm2 startup | grep -v "\[PM2\]" | bash || true

echo "✅ 部署完成！"
echo ""
echo "📊 应用状态:"
pm2 status

echo ""
echo "🌐 应用地址:"
echo "- 前端: http://localhost:3000"
echo "- API: http://localhost:3001"
echo ""
echo "📋 常用命令:"
echo "- 查看日志: pm2 logs"
echo "- 重启应用: pm2 restart mahjong-scorer-api mahjong-scorer-frontend"
echo "- 停止应用: pm2 stop mahjong-scorer-api mahjong-scorer-frontend"
echo ""
echo "🎉 麻将计分器已成功部署！"