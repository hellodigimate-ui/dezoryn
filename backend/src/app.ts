import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import path from 'path';
import { env } from './config/env.config';
import routes from './routes';
import { notFoundHandler } from './middlewares/not-found.middleware';
import { errorHandler } from './middlewares/error.middleware';

const app: Application = express();

// Security Middlewares
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// Gzip Compression for fast responses and minimal bandwidth
app.use(compression());

// Smart HTTP Cache-Control for fast page loads and CDN edge caching
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.headers.authorization) {
    if (req.query._t) {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    } else {
      res.setHeader('Cache-Control', 'public, max-age=30, stale-while-revalidate=120');
    }
  } else {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  }
  next();
});

// CORS Configuration
const allowedOrigins = [
  'https://dezoryn.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5000',
];

if (env.CORS_ORIGIN) {
  env.CORS_ORIGIN.split(',').forEach((o) => {
    const trimmed = o.trim();
    if (trimmed && !allowedOrigins.includes(trimmed)) {
      allowedOrigins.push(trimmed);
    }
  });
}

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith('.vercel.app') ||
        origin.includes('localhost') ||
        origin.includes('127.0.0.1')
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);


// Body Parsing & Cookie Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// HTTP Request Logger
if (env.NODE_ENV !== 'test') {
  app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'));
}

// Serve Static Uploads Directory
const uploadPath = path.resolve(process.cwd(), env.UPLOAD_DIR);
const staticOptions = {
  setHeaders: (res: express.Response) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  },
};
app.use('/uploads', express.static(uploadPath, staticOptions));
app.use('/uploads', express.static(path.resolve(process.cwd(), 'public/uploads'), staticOptions));
app.use('/api/v1/uploads/file', express.static(uploadPath, staticOptions));

// Root Route - Render / basic service check
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Dezoryn CMS Backend API is running',
  });
});

// API Routes
app.use(env.API_PREFIX, routes);

// 404 Route Not Found Handler
app.use(notFoundHandler);

// Global Error Handler
app.use(errorHandler);

export default app;
