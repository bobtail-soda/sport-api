import mongoose from 'mongoose';

const activityTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'name is required'],
    },
    met: {
      type: Number,
    }
  },
  { timestamps: true }
);

export default mongoose.model('ActivityType', activityTypeSchema, 'activitiy-type');
