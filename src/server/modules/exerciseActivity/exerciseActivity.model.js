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
    distance: {
      type: Number,
      required: [true, 'distance is required'],
    },
    calories: {
      type: Number,
      required: [true, 'calories is required'],
      default: '400',
    },
    date: {
      type: Date,
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
