const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// IMPORTANT: Use same DB name as in .env
const MONGO_URI = 'mongodb://localhost:27017/smart-panchayat';

const resetAllUsers = async () => {
  try {
    console.log('Connecting to:', MONGO_URI);
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const hashedPassword = await bcrypt.hash('password123', 10);

    // Delete all existing users
    await mongoose.connection.db.collection('users').deleteMany({});
    console.log('🗑️  Deleted all existing users');

    // Create fresh users
    const users = [
      {
        name: 'Ramesh Sarpanch',
        email: 'sarpanch@demo.com',
        phone: '9876543001',
        password: hashedPassword,
        village: 'Smart Panchayat Village',
        district: 'Rural District',
        state: 'Maharashtra',
        role: 'sarpanch',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Priya Citizen',
        email: 'citizen@demo.com',
        phone: '9876543002',
        password: hashedPassword,
        village: 'Smart Panchayat Village',
        district: 'Rural District',
        state: 'Maharashtra',
        role: 'citizen',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Govt Officer Admin',
        email: 'govt@demo.com',
        phone: '9876543005',
        password: hashedPassword,
        village: 'All India',
        district: 'Delhi',
        state: 'Delhi',
        role: 'govt',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await mongoose.connection.db.collection('users').insertMany(users);
    console.log('✅ Created 3 users');

    // Verify
    const allUsers = await mongoose.connection.db.collection('users').find({}).toArray();
    console.log('\n📋 All Users in Database:');
    allUsers.forEach(u => {
      console.log(`   ${u.role}: ${u.email} (password: password123)`);
    });

    console.log('\n========================================');
    console.log('LOGIN CREDENTIALS (use these exactly):');
    console.log('========================================');
    console.log('CITIZEN:  citizen@demo.com / password123');
    console.log('SARPANCH: sarpanch@demo.com / password123');
    console.log('GOVT:     govt@demo.com / password123');
    console.log('========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

resetAllUsers();