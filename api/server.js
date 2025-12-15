import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 数据目录
const DATA_DIR = process.env.DATA_DIR || join(__dirname, '../data');

// 确保数据目录存在
async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

// 初始化数据文件
async function initDataFiles() {
  await ensureDataDir();
  
  const files = ['friends.json', 'records.json', 'ai_chats.json'];
  for (const file of files) {
    const filePath = join(DATA_DIR, file);
    try {
      await fs.access(filePath);
    } catch {
      await fs.writeFile(filePath, '[]');
    }
  }
}

// 读取JSON文件
async function readJsonFile(filename) {
  try {
    const filePath = join(DATA_DIR, filename);
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`读取文件 ${filename} 失败:`, error);
    return [];
  }
}

// 写入JSON文件
async function writeJsonFile(filename, data) {
  try {
    const filePath = join(DATA_DIR, filename);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`写入文件 ${filename} 失败:`, error);
    return false;
  }
}

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({
    success: false,
    message: '服务器内部错误',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: '服务器运行正常' });
});

// 好友管理API
app.get('/api/friends', async (req, res) => {
  try {
    const friends = await readJsonFile('friends.json');
    res.json({ success: true, data: friends });
  } catch (error) {
    res.status(500).json({ success: false, message: '获取好友列表失败' });
  }
});

app.post('/api/friends', async (req, res) => {
  try {
    const { name, emoji } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: '好友名称不能为空' });
    }

    const friends = await readJsonFile('friends.json');
    const newFriend = {
      id: `friend_${uuidv4()}`,
      name,
      emoji: emoji || '🐶',
      createTime: new Date().toISOString()
    };

    friends.push(newFriend);
    await writeJsonFile('friends.json', friends);
    
    res.json({ success: true, data: newFriend });
  } catch (error) {
    res.status(500).json({ success: false, message: '添加好友失败' });
  }
});

app.put('/api/friends/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, emoji } = req.body;
    
    const friends = await readJsonFile('friends.json');
    const friendIndex = friends.findIndex(f => f.id === id);
    
    if (friendIndex === -1) {
      return res.status(404).json({ success: false, message: '好友不存在' });
    }

    friends[friendIndex] = {
      ...friends[friendIndex],
      name: name || friends[friendIndex].name,
      emoji: emoji || friends[friendIndex].emoji
    };

    await writeJsonFile('friends.json', friends);
    res.json({ success: true, data: friends[friendIndex] });
  } catch (error) {
    res.status(500).json({ success: false, message: '更新好友失败' });
  }
});

app.delete('/api/friends/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const friends = await readJsonFile('friends.json');
    const filteredFriends = friends.filter(f => f.id !== id);
    
    if (filteredFriends.length === friends.length) {
      return res.status(404).json({ success: false, message: '好友不存在' });
    }

    await writeJsonFile('friends.json', filteredFriends);
    res.json({ success: true, message: '好友删除成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: '删除好友失败' });
  }
});

// 游戏记录API
app.get('/api/records', async (req, res) => {
  try {
    const { page = 1, limit = 10, friendId } = req.query;
    const records = await readJsonFile('records.json');
    
    let filteredRecords = records;
    if (friendId) {
      filteredRecords = records.filter(record => 
        record.records.some(r => r.friendId === friendId)
      );
    }
    
    // 按时间倒序排列
    filteredRecords.sort((a, b) => new Date(b.createTime) - new Date(a.createTime));
    
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedRecords = filteredRecords.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: paginatedRecords,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: filteredRecords.length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: '获取游戏记录失败' });
  }
});

app.post('/api/records', async (req, res) => {
  try {
    const { records: gameRecords } = req.body;
    if (!gameRecords || !Array.isArray(gameRecords) || gameRecords.length === 0) {
      return res.status(400).json({ success: false, message: '游戏记录不能为空' });
    }

    // 计算总分
    const totalScore = gameRecords.reduce((sum, record) => {
      const score = parseInt(record.score) || 0;
      return record.type === '胜' ? sum + score : sum - score;
    }, 0);

    const newRecord = {
      id: `record_${uuidv4()}`,
      createTime: new Date().toISOString(),
      records: gameRecords,
      totalScore
    };

    const records = await readJsonFile('records.json');
    records.push(newRecord);
    await writeJsonFile('records.json', records);
    
    res.json({ success: true, data: newRecord });
  } catch (error) {
    res.status(500).json({ success: false, message: '添加游戏记录失败' });
  }
});

app.delete('/api/records/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const records = await readJsonFile('records.json');
    const filteredRecords = records.filter(r => r.id !== id);
    
    if (filteredRecords.length === records.length) {
      return res.status(404).json({ success: false, message: '记录不存在' });
    }

    await writeJsonFile('records.json', filteredRecords);
    res.json({ success: true, message: '记录删除成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: '删除记录失败' });
  }
});

// 统计数据API
app.get('/api/stats', async (req, res) => {
  try {
    const friends = await readJsonFile('friends.json');
    const records = await readJsonFile('records.json');
    
    const stats = friends.map(friend => {
      let totalScore = 0;
      let winCount = 0;
      let loseCount = 0;
      
      records.forEach(record => {
        record.records.forEach(r => {
          if (r.friendId === friend.id) {
            const score = parseInt(r.score) || 0;
            if (r.type === '胜') {
              totalScore += score;
              winCount++;
            } else {
              totalScore -= score;
              loseCount++;
            }
          }
        });
      });
      
      const totalGames = winCount + loseCount;
      const winRate = totalGames > 0 ? winCount / totalGames : 0;
      
      return {
        friendId: friend.id,
        friendName: friend.name,
        totalScore,
        winCount,
        loseCount,
        winRate: Math.round(winRate * 100) / 100
      };
    });
    
    // 按总得分排序
    stats.sort((a, b) => b.totalScore - a.totalScore);
    
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: '获取统计数据失败' });
  }
});

// AI聊天API
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, message: '消息不能为空' });
    }

    // 模拟AI回复（实际项目中可以接入真实的AI服务）
    const aiResponses = [
      '麻将是一门深奥的学问，需要不断练习和总结。',
      '清一色是麻将中的高级牌型，需要同一花色的牌组成。',
      '杠牌可以增加番数，但要注意风险。',
      '听牌时要仔细计算，选择最优的听牌方案。',
      '麻将不仅是运气游戏，更是策略和技巧的较量。'
    ];
    
    const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)];
    
    const aiChat = {
      reply: randomResponse,
      timestamp: new Date().toISOString()
    };

    // 保存聊天记录
    const chats = await readJsonFile('ai_chats.json');
    chats.push({
      id: `chat_${uuidv4()}`,
      message,
      reply: aiChat.reply,
      timestamp: aiChat.timestamp
    });
    
    // 只保留最近100条记录
    if (chats.length > 100) {
      chats.splice(0, chats.length - 100);
    }
    
    await writeJsonFile('ai_chats.json', chats);
    
    res.json({ success: true, data: aiChat });
  } catch (error) {
    res.status(500).json({ success: false, message: 'AI聊天失败' });
  }
});

// 启动服务器
async function startServer() {
  await initDataFiles();
  
  app.listen(PORT, () => {
    console.log(`🀄 麻将计分器API服务器运行在端口 ${PORT}`);
    console.log(`📊 健康检查: http://localhost:${PORT}/api/health`);
  });
}

startServer().catch(console.error);
