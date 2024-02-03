import mongoose from 'mongoose'

export const cleanup = () => {
  currentServer.close(() => {
    console.log(`DISCONNECT DATABASE: NAME => ${databaseClient.db().databaseName}`);
    const dbConnection = mongoose.connection;
    try {
      dbConnection.close();
    } catch (error) {
      console.error(error);
    }
  });
};
