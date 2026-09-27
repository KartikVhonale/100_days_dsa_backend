import { dbService } from '../config/db.js';
import { rebalancePlan } from '../services/scheduleService.js';
import { calculateStreaks } from './progressController.js';

export async function getDailyPlan(req, res) {
  try {
    const userId = req.user?.userId || req.query.userId || 'default_candidate';
    const user = await dbService.getUser(userId);

    const now = new Date();
    const targetDate = new Date(user.targetDate);
    const startDate = new Date(user.startDate);

    const msPerDay = 1000 * 60 * 60 * 24;
    const daysElapsed = Math.max(0, Math.floor((now - startDate) / msPerDay));

    // Fetch track problems
    const trackProblems = await dbService.getAllProblemsForTrack(user.currentTrack);
    const totalTrackProblems = trackProblems.length;

    // Fetch progress
    const userProgress = await dbService.getProgress(userId);
    const completedSet = new Set(userProgress.map(p => p.problemId));

    const completedProblems = trackProblems.filter(p => completedSet.has(p.sequenceOrder));
    const unsolvedProblems = trackProblems.filter(p => !completedSet.has(p.sequenceOrder));

    const completedCount = completedProblems.length;
    const unsolvedCount = unsolvedProblems.length;

    // Run Pure Scheduling Engine with Rest-Day Masking & Discrete Integer Remainder Allocation
    const activeDays = user.activeDays || [0, 1, 2, 3, 4, 5, 6];
    const excludedDates = user.excludedDates || [];

    const rebalanceResult = rebalancePlan({
      totalUnits: totalTrackProblems,
      completedUnits: completedCount,
      targetDate: user.targetDate,
      activeDays,
      excludedDates,
      today: now
    });

    const dailyQuota = rebalanceResult.dailyQuota;
    const remainingDaysCount = rebalanceResult.remainingDaysCount;
    const baselineDailyRate = Number((totalTrackProblems / (user.totalDays || 100)).toFixed(1));

    // Target expected progress based on elapsed days
    const expectedCompleted = Math.min(
      totalTrackProblems,
      Math.floor(daysElapsed * (totalTrackProblems / (user.totalDays || 100)))
    );
    const paceDiff = completedCount - expectedCompleted;

    let paceStatus = 'On Track';
    let paceDescription = 'You are right on track with your 100-day FAANG preparation goal.';
    if (rebalanceResult.status === 'OVERDUE') {
      paceStatus = 'Target Date Reached (Overdue)';
      paceDescription = `Target date reached with ${unsolvedCount} problems remaining. Adjust your target date to continue rebalancing.`;
    } else if (rebalanceResult.status === 'COMPLETED') {
      paceStatus = 'Curriculum Completed!';
      paceDescription = 'Congratulations! You have completed all problems for your selected preparation track!';
    } else if (paceDiff >= 3) {
      paceStatus = 'Ahead of Pace';
      paceDescription = `You are ${paceDiff} problems ahead of the baseline schedule! Quota relaxed.`;
    } else if (paceDiff < -2) {
      paceStatus = 'Adaptive Redistribution Active';
      paceDescription = `Behind by ${Math.abs(paceDiff)} problems. Todait has smoothly redistributed them across your ${remainingDaysCount} remaining eligible study days without creating an overdue backlog.`;
    }

    // Select today's problems based on sequence order
    const todayProblems = unsolvedProblems.slice(0, dailyQuota);

    // Spaced repetition review due today
    const spacedReviews = await dbService.getSpacedRepetitions(userId);
    const pendingReviews = spacedReviews.filter(sr => sr.status === 'pending');
    const memoryReviewItem = pendingReviews.length > 0 ? pendingReviews[0] : null;

    // Daily 4-Stage Protocol Allocation
    const dailyHours = user.dailyHoursTarget || 2.5;
    const totalMinutes = dailyHours * 60;
    const dailyProtocol = {
      activeSolving: {
        percentage: 40,
        minutes: Math.round(totalMinutes * 0.4),
        task: `Solve ${dailyQuota} target problems. 25 minutes strictly without hints. Read algorithm tag only if completely blocked.`
      },
      codeQuality: {
        percentage: 30,
        minutes: Math.round(totalMinutes * 0.3),
        task: 'Refactor solutions to production-grade clean code, verify loop invariants, idiomatic naming, and optimal memory.'
      },
      patternCatalog: {
        percentage: 20,
        minutes: Math.round(totalMinutes * 0.2),
        task: 'Catalog problem signature to data structure/algorithm relationship in personal playbook.'
      },
      spacedRepetition: {
        percentage: 10,
        minutes: Math.round(totalMinutes * 0.1),
        task: memoryReviewItem
          ? `Re-solve problem #${memoryReviewItem.problemId} (${memoryReviewItem.problemTitle}) strictly from memory.`
          : 'Review recently cataloged patterns and verify theoretical complexity bounds.'
      }
    };

    return res.status(200).json({
      success: true,
      data: {
        user: {
          userId: user.userId,
          name: user.name,
          currentTrack: user.currentTrack,
          startDate: user.startDate,
          targetDate: user.targetDate,
          totalDays: user.totalDays || 100,
          daysElapsed,
          remainingDays: remainingDaysCount,
          activeDays,
          excludedDates,
          dailyHoursTarget: user.dailyHoursTarget || 2.5
        },
        todaitEngine: {
          status: rebalanceResult.status,
          totalTrackProblems,
          completedCount,
          unsolvedCount,
          dailyQuota,
          baselineDailyRate,
          expectedCompleted,
          paceDiff,
          paceStatus,
          paceDescription,
          completionPercentage: totalTrackProblems > 0 ? Number(((completedCount / totalTrackProblems) * 100).toFixed(1)) : 0,
          streaks: calculateStreaks(userProgress),
          schedule: rebalanceResult.schedule.slice(0, 14) // Next 14 active days forecast
        },
        todayPlan: {
          quota: dailyQuota,
          problems: todayProblems,
          memoryReview: memoryReviewItem
        },
        dailyProtocol
      }
    });
  } catch (error) {
    console.error('[PlanController] getDailyPlan error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function updateTrackOrDates(req, res) {
  try {
    const userId = req.user?.userId || req.body.userId || 'default_candidate';
    const { currentTrack, targetDate, startDate, dailyHoursTarget, name, activeDays, excludedDates } = req.body;

    const updates = {};
    if (currentTrack) updates.currentTrack = currentTrack;
    if (targetDate) updates.targetDate = new Date(targetDate).toISOString();
    if (startDate) updates.startDate = new Date(startDate).toISOString();
    if (dailyHoursTarget) updates.dailyHoursTarget = Number(dailyHoursTarget);
    if (name) updates.name = name;
    if (activeDays) updates.activeDays = activeDays;
    if (excludedDates) updates.excludedDates = excludedDates;

    const updatedUser = await dbService.updateUser(userId, updates);
    return res.status(200).json({ success: true, data: updatedUser });
  } catch (error) {
    console.error('[PlanController] updateTrackOrDates error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
