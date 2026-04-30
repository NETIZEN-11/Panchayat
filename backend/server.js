require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');
const cron = require('node-cron');
const connectDB = require('./src/config/database');
const errorHandler = require('./src/middleware/errorHandler');
const { initializeFirebase } = require('./src/utils/fcm');
const { initSocketIO } = require('./src/utils/socket');

// Connect to database
connectDB();

const app = express();

// ─── CORS ─────────────────────────────────────────────────────
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map(o => o.trim())
  : ['*'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

// ─── Body Parsers ─────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Static Files ─────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── Firebase ─────────────────────────────────────────────────
initializeFirebase();

// ─── Routes ───────────────────────────────────────────────────
app.use('/api/auth',          require('./src/routes/authRoutes'));
app.use('/api/complaints',    require('./src/routes/complaintRoutes'));
app.use('/api/schemes',       require('./src/routes/schemeRoutes'));
app.use('/api/chatbot',       require('./src/routes/chatbotRoutes'));
app.use('/api/announcements', require('./src/routes/announcementRoutes'));
app.use('/api/polls',         require('./src/routes/pollRoutes'));
app.use('/api/directory',     require('./src/routes/directoryRoutes'));
app.use('/api/notifications', require('./src/routes/notificationRoutes'));
app.use('/api/feedback',      require('./src/routes/feedbackRoutes'));
app.use('/api/analytics',     require('./src/routes/analyticsRoutes'));
app.use('/api/workers',       require('./src/routes/workerRoutes'));
app.use('/api/emergency',     require('./src/routes/emergencyAlertRoutes'));
app.use('/api/documents',     require('./src/routes/documentRoutes'));
app.use('/api/assets',        require('./src/routes/assetRoutes'));
app.use('/api/meetings',      require('./src/routes/meetingRoutes'));
app.use('/api/lostfound',     require('./src/routes/lostFoundRoutes'));

// ─── Health Check ─────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Smart Panchayat API is running',
    env: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ─── 404 Handler ──────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ─── Error Handler ────────────────────────────────────────────
app.use(errorHandler);

// ─── Server ───────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

initSocketIO(server);

// ─── Auto-escalation Cron (daily midnight IST) ────────────────
cron.schedule('0 0 * * *', async () => {
  try {
    const Complaint = require('./src/models/Complaint');
    const days = parseInt(process.env.ESCALATION_DAYS) || 7;
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const result = await Complaint.updateMany(
      { status: 'Pending', isEscalated: false, createdAt: { $lte: cutoff } },
      { $set: { isEscalated: true, escalatedAt: new Date(), priority: 'Urgent' } }
    );
    if (result.modifiedCount > 0) {
      console.log(`[CRON] Auto-escalated ${result.modifiedCount} complaints older than ${days} days`);
    }
  } catch (err) {
    console.error('[CRON] Auto-escalation error:', err.message);
  }
}, { timezone: 'Asia/Kolkata' });

server.listen(PORT, () => {
  console.log(`[SERVER] Running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});
