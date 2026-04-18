require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./src/config/database');
const errorHandler = require('./src/middleware/errorHandler');

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Root route
app.get('/', (req, res) => {
  res.status(200).json({ success: true, message: 'Smart Panchayat API Server Running' });
});

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

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is running' });
});

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
