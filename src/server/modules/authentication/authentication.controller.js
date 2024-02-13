import fetch from 'node-fetch';
import sgMail from '@sendgrid/mail';
import nodemailer from 'nodemailer';
import { config } from '../../config/config.js';


import userModel from '../users/user.model.js';
import userController from '../users/user.controller.js';

// SendGrid API key setup
sgMail.setApiKey('YOUR_SENDGRID_API_KEY');

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
app.post('/signup', async (req, res) => {
    const { email } = req.body;
    const code = Math.floor(100000 + Math.random() * 900000).toString(); // Generate 6-digit code
    sendVerificationEmail(email, code); // Send email with verification code
    await User.create({ email, verificationCode: code }); // Save code to database
    res.send('Verification code sent to your email.');
});

// Endpoint for Forgot Password
const forgotPassword = async (req, res) => {
//   const { email } = req.body;

//   // Generate random 6-digit verification code
//   const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

//   const user = await userController.getUserByEmail(email)
//   if (!user) {
//     res.status(404).send({
//       success: false,
//       message: 'User not found',
//     });
//     return;
//   }

//   // Save user to database
//   user.email = email;
//   user.verificationCode = verificationCode;
//   await user.save();

//   // Send verification email
//   const msg = {
//     to: email,
//     from: 'bobtail.dev@gmail.com',
//     subject: 'Verification Code',
//     text: `Your verification code is: ${verificationCode}`,
//   };
//   try {
//     await sgMail.send(msg);
//     res.send('Verification email sent!');
//   } catch (error) {
//     console.error('Error sending verification email:', error);
//     res.status(500).send('Error sending verification email');
//   }

 const { email } = req.body;
 const code = Math.floor(100000 + Math.random() * 900000).toString(); // Generate 6-digit code
 sendVerificationEmail(email, code); // Send email with verification code
 await userModel.updateOne({ email }, { verificationCode: code }); // Update code in database
 res.send('Verification code sent to your email.');
};

// Endpoint for verifying the code
const verify = async (req, res) => {
 const { email, code } = req.body;
 const user = await userModel.findOne({ email, verificationCode: code });
 if (user) {
   res.send('Verification successful');
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

export default { login, forgotPassword, verify };
