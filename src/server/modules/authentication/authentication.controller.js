import nodemailer from 'nodemailer';
import { config } from '../../config/config.js';
import bcrypt from 'bcrypt';
import { createJwt } from '../../utils/createJwt.js';

import userController from '../users/user.controller.js';
import userModel from '../users/user.model.js';

// Endpoint for Login
const login = async (req, res) => {
  // #swagger.tags = ['Authentication']
  try {
    const email = req.body.email;
    const password = req.body.password;

    // Fetch user from database
    const user = await userController.getUserByEmail(email);
    console.log(user);
    if (!user) {
      return res.status(400).json({ error: { message: 'Invalid email' } });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(400).json({ error: { message: 'Invalid password' } });
    }

    res.status(200).json({ token: createJwt(user), userId: user._id });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(404).json({ error: 'User not found' });
  }
};

// TODO: Route for signup
// app.post('/signup', async (req, res) => {
//     const { email } = req.body;
//     const code = Math.floor(100000 + Math.random() * 900000).toString(); // Generate 6-digit code
//     sendVerificationEmail(email, code); // Send email with verification code
//     await User.create({ email, verificationCode: code }); // Save code to database
//     res.send('Verification code sent to your email.');
// });

// Endpoint for Forgot Password
const forgotPassword = async (req, res) => {
  try{
    const { email } = req.body;
    const code = Math.floor(100000 + Math.random() * 900000).toString(); // Generate 6-digit code

    sendVerificationEmail(email, code); // Send email with verification code

    await userModel.updateOne({ email }, { verificationCode: code }); // Update code in database

    res.status(200).send({
      success: true,
      message: `Verification code sent to ${email}.`,
    });
  }catch (error) {
    res.status(404).json({ error: error });
    res.status(500).send({
      success: false,
      message: 'Internal server error',
      error,
    });
  }
};

// Endpoint for verifying the code
const verify = async (req, res) => {
  const { email, code } = req.body;

  const user = await userController.getUserByEmail(email);

  // const user = await userModel.findOne({ email, verificationCode: code }).select(' _id userName email');
  if (user) {
    res.status(200).send({
      success: true,
      message: 'Verification successfully.',
      data: user._id
    });
    // You can handle login logic here
  } else {
    res.send('Invalid verification code');
  }
};

// Nodemailer configuration
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'bobtailsoda.dev@gmail.com',
    pass: config.gmail_passcode,
  },
});

// Function to send verification email
function sendVerificationEmail(email, code) {
  const mailOptions = {
    from: 'bobtailsoda.dev@gmail.com',
    to: email,
    subject: 'Verification Code',
    text: `Your verification code is: ${code}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}

// Endpoint for resend Code
const resendCode = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await userController.getUserByEmail(email);
    
    if (!user) {
      return res.status(400).json({ error: { message: 'Invalid email' } });
    }

    if (user.verificationCode) {
      const code = Math.floor(100000 + Math.random() * 900000).toString(); // Generate 6-digit code
      sendVerificationEmail(email, code); // Send email with verification code
      await userModel.updateOne({ email }, { verificationCode: code }); // Update code in database

      res.status(200).send({
        success: true,
        message: `Resend verification code to ${email} successfully.`,
      });
    } else {
      return res.status(400).json({ error: { message: 'Verification code does not exist.' } });
    }

  } catch (error) {
    res.status(404).json({ error: error });
    res.status(500).send({
      success: false,
      message: 'Internal server error',
      error,
    });
  }
};

const createNewPassword = async (req, res) => {
  // #swagger.tags = ['Users']
  //PUT
  try {
    const { user_id } = req.params;
    const { password } = req.body;

    // hash password
    const saltRounds = 15;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const user = await userModel.findById(user_id).select(' _id userName email');
    if (!user) {
      res.status(404).send({
        success: false,
        message: 'User not found',
      });
      return;
    }

    if (password) {
      user.password = hashedPassword;
    }

    await user.save();

    res.status(200).send({
      success: true,
      message: 'User create new password successfully',
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: 'Internal server error',
      error,
    });
  }
};

export default { login, forgotPassword, verify, resendCode, createNewPassword };
