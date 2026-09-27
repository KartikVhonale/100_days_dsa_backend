/**
 * Calculates remaining active study dates between two dates.
 * Accounts for day-of-week routines and blackout/holiday dates.
 * 
 * @param {Date|string} startDate 
 * @param {Date|string} endDate 
 * @param {number[]} activeDays - Array of active day numbers (0 = Sun, 1 = Mon, ..., 6 = Sat)
 * @param {string[]} excludedDates - Array of ISO date strings (YYYY-MM-DD) to skip
 * @returns {Date[]} Array of eligible study dates
 */
export function getEligibleDates(startDate, endDate, activeDays = [0, 1, 2, 3, 4, 5, 6], excludedDates = []) {
  const dates = [];
  const curr = new Date(startDate);
  curr.setHours(0, 0, 0, 0);

  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);

  const blackoutSet = new Set(excludedDates || []);

  while (curr <= end) {
    const dayOfWeek = curr.getDay();
    const isoDateStr = curr.toISOString().split('T')[0];

    if (activeDays.includes(dayOfWeek) && !blackoutSet.has(isoDateStr)) {
      dates.push(new Date(curr));
    }
    curr.setDate(curr.getDate() + 1);
  }

  return dates;
}

/**
 * Rebalances remaining workload across remaining active dates.
 * Distributes integer remainder sequentially to ensure total matches exactly
 * without fractional units or lost items.
 *
 * @param {Object} params
 * @param {number} params.totalUnits - Total problems / units in curriculum
 * @param {number} params.completedUnits - Completed count
 * @param {Date|string} params.targetDate - End date
 * @param {number[]} [params.activeDays] - Active days of week [0..6]
 * @param {string[]} [params.excludedDates] - Blackout dates YYYY-MM-DD
 * @param {Date|string} [params.today] - Anchor date
 * @returns {Object} Rebalanced status, today quota, and day-by-day discrete schedule
 */
export function rebalancePlan({
  totalUnits,
  completedUnits,
  targetDate,
  activeDays = [0, 1, 2, 3, 4, 5, 6],
  excludedDates = [],
  today = new Date()
}) {
  const remainingUnits = Math.max(0, totalUnits - completedUnits);

  if (remainingUnits === 0) {
    return {
      status: 'COMPLETED',
      dailyQuota: 0,
      remainingUnits: 0,
      remainingDaysCount: 0,
      schedule: []
    };
  }

  const eligibleDates = getEligibleDates(today, targetDate, activeDays, excludedDates);
  const remainingDaysCount = eligibleDates.length;

  if (remainingDaysCount === 0) {
    return {
      status: 'OVERDUE',
      dailyQuota: remainingUnits,
      remainingUnits,
      remainingDaysCount: 0,
      schedule: []
    };
  }

  // Base integer division and remainder distribution
  const baseQuota = Math.floor(remainingUnits / remainingDaysCount);
  const remainder = remainingUnits % remainingDaysCount;

  // Earlier days receive +1 unit until remainder is exhausted
  const schedule = eligibleDates.map((date, index) => {
    const quota = index < remainder ? baseQuota + 1 : baseQuota;
    return {
      date: date.toISOString().split('T')[0],
      dayOfWeek: date.toLocaleDateString('en-US', { weekday: 'short' }),
      quota
    };
  });

  return {
    status: 'ACTIVE',
    dailyQuota: schedule[0]?.quota || 0,
    remainingUnits,
    remainingDaysCount,
    schedule
  };
}
