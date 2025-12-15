# 🀄 麻将计分器

一个现代化的麻将游戏记分系统，支持好友管理、游戏记录、统计分析和AI助手功能。

## ✨ 功能特性

- 🎯 **好友管理**: 添加和管理麻将好友
- 📝 **游戏记录**: 快速记录每局游戏结果
- 📊 **统计分析**: 详细的胜负统计和排名
- 🤖 **AI助手**: 智能分析游戏数据，提供策略建议
- 📱 **响应式设计**: 支持手机和桌面端
- 💾 **本地存储**: 基于文件的数据存储，无需数据库

## 🚀 快速开始

### 开发环境

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

前端将运行在 http://localhost:5173，后端API在 http://localhost:3001

### 生产部署

```bash
# 一键部署
npm run deploy

# 或者手动部署
npm run build        # 构建前端
npm run start:prod   # 启动生产服务
```

## 📁 项目结构

```
mahjong-scorer/
├── api/                    # 后端API
│   └── server.js          # Express服务器
├── src/                    # 前端源码
│   ├── components/        # 可复用组件
│   ├── pages/            # 页面组件
│   ├── store/            # 状态管理
│   ├── utils/            # 工具函数
│   └── App.tsx           # 主应用
├── data/                   # 数据存储目录
│   ├── friends.json      # 好友数据
│   ├── records.json      # 游戏记录
│   └── ai_chats.json     # AI聊天记录
├── logs/                   # 日志文件
├── dist/                   # 构建输出
└── ecosystem.config.js   # PM2配置
```

## 🔧 技术栈

- **前端**: React 18 + TypeScript + Vite + TailwindCSS
- **后端**: Node.js + Express + TypeScript
- **状态管理**: Zustand
- **部署**: PM2 + Nginx
- **存储**: 本地JSON文件存储

## 🌐 API 接口

### 好友管理
- `GET /api/friends` - 获取好友列表
- `POST /api/friends` - 添加好友
- `PUT /api/friends/:id` - 更新好友信息
- `DELETE /api/friends/:id` - 删除好友

### 游戏记录
- `GET /api/records` - 获取游戏记录
- `POST /api/records` - 添加游戏记录
- `PUT /api/records/:id` - 更新游戏记录
- `DELETE /api/records/:id` - 删除游戏记录

### 统计分析
- `GET /api/stats` - 获取统计数据
- `GET /api/stats/ranking` - 获取排名
- `GET /api/stats/player/:name` - 获取玩家统计

### AI助手
- `POST /api/ai/chat` - 发送消息
- `GET /api/ai/history` - 获取聊天记录

## 🚀 生产环境部署

### 使用Nginx反向代理

1. 安装Nginx
2. 将nginx.conf复制到Nginx配置目录
3. 重启Nginx服务

```bash
sudo cp nginx.conf /etc/nginx/sites-available/mahjong-scorer
sudo ln -s /etc/nginx/sites-available/mahjong-scorer /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 使用PM2进程管理

```bash
# 安装PM2
npm install -g pm2

# 启动应用
pm2 start ecosystem.config.js

# 设置开机自启
pm2 save
pm2 startup
```

### 系统服务（可选）

创建systemd服务文件 `/etc/systemd/system/mahjong-scorer.service`:

```ini
[Unit]
Description=Mahjong Scorer Application
After=network.target

[Service]
Type=forking
User=your-user
WorkingDirectory=/path/to/mahjong-scorer
ExecStart=/usr/bin/pm2 start ecosystem.config.js
ExecReload=/usr/bin/pm2 reload ecosystem.config.js
ExecStop=/usr/bin/pm2 stop ecosystem.config.js
Restart=always

[Install]
WantedBy=multi-user.target
```

## 🔒 安全建议

1. **数据备份**: 定期备份 `data/` 目录
2. **访问控制**: 配置Nginx访问限制
3. **HTTPS**: 使用SSL证书启用HTTPS
4. **防火墙**: 配置防火墙规则

## 📝 数据格式

### 好友数据 (friends.json)
```json
{
  "friends": [
    {
      "id": "uuid",
      "name": "玩家姓名",
      "avatar": "头像URL",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### 游戏记录 (records.json)
```json
{
  "records": [
    {
      "id": "uuid",
      "date": "2024-01-01T00:00:00.000Z",
      "players": [
        {
          "name": "玩家姓名",
          "score": 25000
        }
      ],
      "winner": "获胜者姓名",
      "loser": "落败者姓名",
      "notes": "备注信息"
    }
  ]
}
```

## 🤝 贡献

欢迎提交Issue和Pull Request来改进这个项目。

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🆘 支持

如遇到问题，请在GitHub提交Issue。

---

**注意**: 这是一个个人项目，主要用于学习和个人使用。在生产环境中使用时，请确保做好数据备份和安全配置。