const axios = require('axios');

// Panchayat knowledge base - covers all common topics
const KNOWLEDGE_BASE = {
  en: {
    topics: {
      greeting: [
        "Namaste! I'm your Smart Panchayat AI Assistant. How can I help you today?",
        "Hello! Welcome to Smart Panchayat. I can help you with complaints, schemes, village info and more. What would you like to know?",
        "Hi there! I'm here to help with all Panchayat-related queries. Ask me anything!"
      ],
      complaint_filing: [
        "To file a complaint:\n1. Go to Dashboard\n2. Tap 'File Complaint'\n3. Select category (Road, Water, Electricity, etc.)\n4. Fill title, description, location\n5. Add photos if available\n6. Submit!\n\nYour complaint will be sent to the Sarpanch for action.",
        "Filing a complaint is easy:\n• Go to 'File Complaint' from dashboard\n• Choose the category that matches your issue\n• Describe the problem clearly\n• Provide the location\n• Submit with or without photos\n\nThe Sarpanch will review and take action."
      ],
      complaint_status: [
        "To check your complaint status:\n1. Go to 'My Complaints' from dashboard\n2. You'll see all your complaints with status\n3. Status can be: Pending (red), In Progress (orange), Resolved (green)\n4. Tap on any complaint to see the full timeline\n5. You'll also get notifications when status changes",
        "Track your complaint:\n• Open 'My Complaints' from the dashboard\n• Each complaint shows its current status\n• Click on a complaint to see detailed timeline\n• When Sarpanch updates your complaint, you'll be notified\n• Resolved complaints show the resolution notes"
      ],
      schemes_info: [
        "Government Schemes Information:\n\n- PM-KISAN: ₹6,000/year for small farmers\n- Ayushman Bharat: ₹5 lakh health insurance per family\n- PM Awas Yojana: Financial aid for house construction\n- MGNREGA: 100 days guaranteed employment\n- Jan Dhan Yojana: Zero-balance bank accounts\n- Ujjwala Yojana: Free LPG connections\n\nVisit 'Schemes' section in app for full details and eligibility.",
        "Available Government Schemes:\n\n- Agriculture: PM-KISAN (₹6,000/year)\n- Health: Ayushman Bharat (₹5 lakh coverage)\n- Housing: PM Awas Yojana (house grants)\n- Employment: MGNREGA (100 days/year)\n- Finance: Jan Dhan, Sukanya Samriddhi\n- Women: Ujjwala, Beti Bachao\n\nCheck eligibility and apply through official portals."
      ],
      schemes_apply: [
        "To apply for schemes:\n1. Go to 'Schemes' in the app\n2. Browse categories (Agriculture, Health, Housing, etc.)\n3. Tap on any scheme to see full details\n4. Check eligibility criteria\n5. Click 'Official Site' to apply on government portal\n6. Some schemes need documents like Aadhaar, bank account, land records",
        "Applying for government schemes:\n• Each scheme has eligibility conditions\n• Common documents needed: Aadhaar card, bank account, passport photo\n• Visit the official website link in each scheme\n• For PM-KISAN: Visit pmkisan.gov.in\n• For Ayushman: Visit setu.pmjay.gov.in\n• For PM Awas: Visit pmayg.nic.in"
      ],
      directory_info: [
        "Village Directory contains contact information for:\n- Doctors - Health center contacts\n- Teachers - School faculty\n- Electricians - For electrical repairs\n- Plumbers - For water/pipeline issues\n- Shops - Ration shops, medical stores\n- Workers - Mason, carpenter, etc.\n\nGo to 'Village Directory' to search contacts and make calls directly.",
        "Need to contact someone in the village?\n\nThe Directory has:\n- Doctors - for health issues\n- Electricians - for power problems\n- Plumbers - for water/drainage issues\n- Teachers - for education queries\n- Shops - for ration and essentials\n\nContact them directly with one tap!"
      ],
      announcements: [
        "Stay updated with village announcements:\n• Go to 'Announcements' section\n• See all official notices from Sarpanch\n• Each announcement shows date, category, content\n• Categories: General, Urgent, Event, Meeting, Holiday\n• You can comment on announcements to interact",
        "Village Announcements:\n• All official notices from Sarpanch appear here\n• Important alerts are marked as 'Urgent'\n• Meeting and event announcements include details\n• You can ask questions by commenting\n• Check regularly for government updates"
      ],
      profile_account: [
        "Manage your profile:\n• Tap on 'Profile' to see your account details\n• View your name, email, phone, village\n• Change language from the language selector\n• Quick links connect to official government portals\n• Logout button at the bottom to sign out",
        "Your Account:\n• All your details are stored safely\n• Update language preference anytime\n• Access quick links to: India.gov.in, CPGRAMS grievance portal, PM-KISAN\n• Contact Sarpanch for any account changes"
      ],
      emergency: [
        "Emergency Contacts:\n- Ambulance: 108\n- Police: 100\n- Fire: 101\n- For other emergencies, contact your Sarpanch directly",
        "In case of emergency:\n- Medical emergency → Call 108 for ambulance\n- Crime/Theft → Call 100 for police\n- Fire accident → Call 101\n- For village emergencies, check the Directory for Sarpanch contact"
      ],
      sarpanch_duties: [
        "Sarpanch responsibilities:\n• Review and update complaints\n• Post village announcements\n• Manage village directory\n• Track complaint status\n• Escalate urgent issues to government\n\nSarpanch can update complaint status and assign workers.",
        "What Sarpanch does:\n• Receives complaints from citizens\n• Updates status (Pending → In Progress → Resolved)\n• Posts important announcements\n• Manages village directory contacts\n• Reports to government if needed"
      ],
      village_info: [
        "Village Information:\n• Your village name is shown in your profile\n• All complaints are tagged with village\n• Citizens can only see their own complaints\n• Sarpanch sees all complaints in their village\n• Government officers see complaints across all villages",
        "About Villages:\n• Each village has one Sarpanch\n• Complaints are managed by village Sarpanch\n• Government schemes apply across all villages\n• Village directory has local service contacts"
      ],
      how_to_use: [
        "How to use Smart Panchayat App:\n\nFor Citizens:\n- File complaints about village issues\n- Track complaint status\n- Browse government schemes\n- Contact village services\n- Receive announcements\n\nFor Sarpanch:\n- View all village complaints\n- Update complaint status\n- Post announcements\n- Manage directory\n\nFor Government:\n- Monitor all complaints\n- View analytics by village/category\n- Track resolution rates"
      ],
      not_understood: [
        "I'm here to help with Panchayat-related questions. I can answer about:\n• Filing and tracking complaints\n• Government schemes (PM-KISAN, Ayushman, etc.)\n• Village directory contacts\n• Announcement information\n• How to use the app\n\nTry asking in Hindi or English!",
        "I'm your Panchayat Assistant. I can help you understand:\n• How to file complaints\n• Status of your complaints\n• Government scheme details\n• Village directory contacts\n• How to use this app\n\nPlease ask about these topics!"
      ]
    },
    keywords: {
      greeting: ['hello', 'hi', 'hey', 'namaste', 'namaskar', 'good morning', 'good evening', 'kaise ho', 'kya haal'],
      complaint_filing: ['file complaint', 'new complaint', 'complaint kaise', 'shikayat kaise', 'report problem', 'submit complaint', 'how to file', 'complaint submit', 'शिकायत दर्ज', 'शिकायत कैसे', 'new', 'file', 'submit', 'report', 'problem', 'issue'],
      complaint_status: ['complaint status', 'my complaints', 'track complaint', 'complaint check', 'status check', 'shikayat ki sthiti', 'शिकायत स्थिति', 'track', 'status', 'pending', 'progress', 'resolved'],
      schemes_info: ['scheme', 'schemes', 'yojana', 'योजना', 'government scheme', 'sarkari yojana', 'pm-kisan', 'ayushman', 'pmay', 'mnrega', 'pension', 'subsidy', 'application', 'apply', ' eligibility', 'पात्रता'],
      schemes_apply: ['apply scheme', 'how to apply', 'application process', 'yojana apply', 'योजना आवेदन', 'आवेदन कैसे', 'registration', 'documents required'],
      directory_info: ['directory', 'contact', 'phone', 'call', 'doctor', 'electrician', 'plumber', 'teacher', 'shop', 'डायरेक्टरी', 'संपर्क', 'डॉक्टर', 'बिजली', 'पानी'],
      announcements: ['announcement', 'notice', 'noticeboard', 'circular', 'घोषणा', 'सूचना', 'notice kya', 'announcement kya'],
      profile_account: ['profile', 'account', 'my account', 'profile details', 'personal info', 'पर्सनल', 'अकाउंट'],
      emergency: ['emergency', 'ambulance', 'police', 'fire', 'help', 'urgent', 'आपातकाल', 'सहायता', 'emergency contact'],
      sarpanch_duties: ['sarpanch', 'village head', 'pradhan', 'who is sarpanch', 'sarpanch ka kaam', 'सरपंच', 'ग्राम प्रधान'],
      village_info: ['village', 'gram', 'gaav', 'gaanv', 'village information', 'about village', 'ग्राम', 'गाँव'],
      how_to_use: ['how to use', 'app use', 'kaise use', 'help', 'guide', 'tutorial', 'कैसे use', 'guidance', 'instructions'],
      not_understood: ['what', 'who', 'when', 'where', 'why', 'which', 'kya', 'kaun', 'kahan', 'kab', 'kyu']
    }
  },
  hi: {
    topics: {
      greeting: [
        "नमस्ते! मैं आपका स्मार्ट पंचायत AI सहायक हूं। आज मैं आपकी कैसे मदद कर सकता हूं?",
        "नमस्ते! स्मार्ट पंचायत में आपका स्वागत है। मैं शिकायतों, योजनाओं, गांव की जानकारी और बहुत कुछ में मदद कर सकता हूं। आप क्या जानना चाहते हैं?"
      ],
      complaint_filing: [
        "शिकायत दर्ज करने के लिए:\n1. डैशबोर्ड पर जाएं\n2. 'शिकायत दर्ज करें' पर टैप करें\n3. श्रेणी चुनें (सड़क, पानी, बिजली, आदि)\n4. शीर्षक, विवरण, स्थान भरें\n5. फोटो जोड़ें अगर उपलब्ध हो\n6. जमा करें!\n\nआपकी शिकायत कार्रवाई के लिए सरपंच को भेजी जाएगी।"
      ],
      complaint_status: [
        "अपनी शिकायत की स्थिति जांचने के लिए:\n1. डैशबोर्ड से 'मेरी शिकायतें' पर जाएं\n2. आप सभी अपनी शिकायतें स्थिति के साथ देखेंगे\n3. स्थिति हो सकती है: लंबित (लाल), प्रगति में (नारंगी), हल किया (हरा)\n4. पूरा टाइमलाइन देखने के लिए किसी भी शिकायत पर टैप करें"
      ],
      schemes_info: [
        "सरकारी योजनाओं की जानकारी:\n\n• PM-KISAN: छोटे किसानों को ₹6,000/वर्ष\n• आयुष्मान भारत: ₹5 लाख स्वास्थ्य बीमा\n• PM आवास योजना: घर निर्माण के लिए वित्तीय सहायता\n• MNREGA: 100 दिन गारंटीड रोजगार\n\nएप में 'योजनाएं' सेक्शन देखें।"
      ],
      directory_info: [
        "ग्राम डायरेक्टरी में संपर्क जानकारी है:\n• डॉक्टर - स्वास्थ्य केंद्र संपर्क\n• शिक्षक - स्कूल संकाय\n• इलेक्ट्रीशियन - बिजली की मरम्मत\n• प्लंबर - पानी/पाइपलाइन समस्याएं\n\n'ग्राम डायरेक्टरी' पर जाएं।"
      ],
      how_to_use: [
        "स्मार्ट पंचायत ऐप कैसे उपयोग करें:\n\n👤 नागरिकों के लिए:\n• गांव की समस्याओं की शिकायत दर्ज करें\n• शिकायत की स्थिति ट्रैक करें\n• सरकारी योजनाएं ब्राउज़ करें\n\n🏘️ सरपंच के लिए:\n• सभी गांव की शिकायतें देखें\n• शिकायत स्थिति अपडेट करें"
      ],
      not_understood: [
        "मैं पंचायत से संबंधित सवालों में मदद के लिए यहां हूं। मैं इनके बारे में जवाब दे सकता हूं:\n• शिकायत दर्ज करना और ट्रैक करना\n• सरकारी योजनाएं (PM-KISAN, आयुष्मान, आदि)\n• ग्राम डायरेक्टरी संपर्क\n• घोषणा जानकारी\n\nहिंदी या अंग्रेजी में पूछें!",
        "मैं आपका पंचायत सहायक हूं। मैं समझा सकता हूं:\n• शिकायत कैसे दर्ज करें\n• आपकी शिकायतों की स्थिति\n• सरकारी योजना विवरण\n\nकृपया इन विषयों पर पूछें!"
      ]
    }
  }
};

