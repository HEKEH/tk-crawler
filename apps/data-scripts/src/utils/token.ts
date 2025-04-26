import { decode, encode } from 'jwt-simple';
import config from '../config';

interface TokenData {
  userId: string;
  deviceId?: string;
}
export function generateToken(data: TokenData) {
  return encode(
    {
      ...data,
      expires: Date.now() + config.jwtTokenExpiresTime,
    },
    config.jwtSecret,
    config.jwtAlgorithm,
  );
}

export function parseToken(token: string): TokenData & { expires: number } {
  return decode(token, config.jwtSecret, false, config.jwtAlgorithm);
}
