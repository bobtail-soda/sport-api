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
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { createJwt } from './utils/createJwt.js';
import { cleanup } from './modules/clean.server/cleanup.js';

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
app.get('*', (req, res) => {
  res.sendStatus(404);
});

// create webtoken


mongo(); // To test and for connected with mongoDB
ViteExpress.listen(app, config.port, () => console.log(`Server is listening on port ${clc.yellow(config.port)}...`));

// cleanup connection such as database
process.on('SIGTERM', cleanup);
process.on('SIGINT', cleanup);
