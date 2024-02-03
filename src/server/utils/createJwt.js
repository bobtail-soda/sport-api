import jwt from 'jsonwebtoken'

export function createJwt(user) {
  const jwtSecretKey = process.env.JWT_SECRET_KEY;
  const token = jwt.sign({ data: user }, jwtSecretKey, {
    expiresIn: '12h',
  });
  return token;
}
