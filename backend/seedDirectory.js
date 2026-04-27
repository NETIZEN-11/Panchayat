const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Directory = require('./src/models/Directory');
const User = require('./src/models/User');

dotenv.config();

const seedDirectory = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/smartpanchayat');
    console.log('Connected to MongoDB');

    // Clear existing directory entries
    await Directory.deleteMany({});
    console.log('Cleared existing directory entries');

    // Get a sarpanch user to use as addedBy
    const sarpanch = await User.findOne({ role: 'sarpanch' });
    const addedById = sarpanch ? sarpanch._id : null;

    const directoryEntries = [
      {
        name: 'Dr. Ramesh Kumar',
        category: 'doctor',
        phone: '9876543210',
        specialization: 'General Physician',
        address: 'Primary Health Center, Main Road',
        village: 'Sample Village',
        availability: '9 AM - 5 PM, Monday to Saturday',
        isVerified: true,
        rating: 4.5,
        addedBy: addedById
      },
      {
        name: 'Rajesh Electrician',
        category: 'electrician',
        phone: '9876543211',
        address: 'Near Bus Stand',
        village: 'Sample Village',
        availability: '8 AM - 8 PM, All days',
        isVerified: true,
        rating: 4.2,
        addedBy: addedById
      },
      {
        name: 'Suresh Plumber',
        category: 'plumber',
        phone: '9876543212',
        address: 'Block Road',
        village: 'Sample Village',
        availability: '7 AM - 7 PM',
        isVerified: true,
        rating: 4.0,
        addedBy: addedById
      },
      {
        name: 'Gopal Singh',
        category: 'teacher',
        phone: '9876543213',
        specialization: 'Mathematics & Science',
        address: 'Government Primary School',
        village: 'Sample Village',
        availability: 'School Hours, Monday to Friday',
        isVerified: true,
        rating: 4.8,
        addedBy: addedById
      },
      {
        name: 'Ration Shop',
        category: 'shop',
        phone: '9876543214',
        shopType: 'Ration Shop',
        address: 'Village Center',
        village: 'Sample Village',
        availability: '8 AM - 8 PM, All days',
        isVerified: true,
        rating: 3.8,
        addedBy: addedById
      },
      {
        name: 'Mukesh Kumar',
        category: 'worker',
        phone: '9876543215',
        workType: 'Mason',
        address: 'Near Temple',
        village: 'Sample Village',
        availability: '6 AM - 6 PM',
        isVerified: true,
        rating: 4.1,
        addedBy: addedById
      },
      {
        name: 'Lakshmi Medical Store',
        category: 'shop',
        phone: '9876543216',
        shopType: 'Medical Store',
        address: 'Main Market',
        village: 'Sample Village',
        availability: '24 Hours',
        isVerified: true,
        rating: 4.6,
        addedBy: addedById
      },
      {
        name: 'Ajay Sharma',
        category: 'teacher',
        phone: '9876543217',
        specialization: 'Hindi & English',
        address: 'Government High School',
        village: 'Sample Village',
        availability: 'School Hours',
        isVerified: true,
        rating: 4.3,
        addedBy: addedById
      }
    ];

    await Directory.insertMany(directoryEntries);
    console.log(`Inserted ${directoryEntries.length} directory entries`);

    console.log('Seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding directory:', error);
    process.exit(1);
  }
};

seedDirectory();