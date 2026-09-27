import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import Problem from '../models/Problem.js';
import User from '../models/User.js';
import Progress from '../models/Progress.js';
import Pattern from '../models/Pattern.js';
import SpacedRepetition from '../models/SpacedRepetition.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbJsonPath = path.resolve(__dirname, '../data/db.json');

let isMongoConnected = false;

// High-performance in-memory cache
let cachedJsonDb = null;
let problemsBySeqMap = new Map();
let problemsByTrackMap = new Map();

function buildIndexes(data) {
  problemsBySeqMap.clear();
  problemsByTrackMap.clear();

  const problems = data.problems || [];
  for (let i = 0; i < problems.length; i++) {
    const p = problems[i];
    problemsBySeqMap.set(p.sequenceOrder, p);
    const tracks = p.tracks || ['all'];
    for (let t = 0; t < tracks.length; t++) {
      const tr = tracks[t];
      if (!problemsByTrackMap.has(tr)) {
        problemsByTrackMap.set(tr, []);
      }
      problemsByTrackMap.get(tr).push(p);
    }
  }
}

// Read JSON fallback database with instant in-memory cache
function readJsonDb() {
  if (cachedJsonDb) {
    return cachedJsonDb;
  }
  try {
    if (fs.existsSync(dbJsonPath)) {
      const parsed = JSON.parse(fs.readFileSync(dbJsonPath, 'utf8'));
      cachedJsonDb = parsed;
      buildIndexes(cachedJsonDb);
      return cachedJsonDb;
    }
  } catch (err) {
    console.error('[DB] Error reading db.json:', err.message);
  }
  cachedJsonDb = { users: [], problems: [], progress: [], patterns: [], spacedRepetition: [] };
  buildIndexes(cachedJsonDb);
  return cachedJsonDb;
}

// Asynchronous non-blocking write to disk
async function writeJsonDb(data) {
  cachedJsonDb = data;
  buildIndexes(data);
  try {
    await fs.promises.writeFile(dbJsonPath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('[DB] Error writing to db.json:', err.message);
  }
}

export async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.log('[Storage] No MONGO_URI specified. Operating with integrated local JSON persistence.');
    return false;
  }
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 2000 });
    isMongoConnected = true;
    console.log('[Storage] Connected to MongoDB database successfully.');
    return true;
  } catch (err) {
    isMongoConnected = false;
    console.log('[Storage] MongoDB server not reachable. Fallback active: Running with local persistence (Backend/src/data/db.json).');
    return false;
  }
}

function sanitizeUser(user) {
  if (!user) return null;
  const obj = typeof user.toObject === 'function' ? user.toObject() : { ...user };
  delete obj.passwordHash;
  delete obj.__v;
  return obj;
}

