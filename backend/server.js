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

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Initialize Firebase and FCM
initializeFirebase();

// Routes
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/complaints', require('./src/routes/complaintRoutes'));
app.use('/api/schemes', require('./src/routes/schemeRoutes'));
app.use('/api/chatbot', require('./src/routes/chatbotRoutes'));
app.use('/api/announcements', require('./src/routes/announcementRoutes'));
app.use('/api/polls', require('./src/routes/pollRoutes'));
app.use('/api/directory', require('./src/routes/directoryRoutes'));
app.use('/api/notifications', require('./src/routes/notificationRoutes'));
app.use('/api/feedback', require('./src/routes/feedbackRoutes'));
app.use('/api/analytics', require('./src/routes/analyticsRoutes'));
app.use('/api/workers', require('./src/routes/workerRoutes'));

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is running' });
});

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Initialize Socket.IO
initSocketIO(server);

// Auto-escalation cron: runs every day at midnight
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
      console.log(`[CRON] Auto-escalated ${result.modifiedCount} pending complaints older than ${days} days`);
    }
  } catch (err) {
    console.error('[CRON] Auto-escalation error:', err.message);
  }
}, { timezone: 'Asia/Kolkata' });

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
