import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import ViteExpress from 'vite-express';
import { config } from './config/config.js';
import mongo from './database/db.js';
import userRouter from './modules/users/user.router.js';

console.log({ config });

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/users', userRouter);

app.get('/hello', (req, res) => {
  res.send('Hello Vite!');
});
mongo(); // To test that we connected with mongoDB
ViteExpress.listen(app, config.port, () => console.log(`Server is listening on port ${config.port}...`));