export const dbService = {
  isMongo() {
    return isMongoConnected;
  },

  async findUserByEmail(email) {
    if (!email) return null;
    const cleanEmail = email.toLowerCase().trim();
    if (isMongoConnected) {
      const u = await User.findOne({ email: cleanEmail });
      return u ? (typeof u.toObject === 'function' ? u.toObject() : u) : null;
    }
    const data = readJsonDb();
    return data.users.find(u => u.email && u.email.toLowerCase() === cleanEmail) || null;
  },

  async findUserById(userId) {
    if (!userId) return null;
    if (isMongoConnected) {
      const u = await User.findOne({ userId });
      return u ? sanitizeUser(u) : null;
    }
    const data = readJsonDb();
    const u = data.users.find(usr => usr.userId === userId);
    return u ? sanitizeUser(u) : null;
  },

  async createUser(userData) {
    const cleanEmail = userData.email ? userData.email.toLowerCase().trim() : undefined;
    const userToSave = {
      ...userData,
      email: cleanEmail,
      name: userData.name || 'FAANG Candidate',
      currentTrack: userData.currentTrack || 'intermediate',
      startDate: userData.startDate || new Date().toISOString(),
      targetDate: userData.targetDate || new Date(Date.now() + 100 * 24 * 60 * 60 * 1000).toISOString(),
      totalDays: userData.totalDays || 100,
      dailyHoursTarget: userData.dailyHoursTarget || 2.5,
      timezone: userData.timezone || 'Asia/Kolkata',
      activeDays: userData.activeDays || [0, 1, 2, 3, 4, 5, 6],
      excludedDates: userData.excludedDates || []
    };

    if (isMongoConnected) {
      const created = await User.create(userToSave);
      return sanitizeUser(created);
    }

    const data = readJsonDb();
    data.users = data.users || [];
    data.users.push(userToSave);
    await writeJsonDb(data);
    return sanitizeUser(userToSave);
  },

  async getUser(userId = 'default_candidate') {
    if (isMongoConnected) {
      let user = await User.findOne({ userId });
      if (!user) {
        user = await User.create({ userId, name: 'FAANG Candidate', currentTrack: 'intermediate' });
      }
      return sanitizeUser(user);
    }
    const data = readJsonDb();
    let user = data.users.find(u => u.userId === userId);
    if (!user) {
      user = {
        userId,
        name: 'FAANG Candidate',
        currentTrack: 'intermediate',
        startDate: new Date().toISOString(),
        targetDate: new Date(Date.now() + 100 * 24 * 60 * 60 * 1000).toISOString(),
        totalDays: 100,
        dailyHoursTarget: 2.5,
        timezone: 'Asia/Kolkata',
        activeDays: [0, 1, 2, 3, 4, 5, 6],
        excludedDates: []
      };
      data.users.push(user);
      writeJsonDb(data);
    }
    return sanitizeUser(user);
  },

  async updateUser(userId = 'default_candidate', updates = {}) {
    if (isMongoConnected) {
      const user = await User.findOneAndUpdate({ userId }, { $set: updates }, { new: true, upsert: true });
      return sanitizeUser(user);
    }
    const data = readJsonDb();
    const idx = data.users.findIndex(u => u.userId === userId);
    if (idx !== -1) {
      data.users[idx] = { ...data.users[idx], ...updates, updatedAt: new Date().toISOString() };
      writeJsonDb(data);
      return sanitizeUser(data.users[idx]);
    }
    const newUser = { userId, ...updates };
    data.users.push(newUser);
    writeJsonDb(data);
    return sanitizeUser(newUser);
  },

  async getProblems(filters = {}) {
    const { track, topic, difficulty, search, page = 1, limit = 50 } = filters;

    if (isMongoConnected) {
      const query = {};
      if (track && track !== 'all') query.tracks = track;
      if (topic && topic !== 'All' && topic !== '') query.topic = topic;
      if (difficulty && difficulty !== 'All' && difficulty !== '') query.difficulty = difficulty;
      if (search && search.trim() !== '') query.title = { $regex: search.trim(), $options: 'i' };

      const skip = (Number(page) - 1) * Number(limit);
      const [problems, total] = await Promise.all([
        Problem.find(query).sort({ sequenceOrder: 1 }).skip(skip).limit(Number(limit)).lean(),
        Problem.countDocuments(query)
      ]);
      return { problems, total, page: Number(page), limit: Number(limit) };
    }

    readJsonDb();
    let list = (track && track !== 'all' && problemsByTrackMap.has(track))
      ? problemsByTrackMap.get(track)
      : (cachedJsonDb.problems || []);

    if (topic && topic !== 'All' && topic !== '') {
      const lowerTopic = topic.toLowerCase();
      list = list.filter(p => p.topic && p.topic.toLowerCase() === lowerTopic);
    }
    if (difficulty && difficulty !== 'All' && difficulty !== '') {
      const lowerDiff = difficulty.toLowerCase();
      list = list.filter(p => p.difficulty && p.difficulty.toLowerCase() === lowerDiff);
    }
    if (search && search.trim() !== '') {
      const s = search.trim().toLowerCase();
      list = list.filter(p => (p.title && p.title.toLowerCase().includes(s)) || (p.topic && p.topic.toLowerCase().includes(s)));
    }

    const total = list.length;
    const skip = (Number(page) - 1) * Number(limit);
    const paginated = list.slice(skip, skip + Number(limit));

    return { problems: paginated, total, page: Number(page), limit: Number(limit) };
  },

  async getAllProblemsForTrack(track = 'intermediate') {
    if (isMongoConnected) {
      const query = (track && track !== 'all') ? { tracks: track } : {};
      return await Problem.find(query).sort({ sequenceOrder: 1 }).lean();
    }
    readJsonDb();
    if (track && track !== 'all' && problemsByTrackMap.has(track)) {
      return problemsByTrackMap.get(track);
    }
    return cachedJsonDb.problems || [];
  },

  async getProblemBySequence(sequenceOrder) {
    const seq = Number(sequenceOrder);
    if (isMongoConnected) {
      return await Problem.findOne({ sequenceOrder: seq }).lean();
    }
    readJsonDb();
    return problemsBySeqMap.get(seq) || null;
  },

  async getProgress(userId = 'default_candidate') {
    if (isMongoConnected) {
      return await Progress.find({ userId }).sort({ completedAt: -1 }).lean();
    }
    const data = readJsonDb();
    return (data.progress || []).filter(p => p.userId === userId);
  },

  async toggleProgress(userId = 'default_candidate', problemId, details = {}) {
    const seq = Number(problemId);
    if (isMongoConnected) {
      const existing = await Progress.findOne({ userId, problemId: seq });
      if (existing) {
        await Progress.deleteOne({ _id: existing._id });
        return { completed: false, problemId: seq };
      }
      const newEntry = await Progress.create({
        userId,
        problemId: seq,
        status: details.status || 'completed',
        timeSpentMinutes: details.timeSpentMinutes || 25,
        timeComplexity: details.timeComplexity || 'O(N)',
        spaceComplexity: details.spaceComplexity || 'O(1)',
        patternUsed: details.patternUsed || '',
        notes: details.notes || '',
        difficultyPerceived: details.difficultyPerceived || 'Medium'
      });
      return { completed: true, problemId: seq, record: newEntry };
    }

    const data = readJsonDb();
    const idx = (data.progress || []).findIndex(p => p.userId === userId && p.problemId === seq);
    if (idx !== -1) {
      data.progress.splice(idx, 1);
      writeJsonDb(data);
      return { completed: false, problemId: seq };
    }

    const newRecord = {
      userId,
      problemId: seq,
      status: details.status || 'completed',
      completedAt: new Date().toISOString(),
      timeSpentMinutes: details.timeSpentMinutes || 25,
      timeComplexity: details.timeComplexity || 'O(N)',
      spaceComplexity: details.spaceComplexity || 'O(1)',
      patternUsed: details.patternUsed || '',
      notes: details.notes || '',
      difficultyPerceived: details.difficultyPerceived || 'Medium'
    };
    data.progress = data.progress || [];
    data.progress.push(newRecord);

    const problem = problemsBySeqMap.get(seq);
    data.spacedRepetition = data.spacedRepetition || [];
    data.spacedRepetition.push({
      id: 'sr_' + Date.now(),
      userId,
      problemId: seq,
      problemTitle: problem ? problem.title : `Problem #${seq}`,
      solvedDate: new Date().toISOString(),
      reviewDueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      intervalDays: 7,
      status: 'pending',
      retentionScore: 5
    });

    writeJsonDb(data);
    return { completed: true, problemId: seq, record: newRecord };
  },

  async getPatterns() {
    if (isMongoConnected) {
      return await Pattern.find({}).sort({ category: 1 });
    }
    const data = readJsonDb();
    return data.patterns || [];
  },

  async addPattern(patternData) {
    if (isMongoConnected) {
      return await Pattern.create(patternData);
    }
    const data = readJsonDb();
    const newPat = {
      id: 'pat_' + Date.now(),
      ...patternData,
      createdAt: new Date().toISOString()
    };
    data.patterns = data.patterns || [];
    data.patterns.push(newPat);
    writeJsonDb(data);
    return newPat;
  },

  async getSpacedRepetitions(userId = 'default_candidate') {
    if (isMongoConnected) {
      return await SpacedRepetition.find({ userId }).sort({ reviewDueDate: 1 });
    }
    const data = readJsonDb();
    return (data.spacedRepetition || []).filter(sr => sr.userId === userId);
  },

  async updateSpacedRepetition(id, status = 'completed', retentionScore = 5) {
    if (isMongoConnected) {
      return await SpacedRepetition.findByIdAndUpdate(
        id,
        { status, retentionScore, lastReviewedAt: new Date() },
        { new: true }
      );
    }
    const data = readJsonDb();
    const item = (data.spacedRepetition || []).find(sr => sr.id === id);
    if (item) {
      item.status = status;
      item.retentionScore = retentionScore;
      item.lastReviewedAt = new Date().toISOString();
      writeJsonDb(data);
      return item;
    }
    return null;
  }
};