// Auto-detect language from message
const detectLanguage = (message) => {
  // Check for Hindi/Indian script characters
  const hindiRegex = /[ऀ-ॿ]/;
  const hindiWords = ['क्या', 'कैसे', 'कहाँ', 'कौन', 'क्यों', 'नमस्ते', 'नमस्कार', 'शिकायत', 'योजना', 'ग्राम', 'गाँव', 'पंचायत', 'सरपंच', 'हिंदी', 'भारतीय'];

  if (hindiRegex.test(message) || hindiWords.some(w => message.toLowerCase().includes(w))) {
    return 'hi';
  }
  return 'en';
};

// Classify message into topic
const classifyMessage = (message, lang) => {
  const lowerMsg = message.toLowerCase();
  const kb = KNOWLEDGE_BASE[lang] || KNOWLEDGE_BASE.en;

  // Check greeting first
  if (kb.keywords.greeting.some(w => lowerMsg.includes(w))) {
    return 'greeting';
  }

  // Check each topic's keywords
  for (const [topic, keywords] of Object.entries(kb.keywords)) {
    if (keywords.some(w => lowerMsg.includes(w))) {
      return topic;
    }
  }

  return 'not_understood';
};

// Get response for topic
const getResponse = (topic, lang) => {
  const kb = KNOWLEDGE_BASE[lang] || KNOWLEDGE_BASE.en;
  const responses = kb.topics[topic] || kb.topics.not_understood;
  return responses[Math.floor(Math.random() * responses.length)];
};

