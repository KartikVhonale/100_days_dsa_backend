import mongoose from 'mongoose';

const SpacedRepetitionSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      default: 'default_candidate'
    },
    problemId: {
      type: Number,
      required: true
    },
    problemTitle: {
      type: String,
      required: true
    },
    solvedDate: {
      type: Date,
      default: Date.now
    },
    reviewDueDate: {
      type: Date,
      required: true
    },
    intervalDays: {
      type: Number,
      default: 7 // default 7-day memory review protocol
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'skipped'],
      default: 'pending'
    },
    lastReviewedAt: {
      type: Date
    },
    retentionScore: {
      type: Number, // 1 to 5
      default: 5
    }
  },
  { timestamps: true }
);

export default mongoose.models.SpacedRepetition || mongoose.model('SpacedRepetition', SpacedRepetitionSchema);
