import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import { config } from '../../config/config.js';
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

    if (!user) {
      return res.status(400).json({ error: { message: 'Invalid email. Please try again.' } });
    }

    //account not verify yet.
    if (!user.isVerified) {
      return res.status(400).json({ error: { message: 'Please veifiy your account. Verfication code is sent to your email.' } });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(400).json({ error: { message: 'Invalid password. Please try again.' } });
    }

    res.status(200).json({ token: createJwt(user), userId: user._id });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(404).json({ error: 'User not found' });
  }
};

const checkPassword = async (req, res) => {
  // #swagger.tags = ['Authentication']
  try {
    const {user_id} = req.params
    const  oldPassword = req.body.oldPassword;

    // Fetch user from database
    const user = await userModel.findById(user_id)
    console.log(user);
    if (!user) {
      return res.status(400).json({ error: { message: 'Invalid email' } });
    }

    // Check password
    const validPassword = await bcrypt.compare(oldPassword, user.password);

    if (!validPassword) {
      return res.status(400).json({ error: { message: 'Invalid password' } });
    }

    res.status(200).json({ token: createJwt(user), userId: user._id });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(404).json({ error: 'User not found' });
  }
};

const signup = async (req, res) => {
  try {
    //step1: get data from body
    const { firstName, lastName, userName, email, password, phone } = req.body;

    // step2: check email user in db , must not duplicate
    const isExisting = await userController.getUserByEmail(email);
    console.log('check user email', isExisting);

    if (isExisting === null) {
      // step3: Hash password
      const saltRounds = 15;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      //step4: // Generate 6-digit code
      const code = Math.floor(100000 + Math.random() * 900000).toString();

      // step5: Save all data
      const user = await userModel.create({
        firstName,
        lastName,
        userName,
        email,
        password: hashedPassword,
        phone,
        verificationCode: code,
      }); // Save code to database

      await sendVerificationEmail(email, code);
      // user = await userModel.create({ userName, email, password: hashedPassword, phone });
      user.password = undefined;
      user.verificationCode = undefined;
      // step6: Send email with verification code
      console.log('Verification code sent to your email.');

      console.log('create user success');
      res.status(201).send({
        success: true,
        message: 'User created successfully',
        data: user,
      });
    } else {
      res.status(404).json({ error: 'Existing user email in Database' });
    }
  } catch (error) {
    console.error('Error create new user:', error);
    res.status(404).json({ error: 'Create new user failed.' });
  }
};

// Endpoint for Forgot Password
const forgotPassword = async (req, res) => {
  try{
    const { email } = req.body;
    const code = Math.floor(100000 + Math.random() * 900000).toString(); // Generate 6-digit code

    await sendVerificationEmail(email, code); // Send email with verification code

    const user = await userController.getUserByEmail(email);

    if (user) {

    user.isVerified = false;
    user.verificationCode = code;
    await user.save();

    res.status(200).send({
      success: true,
      message: `Verification code sent to ${email}.`,
    });

  } else {
    res.send('Invalid email');
  }


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

  if (user && user.isVerified === false ) {
    if(user.verificationCode === code){
       user.isVerified = true;
      await user.save();
      res.status(200).send({
        success: true,
        message: 'Verification successfully.',
        data: user._id
      });
    }else{
      return res.status(400).json({ error: { message: 'Invalid verification code.' } });
    }
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
const sendVerificationEmail = async (email, code) => {
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

    if (user.verificationCode && user.isVerified === false) {
      const code = Math.floor(100000 + Math.random() * 900000).toString(); // Generate 6-digit code
      await sendVerificationEmail(email, code); // Send email with verification code

      user.isVerified = false;
      user.verificationCode = code;
      await user.save();

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

export default { login, forgotPassword, verify, resendCode, createNewPassword, checkPassword, signup };
