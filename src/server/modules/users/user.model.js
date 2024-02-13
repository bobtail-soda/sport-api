import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: [true, 'user name is required'],
      unique: true,
    },
    email: {
      type: String,
      required: [true, 'email is required'],
      unique: true,
    },
    password: {
      type: String,
      required: [true, 'password is required'],
    },
    phone: {
      type: String,
      required: [true, 'phone is required'],
    },
    avatar: {
      type: String,
      default: 'https://cdn-icons-png.flaticon.com/512/6596/6596121.png',
    },
    date_of_birth: {
      type: Date,
      default: '1992-01-30T16:04:14.313+00:00',
    },
    gender: {
      type: String,
      default: 'Female',
    },
    height: {
      type: String,
      default: '170',
    },
    weight: {
      type: String,
      default: '50',
    },
    verificationCode: {
      type: String,
    },
    exercise_activities: {
      type: [{ String }],
    },
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
