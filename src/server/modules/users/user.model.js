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
    exercise_activities: {
      type: [{String}],
    },
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
