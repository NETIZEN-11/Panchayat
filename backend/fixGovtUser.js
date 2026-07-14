const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./src/models/User');
const bcrypt = require('bcryptjs');

dotenv.config();

const resetGovtUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smartpanchayat');
    console.log('Connected to MongoDB');

    const hashedPassword = await bcrypt.hash('password123', 10);

    // Check if govt user exists
    const existingGovt = await User.findOne({ role: 'govt' });

    if (existingGovt) {
      // Update password
      existingGovt.password = hashedPassword;
      existingGovt.email = 'govt@demo.com';
      existingGovt.name = 'Govt Officer Admin';
      await existingGovt.save();
      console.log('✅ Govt user updated successfully!');
    } else {
      // Create new govt user
      await User.create({
        name: 'Govt Officer Admin',
        email: 'govt@demo.com',
        phone: '9876543005',
        password: hashedPassword,
        village: 'All India',
        district: 'Delhi',
        state: 'Delhi',
        role: 'govt'
      });
      console.log('✅ Govt user created successfully!');
    }

    // Verify
    const govtUser = await User.findOne({ role: 'govt' });
    console.log('\nGovt User Details:');
    console.log('Email:', govtUser.email);
    console.log('Password: password123');
    console.log('Role:', govtUser.role);
    console.log('Village:', govtUser.village);

    // Also create/update citizen and sarpanch
    const existingCitizen = await User.findOne({ role: 'citizen' });
    if (!existingCitizen) {
      await User.create({
        name: 'Priya Citizen',
        email: 'citizen@demo.com',
        phone: '9876543002',
        password: hashedPassword,
        village: 'Smart Panchayat Village',
        district: 'Rural District',
        state: 'Maharashtra',
        role: 'citizen'
      });
      console.log('✅ Citizen user created!');
    }

    const existingSarpanch = await User.findOne({ role: 'sarpanch' });
    if (!existingSarpanch) {
      await User.create({
        name: 'Ramesh Sarpanch',
        email: 'sarpanch@demo.com',
        phone: '9876543001',
        password: hashedPassword,
        village: 'Smart Panchayat Village',
        district: 'Rural District',
        state: 'Maharashtra',
        role: 'sarpanch'
      });
      console.log('✅ Sarpanch user created!');
    }

    console.log('\n========================================');
    console.log('ALL LOGIN CREDENTIALS:');
    console.log('========================================');
    console.log('CITIZEN:  citizen@demo.com / password123');
    console.log('SARPANCH: sarpanch@demo.com / password123');
    console.log('GOVT:     govt@demo.com / password123');
    console.log('========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

resetGovtUser();