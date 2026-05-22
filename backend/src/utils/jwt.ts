import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { UserPayload } from '../types';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'default_super_secret_luxe_blooms_floral';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export const signToken = (payload: UserPayload): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
};

export const verifyToken = (token: string): UserPayload => {
  try {
    return jwt.verify(token, JWT_SECRET) as UserPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};
