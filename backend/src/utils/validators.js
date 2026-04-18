/**
 * Input Validation Utilities
 */

const COMPLAINT_CATEGORIES = [
  'Road', 'Water', 'Electricity', 'Sanitation', 'Health', 'Education',
  'Drainage', 'Street Light', 'Public Property', 'Pollution',
  'Animal Nuisance', 'Encroachment', 'Government Services', 'Other'
];

const SCHEME_CATEGORIES = ['Agriculture', 'Education', 'Health', 'Social', 'Infrastructure', 'Other'];

const DIRECTORY_CATEGORIES = ['doctor', 'teacher', 'shop', 'worker', 'electrician', 'plumber', 'other'];

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidPhone = (phone) => {
  const phoneRegex = /^\+?[\d\s-]{10,}$/;
  return phoneRegex.test(phone);
};

const isValidCoordinates = (coordinates) => {
  if (!Array.isArray(coordinates) || coordinates.length !== 2) return false;
  const [longitude, latitude] = coordinates;
  return (
    typeof longitude === 'number' &&
    typeof latitude === 'number' &&
    longitude >= -180 && longitude <= 180 &&
    latitude >= -90 && latitude <= 90
  );
};

const isValidComplaintCategory = (category) => {
  return COMPLAINT_CATEGORIES.includes(category);
};

const isValidSchemeCategory = (category) => {
  return SCHEME_CATEGORIES.includes(category);
};

const isValidDirectoryCategory = (category) => {
  return DIRECTORY_CATEGORIES.includes(category);
};

const sanitizeString = (input) => {
  if (typeof input !== 'string') return input;
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
};

const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);

const isValidRating = (rating) => typeof rating === 'number' && rating >= 1 && rating <= 5;

const validatePassword = (password) => {
  if (!password || password.length < 6) {
    return { valid: false, message: 'Password must be at least 6 characters long' };
  }
  return { valid: true, message: 'Password is valid' };
};

const isValidImageType = (mimetype) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  return allowedTypes.includes(mimetype);
};

const validatePagination = (page, limit) => {
  const validPage = Math.max(1, parseInt(page) || 1);
  const validLimit = Math.min(100, Math.max(1, parseInt(limit) || 20));
  return { page: validPage, limit: validLimit };
};

module.exports = {
  isValidEmail,
  isValidPhone,
  isValidCoordinates,
  isValidComplaintCategory,
  isValidSchemeCategory,
  isValidDirectoryCategory,
  sanitizeString,
  isValidObjectId,
  isValidRating,
  validatePassword,
  isValidImageType,
  validatePagination
};
