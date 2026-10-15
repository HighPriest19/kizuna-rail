import mongoose from 'mongoose';
import { roleSchema } from './schemas/roles.js';

export const Role = mongoose.models.Role || mongoose.model('Role', roleSchema);

export async function seedRoles() {
  const standardRoles = [
    { name: 'user', description: 'Standard registered user' },
    { name: 'admin', description: 'Administrator with elevated privileges' }
  ];

  for (const role of standardRoles) {
    await Role.updateOne(
      { name: role.name },
      { $setOnInsert: role },
      { upsert: true }
    );
  }
}