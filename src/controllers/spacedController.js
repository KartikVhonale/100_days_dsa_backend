import { dbService } from '../config/db.js';

export async function listSpacedReviews(req, res) {
  try {
    const userId = req.user?.userId || req.query.userId || 'default_candidate';
    const reviews = await dbService.getSpacedRepetitions(userId);

    const now = new Date();
    const enriched = reviews.map(r => {
      const dueDate = new Date(r.reviewDueDate);
      const isDue = dueDate <= now;
      const daysUntilDue = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
      return {
        ...r,
        isDue,
        daysUntilDue
      };
    });

    return res.status(200).json({ success: true, data: enriched });
  } catch (error) {
    console.error('[SpacedController] listSpacedReviews error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function updateReviewStatus(req, res) {
  try {
    const { id } = req.params;
    const { status = 'completed', retentionScore = 5 } = req.body;

    const updated = await dbService.updateSpacedRepetition(id, status, retentionScore);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Review item not found' });
    }

    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error('[SpacedController] updateReviewStatus error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
