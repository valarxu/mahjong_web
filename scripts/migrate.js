import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function parseNDJSON(content) {
  return content
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
    .map((l) => JSON.parse(l));
}

function getISODate(doc) {
  if (doc?.createTime?.$date) return doc.createTime.$date;
  if (typeof doc?.createTime === 'string') return doc.createTime;
  return new Date().toISOString();
}

function computeTotalScore(records) {
  return records.reduce((sum, r) => {
    const score = parseInt(r.score, 10) || 0;
    return r.type === '胜' ? sum + score : sum - score;
  }, 0);
}

async function readJSONIfExists(path) {
  try {
    const txt = await fs.readFile(path, 'utf8');
    const data = JSON.parse(txt);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

async function main() {
  const srcFriendsPath = resolve(__dirname, '../../mahjong_database/friends.json');
  const srcRecordsPath = resolve(__dirname, '../../mahjong_database/game_records.json');
  const dstDir = resolve(__dirname, '../data');
  const dstFriendsPath = resolve(dstDir, 'friends.json');
  const dstRecordsPath = resolve(dstDir, 'records.json');

  const [srcFriendsTxt, srcRecordsTxt] = await Promise.all([
    fs.readFile(srcFriendsPath, 'utf8'),
    fs.readFile(srcRecordsPath, 'utf8'),
  ]);

  const srcFriends = parseNDJSON(srcFriendsTxt);
  const srcRecords = parseNDJSON(srcRecordsTxt);

  const migratedFriends = srcFriends.map((f) => ({
    id: f._id,
    name: f.name,
    emoji: f.emoji || '🐶',
    createTime: getISODate(f),
  }));

  const migratedRecords = srcRecords.map((rec) => {
    const records = (rec.records || []).map((r) => ({
      friendId: r.friendId,
      friendName: r.friendName,
      type: r.type,
      score: String(r.score ?? ''),
    }));
    return {
      id: rec._id,
      createTime: getISODate(rec),
      records,
      totalScore: computeTotalScore(records),
    };
  });

  await fs.mkdir(dstDir, { recursive: true });

  const existingFriends = await readJSONIfExists(dstFriendsPath);
  const existingRecords = await readJSONIfExists(dstRecordsPath);

  const friendsById = new Map(existingFriends.map((f) => [f.id, f]));
  for (const f of migratedFriends) friendsById.set(f.id, f);
  const finalFriends = Array.from(friendsById.values());

  const recordsById = new Map(existingRecords.map((r) => [r.id, r]));
  for (const r of migratedRecords) recordsById.set(r.id, r);
  // 按时间倒序
  const finalRecords = Array.from(recordsById.values()).sort(
    (a, b) => new Date(b.createTime) - new Date(a.createTime)
  );

  await Promise.all([
    fs.writeFile(dstFriendsPath, JSON.stringify(finalFriends, null, 2)),
    fs.writeFile(dstRecordsPath, JSON.stringify(finalRecords, null, 2)),
  ]);

  console.log(`迁移完成: friends=${finalFriends.length}, records=${finalRecords.length}`);
}

main().catch((e) => {
  console.error('迁移失败:', e);
  process.exit(1);
});