// @desc    AI Chatbot - Answer queries in any language
// @route   POST /api/chatbot
// @access  Private
exports.chat = async (req, res) => {
  try {
    const { message, language } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    // Auto-detect language - supports any Indian language
    const detectedLang = detectLanguage(message);
    const effectiveLang = language || detectedLang;

    // Classify and get response
    const topic = classifyMessage(message, effectiveLang);
    let response = getResponse(topic, effectiveLang);

    // If we have OpenAI API key, try to use it for better responses
    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key') {
      try {
        const systemPrompt = `You are a helpful Smart Panchayat AI Assistant for rural India. You help citizens with:
- Filing and tracking complaints about village issues (roads, water, electricity, sanitation, etc.)
- Government schemes information (PM-KISAN, Ayushman Bharat, PM Awas Yojana, MGNREGA, etc.)
- Village services and directory information
- Panchayat governance and procedures
- Emergency contacts and urgent matters

Keep answers concise, clear, and helpful. Respond in the same language the user uses.`;

        const aiResponse = await axios.post(
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
            },
            timeout: 10000
          }
        );

        response = aiResponse.data.choices[0].message.content;
      } catch (openaiError) {
        // OpenAI failed, use local response (already set above)
      }
    }

    res.status(200).json({
      success: true,
      data: {
        message: response,
        language: effectiveLang,
        detected: detectedLang !== effectiveLang
      }
    });
  } catch (error) {
    console.error('Chatbot error:', error.message);

    // Final fallback
    const fallbackLang = detectLanguage(req.body.message || '');
    const topic = classifyMessage(req.body.message || '', fallbackLang);
    const fallbackResponse = getResponse(topic, fallbackLang);

    res.status(200).json({
      success: true,
      data: {
        message: fallbackResponse,
        language: fallbackLang
      }
    });
  }
};

