const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Directory = require('./src/models/Directory');
const Complaint = require('./src/models/Complaint');
const User = require('./src/models/User');

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smartpanchayat');
    console.log('Connected to MongoDB');

    // Find a citizen and sarpanch to use as reference
    const citizen = await User.findOne({ role: 'citizen' });
    const sarpanch = await User.findOne({ role: 'sarpanch' });

    if (!citizen || !sarpanch) {
      console.log('Please create at least one citizen and one sarpanch user first');
      console.log('Run: node seedUsers.js first');
      process.exit(1);
    }

    const citizenVillage = citizen.village || 'Demo Village';
    const sarpanchVillage = sarpanch.village || 'Demo Village';

    console.log(`Citizen village: ${citizenVillage}`);
    console.log(`Sarpanch village: ${sarpanchVillage}`);

    // Clear existing data
    await Directory.deleteMany({});
    await Complaint.deleteMany({});
    console.log('Cleared existing data');

    // Seed Directory entries with SARPANCH's village
    const directoryEntries = [
      {
        name: 'Dr. Ramesh Kumar',
        category: 'doctor',
        phone: '9876543210',
        specialization: 'General Physician',
        address: 'Primary Health Center, Main Road',
        village: sarpanchVillage,
        availability: '9 AM - 5 PM, Monday to Saturday',
        isVerified: true,
        rating: 4.5,
        addedBy: sarpanch._id
      },
      {
        name: 'Rajesh Electrician',
        category: 'electrician',
        phone: '9876543211',
        address: 'Near Bus Stand',
        village: sarpanchVillage,
        availability: '8 AM - 8 PM, All days',
        isVerified: true,
        rating: 4.2,
        addedBy: sarpanch._id
      },
      {
        name: 'Suresh Plumber',
        category: 'plumber',
        phone: '9876543212',
        address: 'Block Road',
        village: sarpanchVillage,
        availability: '7 AM - 7 PM',
        isVerified: true,
        rating: 4.0,
        addedBy: sarpanch._id
      },
      {
        name: 'Gopal Singh',
        category: 'teacher',
        phone: '9876543213',
        specialization: 'Mathematics & Science',
        address: 'Government Primary School',
        village: sarpanchVillage,
        availability: 'School Hours, Monday to Friday',
        isVerified: true,
        rating: 4.8,
        addedBy: sarpanch._id
      },
      {
        name: 'Village Ration Shop',
        category: 'shop',
        phone: '9876543214',
        shopType: 'Ration Shop',
        address: 'Village Center',
        village: sarpanchVillage,
        availability: '8 AM - 8 PM, All days',
        isVerified: true,
        rating: 3.8,
        addedBy: sarpanch._id
      },
      {
        name: 'Mukesh Kumar',
        category: 'worker',
        phone: '9876543215',
        workType: 'Mason',
        address: 'Near Temple',
        village: sarpanchVillage,
        availability: '6 AM - 6 PM',
        isVerified: true,
        rating: 4.1,
        addedBy: sarpanch._id
      },
      {
        name: 'Lakshmi Medical Store',
        category: 'shop',
        phone: '9876543216',
        shopType: 'Medical Store',
        address: 'Main Market',
        village: sarpanchVillage,
        availability: '24 Hours',
        isVerified: true,
        rating: 4.6,
        addedBy: sarpanch._id
      }
    ];

    await Directory.insertMany(directoryEntries);
    console.log(`Inserted ${directoryEntries.length} directory entries for village: ${sarpanchVillage}`);

    // Seed Complaints with SARPANCH's village
    const complaints = [
      {
        userId: citizen._id,
        title: 'Road pothole near school gate',
        description: 'There is a big pothole near the government school gate which is causing accidents. Children are finding it difficult to go to school safely.',
        category: 'Road',
        location: 'Near Government School, Main Road',
        village: sarpanchVillage,
        district: citizen.district || 'General',
        status: 'Pending',
        priority: 'High',
        images: [],
        timeline: [{ status: 'Pending', notes: 'Complaint submitted by citizen', updatedAt: new Date() }]
      },
      {
        userId: citizen._id,
        title: 'Water supply disruption',
        description: 'Water supply has been disrupted for 3 days. People are facing severe water shortage especially in the summer season.',
        category: 'Water',
        location: 'Chawl Area, Block B',
        village: sarpanchVillage,
        district: citizen.district || 'General',
        status: 'In Progress',
        priority: 'Urgent',
        images: [],
        timeline: [
          { status: 'Pending', notes: 'Complaint submitted', updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
          { status: 'In Progress', notes: 'Worker dispatched to check the pipeline', updatedAt: new Date() }
        ]
      },
      {
        userId: citizen._id,
        title: 'Street light not working',
        description: 'Street light at the main intersection has not been working for a week. It is very dark at night and there are safety concerns.',
        category: 'Street Light',
        location: 'Main Chowk, Near Temple',
        village: sarpanchVillage,
        district: citizen.district || 'General',
        status: 'Pending',
        priority: 'Medium',
        images: [],
        timeline: [{ status: 'Pending', notes: 'Complaint submitted', updatedAt: new Date() }]
      }
    ];

    await Complaint.insertMany(complaints);
    console.log(`Inserted ${complaints.length} sample complaints for village: ${sarpanchVillage}`);

    console.log('\n✅ Seeding completed successfully!');
    console.log(`Village used: "${sarpanchVillage}"`);
    console.log('\nNote: Make sure citizens also use the same village name: "${sarpanchVillage}"');
    console.log('When a citizen raises a complaint, they should use village: "' + sarpanchVillage + '"');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();