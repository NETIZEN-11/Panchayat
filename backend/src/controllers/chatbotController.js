const axios = require('axios');

// @desc    AI Chatbot - Answer queries
// @route   POST /api/chatbot
// @access  Private
exports.chat = async (req, res) => {
  try {
    const { message, language = 'en' } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    // System prompt for the chatbot
    const systemPrompt = language === 'hi' 
      ? `आप एक सहायक पंचायत सहायक हैं। आप ग्रामीण शासन, सरकारी योजनाओं, शिकायतों और पंचायत सेवाओं के बारे में सवालों के जवाब देते हैं। हिंदी में जवाब दें।`
      : `You are a helpful Panchayat assistant. You answer questions about village governance, government schemes, complaints, and panchayat services. Keep answers concise and helpful.`;

    // Call OpenAI API
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        max_tokens: 500,
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const aiResponse = response.data.choices[0].message.content;

    res.status(200).json({
      success: true,
      data: {
        message: aiResponse,
        language
      }
    });
  } catch (error) {
    console.error('Chatbot error:', error.response?.data || error.message);
    
    // Fallback response if OpenAI fails
    const fallbackMessage = req.body.language === 'hi'
      ? 'क्षमा करें, मैं अभी आपकी मदद नहीं कर सकता। कृपया बाद में पुनः प्रयास करें।'
      : 'Sorry, I cannot help you right now. Please try again later.';

    res.status(200).json({
      success: true,
      data: {
        message: fallbackMessage,
        language: req.body.language || 'en'
      }
    });
  }
};

// @desc    Get common questions
// @route   GET /api/chatbot/faq
// @access  Public
exports.getFAQ = async (req, res) => {
  try {
    const { language = 'en' } = req.query;

    const faqEn = [
      {
        question: 'How do I submit a complaint?',
        answer: 'Go to the Complaints section, tap "New Complaint", fill in the details, add photos, and submit.'
      },
      {
        question: 'How can I check government schemes?',
        answer: 'Visit the Schemes section to browse all available government schemes with eligibility criteria.'
      },
      {
        question: 'How do I track my complaint status?',
        answer: 'Go to "My Complaints" to see the current status and timeline of all your complaints.'
      },
      {
        question: 'Who can I contact in emergency?',
        answer: 'Use the Emergency section for quick access to Ambulance (108), Police (100), and Fire (101).'
      }
    ];

    const faqHi = [
      {
        question: 'मैं शिकायत कैसे दर्ज करूं?',
        answer: 'शिकायत अनुभाग में जाएं, "नई शिकायत" पर टैप करें, विवरण भरें, फोटो जोड़ें और सबमिट करें।'
      },
      {
        question: 'मैं सरकारी योजनाएं कैसे देख सकता हूं?',
        answer: 'योजना अनुभाग में जाएं और पात्रता मानदंड के साथ सभी उपलब्ध सरकारी योजनाएं देखें।'
      },
      {
        question: 'मैं अपनी शिकायत की स्थिति कैसे ट्रैक करूं?',
        answer: '"मेरी शिकायतें" में जाएं और अपनी सभी शिकायतों की वर्तमान स्थिति और समयरेखा देखें।'
      },
      {
        question: 'आपातकाल में मैं किससे संपर्क करूं?',
        answer: 'एम्बुलेंस (108), पुलिस (100), और फायर (101) के लिए आपातकालीन अनुभाग का उपयोग करें।'
      }
    ];

    res.status(200).json({
      success: true,
      data: language === 'hi' ? faqHi : faqEn
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
