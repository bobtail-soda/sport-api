import clc from 'cli-color';
import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import ViteExpress from 'vite-express';
import { config } from './config/config.js';
import mongo from './database/db.js';

import dashboardRouter from './modules/dashboard/dashboard.router.js';
import authenRouter from './modules/authentication/authentication.router.js';
import exerciseActivityRouter from './modules/exerciseActivity/exerciseActivity.router.js';
import activityTypeRouter from './modules/activityType/activityType.router.js';
import uploadImageRouter from './modules/uploadImage/uploadImage.router.js';
import userController from './modules/users/user.controller.js';
import userRouter from './modules/users/user.router.js';
import { cleanup } from './modules/clean.server/cleanup.js';

//swagger
import swaggerUi from 'swagger-ui-express';
import swaggerFile from '../../swagger-output.json' assert { type: 'json' };
import bodyParser from 'body-parser';

const app = express();

app.use(helmet());
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());
app.use('/api/users', userRouter);
app.use('/api/upload-image', uploadImageRouter);
app.use('/api/exercise-activities', exerciseActivityRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/authen', authenRouter);
app.use('/api/activity-type', activityTypeRouter);


app.use('/doc', swaggerUi.serve, swaggerUi.setup(swaggerFile));
app.use(bodyParser.urlencoded({ extended: true }));


app.get('/hello', (req, res) => {
  // #swagger.tags = ['Health Check']
  res.send('Hello Health check!');
});

app.get('*', (req, res) => {
  res.sendStatus(404);
});

mongo(); // To test and for connected with mongoDB
ViteExpress.listen(app, config.port, () =>
  console.log(`Server is listening on port ${clc.yellow(config.port)}...\nSwagger API documentation: ${clc.blue(config.swagger_url+'/doc')}`));

// cleanup connection such as database
process.on('SIGTERM', cleanup);
process.on('SIGINT', cleanup);
