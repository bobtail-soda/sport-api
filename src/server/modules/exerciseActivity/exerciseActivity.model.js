import mongoose from 'mongoose';

const exerciseActivitySchema = new mongoose.Schema(
  {
    activity_type_id: {
      type: String,
      required: [true, 'activity type id is required'],
    },
    caption: {
      type: String,
      required: [true, 'caption is required'],
    },
    description: {
      type: String,
      required: [true, 'description is required'],
    },
    hour: {
      type: Number,
      required: [true, 'hour is required'],
    },
    minute: {
      type: Number,
      required: [true, 'minute is required'],
    },
    date: {
      type: String,
      required: [true, 'date is required'],
    },
    image: {
      type: String,
      default: 'https://cdn-icons-png.flaticon.com/512/6596/6596121.png',
    },
  },
  { timestamps: true }
);

export default mongoose.model('ExerciseActivity', exerciseActivitySchema, 'exercise-activities');
