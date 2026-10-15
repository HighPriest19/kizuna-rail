import mongoose from 'mongoose';
import 'dotenv/config';
import { seedRoles } from '../src/models/roles.js';

const mongoUri = process.env.MONGODB_URI || process.env.DATABASE_URL;

if (!mongoUri) {
  throw new Error('Set MONGODB_URI or DATABASE_URL before seeding MongoDB roles.');
}

try {
  await mongoose.connect(mongoUri);
  await seedRoles();
  console.log('Ensured the standard user and admin roles exist in MongoDB.');
} catch (error) {
  console.error('Failed to seed MongoDB roles:', error);
  process.exitCode = 1;
} finally {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}
