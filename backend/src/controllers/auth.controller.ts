import { Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../config/db';
import { signToken } from '../utils/jwt';
import { AuthenticatedRequest } from '../types';
import { BadRequestError, NotFoundError, UnauthorizedError } from '../utils/errors';

export const register = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return next(new BadRequestError('Email already registered'));
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        cart: {
          create: {}
        }
      },
    });

    const token = signToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    res.status(201).json({
      status: 'success',
      token,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
      return next(new UnauthorizedError('Incorrect email or password'));
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordCorrect) {
      return next(new UnauthorizedError('Incorrect email or password'));
    }

    const token = signToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    res.status(200).json({
      status: 'success',
      token,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const googleLogin = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { credential, email, name, googleId } = req.body;
    
    // In production, we'd verify the token with Google API. 
    // Here we'll trust the payload from frontend for simplicity or create the user if googleId is provided.
    if (!email || !name) {
      return next(new BadRequestError('Google email and name are required'));
    }

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          name,
          email,
          googleId: googleId || `google_${Math.random().toString(36).substr(2, 9)}`,
          cart: {
            create: {}
          }
        },
      });
    } else if (!user.googleId) {
      // Connect existing email user with google credentials
      user = await prisma.user.update({
        where: { id: user.id },
        data: { googleId: googleId || `google_${Math.random().toString(36).substr(2, 9)}` }
      });
    }

    const token = signToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    res.status(200).json({
      status: 'success',
      token,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return next(new UnauthorizedError('Not logged in'));
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      }
    });

    if (!user) {
      return next(new NotFoundError('User not found'));
    }

    res.status(200).json({
      status: 'success',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      return next(new NotFoundError('No user found with that email address'));
    }

    // In a real application, send an email here with a reset token.
    // For this e-commerce app, we will mock the notification and succeed.
    res.status(200).json({
      status: 'success',
      message: 'Password reset link sent to your email address (Simulated)',
    });
  } catch (error) {
    next(error);
  }
};
