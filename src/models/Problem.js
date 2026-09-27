import mongoose from 'mongoose';

const ProblemSchema = new mongoose.Schema(
  {
    sequenceOrder: {
      type: Number,
      required: true,
      unique: true,
      index: true
    },
    striverId: {
      type: String,
      required: false
    },
    stepNo: {
      type: Number,
      required: true
    },
    stepTitle: {
      type: String,
      required: true
    },
    subStepNo: {
      type: Number,
      default: 1
    },
    subStepTitle: {
      type: String,
      required: true
    },
    topic: {
      type: String,
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      index: true
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      required: true,
      index: true
    },
    links: {
      leetcode: { type: String, default: '' },
      gfg: { type: String, default: '' },
      takeuforward: { type: String, default: '' },
      youtube: { type: String, default: '' }
    },
    companyTags: [{ type: String }],
    tracks: [{
      type: String,
      enum: ['all', 'beginner', 'intermediate', 'advanced', 'elite']
    }],
    notes: { type: String, default: '' }
  },
  { timestamps: true }
);

ProblemSchema.index({ tracks: 1, sequenceOrder: 1 });
ProblemSchema.index({ topic: 1, difficulty: 1 });

export default mongoose.models.Problem || mongoose.model('Problem', ProblemSchema);
