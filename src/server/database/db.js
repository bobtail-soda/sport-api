import mongoose from 'mongoose';
import { config } from '../config/config.js';

async function mongooseConnection() {
  try {
    // Connect to the MongoDB cluster
    const mongoAtlasUri = config.mongodbUri;
    await mongoose.connect(mongoAtlasUri, { useNewUrlParser: true, useUnifiedTopology: true, dbName: 'sport-db' });
    console.log('Mongoose is connected');
  } catch (e) {
    console.log('Mongoose error: ' + e.message);
  }

  const dbConnection = mongoose.connection;
  dbConnection.on('error', (err) => console.log(`Connection error ${err}`));
  dbConnection.once('open', () => console.log('Connected to DB!'));
}

export default mongooseConnection;
