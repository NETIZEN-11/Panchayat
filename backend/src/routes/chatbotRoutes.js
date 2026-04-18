const express = require('express');
const router = express.Router();
const { chat, getFAQ } = require('../controllers/chatbotController');
const { protect } = require('../middleware/auth');

router.post('/', protect, chat);
router.get('/faq', getFAQ);

module.exports = router;
