import { Request } from 'express';

export interface UserPayload {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
}

export interface CustomFlowerItem {
  flowerType: string;
  quantity: number;
  price: number;
}

export interface CustomFlowerConfig {
  wrapType: string;
  wrapColor: string;
  flowers: CustomFlowerItem[];
  cardMessage?: {
    to: string;
    message: string;
    from: string;
  };
}

export interface AuthenticatedRequest extends Request {
  user?: UserPayload;
}
