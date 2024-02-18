import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'first name is required'],
    },
    lastName: {
      type: String,
      required: [true, 'last name is required'],
    },
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
    },
    gender: {
      type: String,
    },
    height: {
      type: String,
    },
    weight: {
      type: String,
    },
    isVerified: {
      type: Boolean,
      default: false,
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
