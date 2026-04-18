require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Inline user schema for seed (since main model is ESM)
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['citizen', 'admin', 'maintenance_staff', 'event_organizer'],
    required: true
  },
  avatar: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

const users = [
  { name: 'Alice Citizen',    email: 'citizen@demo.com',   password: 'Demo@1234', role: 'citizen' },
  { name: 'Bob Admin',        email: 'admin@demo.com',     password: 'Demo@1234', role: 'admin' },
  { name: 'Carol Maintenance',email: 'maintenance@demo.com',password: 'Demo@1234', role: 'maintenance_staff' },
  { name: 'Dave Organizer',   email: 'organizer@demo.com', password: 'Demo@1234', role: 'event_organizer' },
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB');
  for (const u of users) {
    const exists = await User.findOne({ email: u.email });
    if (!exists) {
      await User.create(u);
      console.log(`  Created: ${u.email} (${u.role})`);
    } else {
      console.log(`  Exists:  ${u.email} (${u.role})`);
    }
  }
  console.log('✅ Seed complete');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
