import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../errors/app-error';
import { logger } from '../utils/logger.util';
import { env } from '../config/env.config';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  logger.error(`${req.method} ${req.originalUrl} - ${err.message}`);

  // 1. Handled Operational Application Errors (AppError)
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message,
      },
    });
    return;
  }

  // 2. Zod Request Validation Errors
  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));

    res.status(400).json({
      success: false,
      error: {
        message: 'Validation failed',
        details: formattedErrors,
      },
    });
    return;
  }

  // 3. Prisma Database Errors (Checked via name and code)
  const anyErr = err as any;
  if (anyErr && (anyErr.name === 'PrismaClientKnownRequestError' || (typeof anyErr.code === 'string' && anyErr.code.startsWith('P')))) {
    if (anyErr.code === 'P2002') {
      const target = Array.isArray(anyErr.meta?.target) ? anyErr.meta.target.join(', ') : 'field';
      res.status(409).json({
        success: false,
        error: {
          message: `A record with this ${target} already exists.`,
        },
      });
      return;
    }

    if (anyErr.code === 'P2025') {
      res.status(404).json({
        success: false,
        error: {
          message: 'Requested record was not found.',
        },
      });
      return;
    }
  }

  // 4. Unhandled Generic / Server Errors
  const isDev = env.NODE_ENV === 'development';
  res.status(500).json({
    success: false,
    error: {
      message: 'Internal server error',
      ...(isDev && { stack: err.stack }),
    },
  });
};
