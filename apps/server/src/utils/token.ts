import { decode, encode } from 'jwt-simple';
import config from '../config';

export function generateToken(userId: string) {
  return encode(
    {
      userId,
      expires: Date.now() + config.jwtTokenExpiresTime,
    },
    config.jwtSecret,
    config.jwtAlgorithm,
  );
}

export function parseToken(token: string): {
  userId: string;
  expires: number;
} {
  return decode(token, config.jwtSecret, false, config.jwtAlgorithm);
}
