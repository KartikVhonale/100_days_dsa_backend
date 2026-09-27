import mongoose from 'mongoose';

const ProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
      default: 'default_candidate'
    },
    problemId: {
      type: Number, // sequenceOrder
      required: true,
      index: true
    },
    status: {
      type: String,
      enum: ['completed', 'revision_needed', 'bookmarked'],
      default: 'completed'
    },
    completedAt: {
      type: Date,
      default: Date.now
    },
    timeSpentMinutes: {
      type: Number,
      default: 25
    },
    timeComplexity: {
      type: String,
      default: 'O(N)'
    },
    spaceComplexity: {
      type: String,
      default: 'O(1)'
    },
    patternUsed: {
      type: String,
      default: ''
    },
    notes: {
      type: String,
      default: ''
    },
    difficultyPerceived: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Medium'
    }
  },
  { timestamps: true }
);

ProgressSchema.index({ userId: 1, problemId: 1 }, { unique: true });

export default mongoose.models.Progress || mongoose.model('Progress', ProgressSchema);
