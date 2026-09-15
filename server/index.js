import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { env } from './config/env.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { cronService } from './services/cronService.js';
import { initRedis } from './config/redis.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Route imports
import authRoutes from './routes/authRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import newsletterRoutes from './routes/newsletterRoutes.js';
import userRoutes from './routes/usersRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import cmsRoutes from './routes/cmsRoutes.js';
import icalRoutes from './routes/icalRoutes.js';
import pricingRoutes from './routes/pricingRoutes.js';

const app = express();
app.set('trust proxy', true); // Required for express-rate-limit when hosted on Railway

// --- SECURITY MIDDLEWARES ---
app.use(helmet({
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
  crossOriginResourcePolicy: { policy: "cross-origin" }
})); // Protect HTTP headers with Google OAuth popup support

// Rate limiting (max 100 requests per 15 mins per IP)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, error: 'Too many requests from this IP, please try again later.' },
  validate: { trustProxy: false, xForwardedForHeader: false, default: false }
});
app.use('/api', limiter);

// --- GLOBAL MIDDLEWARES ---
const allowedOrigins = [
  'https://luluaurelian.co.ke',
  'https://www.luluaurelian.co.ke',
  'http://luluaurelian.co.ke',
  'http://www.luluaurelian.co.ke',
  'https://staff.luluaurelian.co.ke',
  'http://staff.luluaurelian.co.ke',
  'https://agent.luluaurelian.co.ke',
  'http://agent.luluaurelian.co.ke',
  'https://lulu-aurelian.vercel.app',
  'http://localhost:5173',
  'http://localhost:5000',
  'http://localhost:3000' 
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.includes(origin) ||
      /^https?:\/\/(.+\.)?luluaurelian\.co\.ke$/.test(origin) ||
      /^https?:\/\/lulu-aurelian.*\.vercel\.app$/.test(origin)
    ) {
      return callback(null, true);
    }
    console.warn(`[CORS BLOCKED]: Origin '${origin}' is not in allowedOrigins.`);
    return callback(new Error(`The CORS policy for this site does not allow access from the specified Origin: ${origin}`), false);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-mpesa-secret'],
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Informative Logger Request Hook
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[HTTP]: ${timestamp} | [${req.method}] ${req.url} | Remote-IP: ${req.ip}`);
  next();
});

// --- API ROUTE MOUNTING ---
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/newsletters', newsletterRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/cms', cmsRoutes);
app.use('/api/ical', icalRoutes);
app.use('/api/pricing', pricingRoutes);


// --- STATIC ASSETS & SPA FRONTEND FALLBACK SERVING ---
const staffDistDir = path.join(__dirname, '../dist-staff');
const mainDistDir = path.join(__dirname, '../dist');

const staticOptions = {
  maxAge: '1d',
  setHeaders: (res, filePath) => {
    // Vite compiles assets into the "assets" folder with cache-busting hashes
    if (filePath.includes(path.sep + 'assets' + path.sep) || filePath.includes('/assets/')) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    } else if (filePath.endsWith('.html')) {
      // HTML files must always revalidate to fetch new builds instantly
      res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    } else {
      // General static assets (logos, images, favicon)
      res.setHeader('Cache-Control', 'public, max-age=86400');
    }
  }
};

if (fs.existsSync(staffDistDir)) {
  app.use(express.static(staffDistDir, staticOptions));
}
if (fs.existsSync(mainDistDir)) {
  app.use(express.static(mainDistDir, staticOptions));
}

// Health check diagnostic endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date(),
    environment: env.NODE_ENV,
    uptime: process.uptime()
  });
});

// SPA Fallback for non-API GET requests
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next(); // Pass missing /api routes to notFoundHandler
  }

  const staffHtml = path.join(staffDistDir, 'staff.html');
  const staffIndexHtml = path.join(staffDistDir, 'index.html');
  const mainIndexHtml = path.join(mainDistDir, 'index.html');

  if (fs.existsSync(staffHtml)) {
    return res.sendFile(staffHtml);
  } else if (fs.existsSync(staffIndexHtml)) {
    return res.sendFile(staffIndexHtml);
  } else if (fs.existsSync(mainIndexHtml)) {
    return res.sendFile(mainIndexHtml);
  }

  res.status(200).json({
    name: 'Lulu Aurelian Estate API',
    status: 'online',
    version: '1.0.0'
  });
});

// --- ERROR & WILDCARD HANDLERS ---
app.use(notFoundHandler);
app.use(errorHandler);

// --- AUTOMATION TRIGGERS ---
cronService.initializeScheduledTasks();

// --- INITIATE SERVER LISTEN ---
let server;
initRedis().then(() => {
  server = app.listen(env.PORT, () => {
    console.log(`\n========================================================================`);
    console.log(`[LULU AURELIAN BACKEND]: Server active and listening on port: ${env.PORT}`);
    console.log(`[LULU AURELIAN BACKEND]: Environment: ${env.NODE_ENV.toUpperCase()}`);
    console.log(`========================================================================\n`);
  });
});

// Handle graceful system shutdown
process.on('SIGTERM', () => {
  console.log('[SHUTDOWN]: SIGTERM signal received. Terminating process hooks gracefully...');
  server.close(() => {
    console.log('[SHUTDOWN]: Express server terminated. Database released.');
    process.exit(0);
  });
});
