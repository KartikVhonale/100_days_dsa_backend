import { dbService } from '../config/db.js';

export async function listProblems(req, res) {
  try {
    const { track, topic, difficulty, search, page = 1, limit = 50 } = req.query;
    const userId = req.user?.userId || req.query.userId || 'default_candidate';

    const result = await dbService.getProblems({ track, topic, difficulty, search, page, limit });
    const userProgress = await dbService.getProgress(userId);
    const progressMap = new Map();
    (userProgress || []).forEach(p => {
      const pId = p.problemId !== undefined ? p.problemId : p._doc?.problemId;
      if (pId !== undefined) {
        progressMap.set(Number(pId), p);
      }
    });

    const enrichedProblems = (result.problems || []).map(prob => {
      const p = (prob && typeof prob.toObject === 'function')
        ? prob.toObject()
        : (prob && prob._doc ? { ...prob._doc } : { ...prob });

      const seq = Number(p.sequenceOrder);
      const prog = progressMap.get(seq);
      return {
        ...p,
        sequenceOrder: seq,
        isCompleted: !!prog,
        completedAt: prog ? (prog.completedAt || prog._doc?.completedAt) : null,
        progressDetails: prog || null
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        problems: enrichedProblems,
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / result.limit)
      }
    });
  } catch (error) {
    console.error('[ProblemController] listProblems error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function getProblem(req, res) {
  try {
    const { id } = req.params;
    const problem = await dbService.getProblemBySequence(id);
    if (!problem) {
      return res.status(404).json({ success: false, error: 'Problem not found' });
    }
    const p = (problem && typeof problem.toObject === 'function')
      ? problem.toObject()
      : (problem && problem._doc ? { ...problem._doc } : { ...problem });

    return res.status(200).json({ success: true, data: p });
  } catch (error) {
    console.error('[ProblemController] getProblem error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function getTopicBreakdown(req, res) {
  try {
    const { track = 'all' } = req.query;
    const allProblems = await dbService.getAllProblemsForTrack(track);

    const topicStats = {};
    (allProblems || []).forEach(prob => {
      const p = (prob && typeof prob.toObject === 'function')
        ? prob.toObject()
        : (prob && prob._doc ? { ...prob._doc } : { ...prob });

      const topicName = p.topic || 'General';
      if (!topicStats[topicName]) {
        topicStats[topicName] = { topic: topicName, total: 0, easy: 0, medium: 0, hard: 0 };
      }
      topicStats[topicName].total++;
      if (p.difficulty === 'Easy') topicStats[topicName].easy++;
      if (p.difficulty === 'Medium') topicStats[topicName].medium++;
      if (p.difficulty === 'Hard') topicStats[topicName].hard++;
    });

    return res.status(200).json({
      success: true,
      data: {
        totalProblems: allProblems.length,
        topics: Object.values(topicStats)
      }
    });
  } catch (error) {
    console.error('[ProblemController] getTopicBreakdown error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
