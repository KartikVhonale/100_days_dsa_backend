import { rebalancePlan } from '../services/scheduleService.js';
import { dbService } from '../config/db.js';

/**
 * POST /api/plans/:id/rebalance
 * Recalculates daily targets dynamically based on remaining workload,
 * active study days of week, blackout dates, and integer remainder distribution.
 */
export async function rebalancePlanController(req, res, next) {
  try {
    const { id } = req.params;
    const { completedUnits, excludedDates, activeDays, targetDate, totalUnits } = req.body;
    const targetUserId = req.user?.userId || id || 'default_candidate';

    const user = await dbService.getUser(targetUserId);

    const trackProblems = await dbService.getAllProblemsForTrack(user.currentTrack || 'intermediate');
    const computedTotalUnits = totalUnits !== undefined ? Number(totalUnits) : trackProblems.length;

    let computedCompletedUnits = completedUnits;
    if (computedCompletedUnits === undefined) {
      const progress = await dbService.getProgress(user.userId);
      const completedIds = new Set(progress.map(p => p.problemId));
      computedCompletedUnits = trackProblems.filter(p => completedIds.has(p.sequenceOrder)).length;
    }

    if (computedCompletedUnits > computedTotalUnits) {
      return res.status(400).json({
        success: false,
        error: 'Completed units cannot exceed total units'
      });
    }

    const effectiveActiveDays = activeDays || user.activeDays || [0, 1, 2, 3, 4, 5, 6];
    const effectiveExcludedDates = excludedDates || user.excludedDates || [];
    const effectiveTargetDate = targetDate || user.targetDate;

    // Compute dynamic rebalance with integer remainder distribution
    const rebalancedResult = rebalancePlan({
      totalUnits: computedTotalUnits,
      completedUnits: computedCompletedUnits,
      targetDate: effectiveTargetDate,
      activeDays: effectiveActiveDays,
      excludedDates: effectiveExcludedDates,
      today: new Date()
    });

    // Update user preferences if modified
    if (activeDays || excludedDates || targetDate) {
      await dbService.updateUser(user.userId, {
        ...(activeDays ? { activeDays } : {}),
        ...(excludedDates ? { excludedDates } : {}),
        ...(targetDate ? { targetDate } : {})
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        planId: user.userId,
        track: user.currentTrack,
        status: rebalancedResult.status,
        todayQuota: rebalancedResult.dailyQuota,
        remainingUnits: rebalancedResult.remainingUnits,
        remainingDaysCount: rebalancedResult.remainingDaysCount,
        activeDays: effectiveActiveDays,
        excludedDates: effectiveExcludedDates,
        schedule: rebalancedResult.schedule
      }
    });
  } catch (error) {
    next(error);
  }
}
