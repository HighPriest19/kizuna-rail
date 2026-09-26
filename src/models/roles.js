import mongoose from 'mongoose';
import { roleSchema } from './schemas/roles.js';

export const Role = mongoose.model('Role', roleSchema);

export async function seedRoles() {
  const roles = [
    { name: 'user', description: 'Standard registered user' },
    { name: 'admin', description: 'Administrator with elevated privileges' }
  ];

  for (const role of roles) {
    await Role.updateOne(
      { name: role.name },
      { $setOnInsert: role },
      { upsert: true }
    );
  }
}