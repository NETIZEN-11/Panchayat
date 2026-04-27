const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./src/models/User');
const bcrypt = require('bcryptjs');

dotenv.config();

const createUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/smartpanchayat');
    console.log('Connected to MongoDB');

    // Clear existing users
    await User.deleteMany({});
    console.log('Cleared existing users');

    const commonVillage = 'Smart Panchayat Village';
    const commonDistrict = 'Rural District';
    const hashedPassword = await bcrypt.hash('password123', 10);

    const users = [
      {
        name: 'Ramesh Sarpanch',
        email: 'sarpanch@demo.com',
        phone: '9876543001',
        password: hashedPassword,
        village: commonVillage,
        district: commonDistrict,
        state: 'Maharashtra',
        role: 'sarpanch'
      },
      {
        name: 'Priya Citizen',
        email: 'citizen@demo.com',
        phone: '9876543002',
        password: hashedPassword,
        village: commonVillage,
        district: commonDistrict,
        state: 'Maharashtra',
        role: 'citizen'
      },
      {
        name: 'Amit Kumar',
        email: 'amit@demo.com',
        phone: '9876543003',
        password: hashedPassword,
        village: commonVillage,
        district: commonDistrict,
        state: 'Maharashtra',
        role: 'citizen'
      },
      {
        name: 'Sunita Verma',
        email: 'sunita@demo.com',
        phone: '9876543004',
        password: hashedPassword,
        village: commonVillage,
        district: commonDistrict,
        state: 'Maharashtra',
        role: 'citizen'
      },
      {
        name: 'Govt Officer Admin',
        email: 'govt@demo.com',
        phone: '9876543005',
        password: hashedPassword,
        village: 'Ministry HQ',
        district: 'Delhi',
        state: 'Delhi',
        role: 'govt'
      }
    ];

    await User.insertMany(users);

    console.log('\n✅ Users created successfully!');
    console.log('\nLogin credentials:');
    console.log('─'.repeat(40));
    console.log('SARPANCH: sarpanch@demo.com / password123');
    console.log('CITIZEN:  citizen@demo.com / password123');
    console.log('GOVT:     govt@demo.com / password123');
    console.log('─'.repeat(40));
    console.log(`\nAll users have village: "${commonVillage}"`);
    console.log('This ensures complaints raised by citizens are visible to the sarpanch.');

    process.exit(0);
  } catch (error) {
    console.error('Error creating users:', error);
    process.exit(1);
  }
};

createUsers();