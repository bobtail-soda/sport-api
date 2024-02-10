import 'dotenv/config';
import swaggerAutogen from 'swagger-autogen';
import { config } from './src/server/config/config.js';

const doc = {
  info: {
    title: 'Bobtail-Soda Sport Tracking API',
    description: 'Documentation automatically generated by the <b>swagger-autogen</b> module.',
  },
  host: `${config.swagger_url}`,
  schemes: ['http', 'https'],
  consumes: ['application/json'],
  produces: ['application/json'],
  tags: [
    {
      name: 'Authentication',
      description: 'Authentication Endpoint',
    },
    {
      name: 'Users',
      description: 'Users Endpoint',
    },
    {
      name: 'Exercise Activity',
      description: 'Exercise Activity Endpoint',
    },
    {
      name: 'Upload Image',
      description: 'Upload image to Cloudinary Endpoint',
    },
    {
      name: 'Health Check',
      description: 'Server Health Check Endpoint',
    },
  ],
  securityDefinitions: {
    Bearer: {
      type: 'apiKey',
      name: 'Authorization',
      scheme: 'bearer',
      in: 'header',
      description: '>- Enter the token with the `Bearer: ` prefix, e.g. "Bearer abcde12345".',
    },
  },
};

const outputFile = './swagger-output.json';
const routes = [
  './src/server/main.js',
  './src/server/modules/users/user.router.js',
  './src/server/modules/exerciseActivity/exerciseActivity.router.js',
  './src/server/modules/uploadImage/uploadImage.router.js',
  './src/server/utils/cloudinary.js'
];

/* NOTE: If you are using the express Router, you must pass in the 'routes' only the
root file where the route starts, such as index.js, app.js, routes.js, etc ... */

swaggerAutogen()(outputFile, routes, doc);