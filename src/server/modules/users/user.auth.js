import jwt from 'jsonwebtoken';
import { config } from '../../config/config.js';

export const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const jwtSecretKey = config.jwt_secret_key;

  if (!authHeader || !authHeader.startsWith('Bearer')) {
    return res.status(401).json({ error: { message: 'Unauthorized' } });
  }

  const token = authHeader.split(' ')[1]; // Get the token part after "Bearer"

  try {
    const decoded = jwt.verify(token, jwtSecretKey);
    req.user = decoded;
    next();
  } catch (err) {
    console.log(err);
    res.status(400).json({ error: { message: 'Invalid token.' } });
  }
};
