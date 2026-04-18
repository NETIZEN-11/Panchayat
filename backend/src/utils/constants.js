/**
 * Application Constants
 * Centralized configuration values
 */

// Status constants
const COMPLAINT_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in-progress',
  RESOLVED: 'resolved',
  REJECTED: 'rejected'
};

const COMPLAINT_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
};

const COMPLAINT_CATEGORIES = [
  'water',
  'road',
  'electricity',
  'sanitation',
  'health',
  'education',
  'other'
];

// User roles
const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin'
};

// Notification types
const NOTIFICATION_TYPES = {
  COMPLAINT: 'complaint',
  ANNOUNCEMENT: 'announcement',
  SCHEME: 'scheme',
  ALERT: 'alert',
  GENERAL: 'general'
};

// Scheme categories
const SCHEME_CATEGORIES = [
  'pension',
  'housing',
  'agriculture',
  'education',
  'health',
  'employment',
  'other'
];

// Directory categories
const DIRECTORY_CATEGORIES = [
  'doctor',
  'teacher',
  'shop',
  'worker',
  'electrician',
  'plumber',
  'other'
];

// Announcement categories
const ANNOUNCEMENT_CATEGORIES = [
  'general',
  'urgent',
  'event',
  'meeting',
  'holiday',
  'other'
];

// Pagination
const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100
};

// File upload
const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_FILES: 5,
  ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
};

// Duplicate detection
const DUPLICATE_DETECTION = {
  RADIUS_METERS: 100, // 100 meters
  TIME_WINDOW_HOURS: 24 // 24 hours
};

// JWT
const JWT = {
  EXPIRY: '30d',
  REFRESH_EXPIRY: '90d'
};

// Rate limiting
const RATE_LIMIT = {
  WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  MAX_REQUESTS: 100
};

// Emergency contacts
const EMERGENCY_CONTACTS = {
  AMBULANCE: '108',
  POLICE: '100',
  FIRE: '101',
  WOMEN_HELPLINE: '1091',
  CHILD_HELPLINE: '1098'
};

// Languages
const LANGUAGES = {
  ENGLISH: 'en',
  HINDI: 'hi'
};

// HTTP Status Codes
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500
};

module.exports = {
  COMPLAINT_STATUS,
  COMPLAINT_PRIORITY,
  COMPLAINT_CATEGORIES,
  USER_ROLES,
  NOTIFICATION_TYPES,
  SCHEME_CATEGORIES,
  DIRECTORY_CATEGORIES,
  ANNOUNCEMENT_CATEGORIES,
  PAGINATION,
  FILE_UPLOAD,
  DUPLICATE_DETECTION,
  JWT,
  RATE_LIMIT,
  EMERGENCY_CONTACTS,
  LANGUAGES,
  HTTP_STATUS
};
