require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const User = require('./models/User');

const users = [
  { name: 'Alice Citizen',    email: 'citizen@demo.com',   password: 'Demo@1234', role: 'citizen' },
  { name: 'Bob Admin',        email: 'admin@demo.com',     password: 'Demo@1234', role: 'admin' },
  { name: 'Carol Maintenance',email: 'maintenance@demo.com',password: 'Demo@1234', role: 'maintenance_staff' },
  { name: 'Dave Organizer',   email: 'organizer@demo.com', password: 'Demo@1234', role: 'event_organizer' },
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  for (const u of users) {
    const exists = await User.findOne({ email: u.email });
    if (!exists) await User.create(u);
  }
  console.log('✅ Seed complete');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
