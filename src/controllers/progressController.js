import { dbService } from '../config/db.js';

export function calculateStreaks(progress = []) {
  if (!progress || progress.length === 0) {
    return { currentStreak: 0, longestStreak: 0, todaySolvedCount: 0, last7DaysSolvedCount: 0 };
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const dateCounts = new Map();
  let todaySolvedCount = 0;
  let last7DaysSolvedCount = 0;
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  for (let i = 0; i < progress.length; i++) {
    const p = progress[i];
    if (!p.completedAt) continue;
    const pDate = new Date(p.completedAt);
    const dateStr = pDate.toISOString().split('T')[0];
    dateCounts.set(dateStr, (dateCounts.get(dateStr) || 0) + 1);

    if (dateStr === todayStr) {
      todaySolvedCount++;
    }
    if (pDate >= sevenDaysAgo) {
      last7DaysSolvedCount++;
    }
  }

  const distinctDates = Array.from(dateCounts.keys()).sort();
  if (distinctDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0, todaySolvedCount: 0, last7DaysSolvedCount: 0 };
  }

  // Calculate longest streak
  let longestStreak = 0;
  let tempStreak = 0;
  let prevTime = null;

  for (let i = 0; i < distinctDates.length; i++) {
    const time = new Date(distinctDates[i]).getTime();
    if (prevTime === null) {
      tempStreak = 1;
    } else {
      const diffDays = Math.round((time - prevTime) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        tempStreak++;
      } else {
        tempStreak = 1;
      }
    }
    prevTime = time;
    if (tempStreak > longestStreak) longestStreak = tempStreak;
  }

  // Calculate current streak
  let currentStreak = 0;
  let checkDate = new Date();
  checkDate.setHours(0, 0, 0, 0);

  const checkStr = checkDate.toISOString().split('T')[0];
  if (!dateCounts.has(checkStr)) {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  while (dateCounts.has(checkDate.toISOString().split('T')[0])) {
    currentStreak++;
    checkDate.setDate(checkDate.getDate() - 1);
  }

  return {
    currentStreak,
    longestStreak,
    todaySolvedCount,
    last7DaysSolvedCount
  };
}

export async function toggleProblem(req, res) {
  try {
    const { problemId, details = {} } = req.body;
    const effectiveUserId = req.user?.userId || req.body.userId || 'default_candidate';
    if (!problemId) {
      return res.status(400).json({ success: false, error: 'problemId is required' });
    }

    const result = await dbService.toggleProgress(effectiveUserId, problemId, details);
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('[ProgressController] toggleProblem error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function getProgressStats(req, res) {
  try {
    const userId = req.user?.userId || req.query.userId || 'default_candidate';
    const [progress, user] = await Promise.all([
      dbService.getProgress(userId),
      dbService.getUser(userId)
    ]);

    const trackProblems = await dbService.getAllProblemsForTrack(user.currentTrack);
    const totalTrackProblems = trackProblems.length;

    const completedIds = new Set(progress.map(p => p.problemId));
    let easyCount = 0, mediumCount = 0, hardCount = 0;
    let totalMinutesLogged = 0;

    progress.forEach(p => {
      totalMinutesLogged += (p.timeSpentMinutes || 25);
    });

    trackProblems.forEach(p => {
      if (completedIds.has(p.sequenceOrder)) {
        if (p.difficulty === 'Easy') easyCount++;
        if (p.difficulty === 'Medium') mediumCount++;
        if (p.difficulty === 'Hard') hardCount++;
      }
    });

    const completedTrackCount = easyCount + mediumCount + hardCount;
    const streaks = calculateStreaks(progress);

    return res.status(200).json({
      success: true,
      data: {
        totalSolved: completedTrackCount,
        totalTrackProblems,
        completionRate: totalTrackProblems > 0 ? Number(((completedTrackCount / totalTrackProblems) * 100).toFixed(1)) : 0,
        difficultyBreakdown: {
          easy: easyCount,
          medium: mediumCount,
          hard: hardCount
        },
        streaks,
        totalHoursLogged: Number((totalMinutesLogged / 60).toFixed(1)),
        recentActivity: progress.slice(0, 10)
      }
    });
  } catch (error) {
    console.error('[ProgressController] getProgressStats error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