// @desc    Get common questions
// @route   GET /api/chatbot/faq
// @access  Public
exports.getFAQ = async (req, res) => {
  try {
    const lang = detectLanguage(req.query.lang || '');

    const faqEn = [
      { question: 'How do I submit a complaint?', answer: 'Go to the Complaints section, tap "New Complaint", fill in the details, add photos, and submit.' },
      { question: 'How can I check government schemes?', answer: 'Visit the Schemes section to browse all available government schemes with eligibility criteria.' },
      { question: 'How do I track my complaint status?', answer: 'Go to "My Complaints" to see the current status and timeline of all your complaints.' },
      { question: 'Who can I contact in emergency?', answer: 'Use the Emergency section for quick access to Ambulance (108), Police (100), and Fire (101).' }
    ];

    const faqHi = [
      { question: 'मैं शिकायत कैसे दर्ज करूं?', answer: 'शिकायत अनुभाग में जाएं, "नई शिकायत" पर टैप करें, विवरण भरें, फोटो जोड़ें और सबमिट करें।' },
      { question: 'मैं सरकारी योजनाएं कैसे देख सकता हूं?', answer: 'योजना अनुभाग में जाएं और पात्रता मानदंड के साथ सभी उपलब्ध सरकारी योजनाएं देखें।' },
      { question: 'मैं अपनी शिकायत की स्थिति कैसे ट्रैक करूं?', answer: '"मेरी शिकायतें" में जाएं और अपनी सभी शिकायतों की वर्तमान स्थिति और समयरेखा देखें।' },
      { question: 'आपातकाल में मैं किससे संपर्क करूं?', answer: 'एम्बुलेंस (108), पुलिस (100), और फायर (101) के लिए आपातकालीन अनुभाग का उपयोग करें।' }
    ];

    res.status(200).json({
      success: true,
      data: lang === 'hi' ? faqHi : faqEn
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};/ /   E m o j i   r e m o v a l   -   C o m m i t   1 5  
 