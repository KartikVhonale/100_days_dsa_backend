import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true
    },
    email: {
      type: String,
      unique: true,
      sparse: true, // Allow legacy/guest users without email
      trim: true,
      lowercase: true
    },
    passwordHash: {
      type: String
    },
    name: {
      type: String,
      default: 'FAANG Candidate'
    },
    currentTrack: {
      type: String,
      enum: ['all', 'beginner', 'intermediate', 'advanced', 'elite'],
      default: 'intermediate'
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    targetDate: {
      type: Date,
      default: () => new Date(Date.now() + 100 * 24 * 60 * 60 * 1000)
    },
    totalDays: {
      type: Number,
      default: 100
    },
    dailyHoursTarget: {
      type: Number,
      default: 2.5
    },
    timezone: {
      type: String,
      default: 'Asia/Kolkata'
    },
    activeDays: {
      type: [Number],
      default: [0, 1, 2, 3, 4, 5, 6]
    },
    excludedDates: {
      type: [String],
      default: []
    }
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model('User', UserSchema);
