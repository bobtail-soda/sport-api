import clc from 'cli-color';
import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import ViteExpress from 'vite-express';
import { config } from './config/config.js';
import mongo from './database/db.js';
import userController from './modules/users/user.controller.js';
import userRouter from './modules/users/user.router.js';
import exerciseActivityRouter from './modules/exerciseActivity/exerciseActivity.router.js'

console.log({ config });

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/users', userRouter);
app.use('/api/exercise-activities', exerciseActivityRouter);

app.get('/hello', (req, res) => {
  res.send('Hello Vite!');
});

mongo(); // To test and for connected with mongoDB
ViteExpress.listen(app, config.port, () => console.log(`Server is listening on port ${clc.yellow(config.port)}...`));
