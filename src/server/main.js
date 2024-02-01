import clc from 'cli-color';
import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import ViteExpress from 'vite-express';
import { config } from './config/config.js';
import mongo from './database/db.js';
import exerciseActivityRouter from './modules/exerciseActivity/exerciseActivity.router.js';
import userController from './modules/users/user.controller.js';
import userRouter from './modules/users/user.router.js';
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import userModel from './modules/users/user.model.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const app = express();

app.use(helmet());
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());
app.use('/api/users', userRouter);
app.use('/api/exercise-activities', exerciseActivityRouter);

app.get('/hello', (req, res) => {
  res.send('Hello Health check!');
});

app.post('/login', async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    // Fetch user from database
    const user = await userController.getUserByEmail(email);
    if (!user) {
      return res.status(400).json({ error: { message: 'Invalid email' } });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(400).json({ error: { message: 'Invalid password' } });
    }

    res.status(200).json({ token: createJwt(user) });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(404).json({ error: 'User not found' });
  }
});

////////////////////////////////////////////////////////////
// upload photo part
cloudinary.config({
  cloud_name: config.cloud_name,
  api_key: config.api_key,
  api_secret: config.api_secret,
});

async function uploadToCloudinary(req, res, next) {
  const fileBufferBase64 = Buffer.from(req.file.buffer).toString('base64');
  const base64File = `data:${req.file.mimetype};base64,${fileBufferBase64}`;
  req.cloudinary = await cloudinary.uploader.upload(base64File, {
    resource_type: 'auto',
  });

  next();
}

const storage = multer.memoryStorage();
const upload = multer({ storage });

// upload photo function

const updatePhotoByUserID = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedPhoto = await userModel.findByIdAndUpdate(id, { avatar: req.cloudinary.secure_url });
    if (!updatedPhoto) {
      res.status(404).send({
        success: false,
        message: 'User not found',
      });
      return;
    }
    res.json({ data: updatedPhoto });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: 'Internal server error',
      error,
    });
  }
};


app.patch('/hey/:id', upload.single('image'), uploadToCloudinary, updatePhotoByUserID);
////////////////////////////////////////////////////////////


app.get('*', (req, res) => {
  res.sendStatus(404);
});

// create webtoken
function createJwt(user) {
  const jwtSecretKey = process.env.JWT_SECRET_KEY;
  const token = jwt.sign({ data: user }, jwtSecretKey, {
    expiresIn: '12h',
  });
  return token;
}

mongo(); // To test and for connected with mongoDB
ViteExpress.listen(app, config.port, () => console.log(`Server is listening on port ${clc.yellow(config.port)}...`));
