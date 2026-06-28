import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { cronService } from './services/cronService.js';
import { initRedis } from './config/redis.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import newsletterRoutes from './routes/newsletterRoutes.js';
import userRoutes from './routes/usersRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import cmsRoutes from './routes/cmsRoutes.js';
import icalRoutes from './routes/icalRoutes.js';

const app = express();
app.set('trust proxy', 1); // Required for express-rate-limit when hosted on Railway

// --- SECURITY MIDDLEWARES ---
app.use(helmet()); // Protect HTTP headers

// Rate limiting (max 100 requests per 15 mins per IP)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, error: 'Too many requests from this IP, please try again later.' },
});
app.use('/api', limiter);

// --- GLOBAL MIDDLEWARES ---
const allowedOrigins = env.NODE_ENV === 'production' 
  ? ['https://luluaurelian.co.ke', 'https://www.luluaurelian.co.ke'] 
  : ['http://localhost:5173', 'http://localhost:5000'];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (env.NODE_ENV !== 'production') return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      return callback(new Error('The CORS policy for this site does not allow access from the specified Origin.'), false);
    }
    return callback(null, true);
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


// Health check diagnostic endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date(),
    environment: env.NODE_ENV,
    uptime: process.uptime()
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
