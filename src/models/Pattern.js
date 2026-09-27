import mongoose from 'mongoose';

const PatternSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    category: {
      type: String,
      required: true
    },
    signature: {
      type: String,
      required: true
    },
    dataStructure: {
      type: String,
      required: true
    },
    timeComplexity: {
      type: String,
      default: 'O(N)'
    },
    spaceComplexity: {
      type: String,
      default: 'O(1)'
    },
    keyInsights: [{ type: String }],
    codeTemplate: {
      type: String,
      default: ''
    },
    exampleProblems: [{ type: String }]
  },
  { timestamps: true }
);

export default mongoose.models.Pattern || mongoose.model('Pattern', PatternSchema);
