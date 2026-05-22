import { Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { AuthenticatedRequest, UserPayload } from '../types';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';

export const protect = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  let token: string | undefined;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new UnauthorizedError('You are not logged in. Please login to get access.'));
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return next(new UnauthorizedError('Invalid or expired authentication session.'));
  }
};

export const restrictTo = (...roles: Array<'USER' | 'ADMIN'>) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required.'));
    }

    if (!roles.includes(req.user.role)) {
      return next(new ForbiddenError('You do not have permission to perform this action.'));
    }

    next();
  };
};
