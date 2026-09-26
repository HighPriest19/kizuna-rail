import mongoose from 'mongoose';
import { userSchema } from './schemas/users.js';

export const User = mongoose.models.User || mongoose.model('User', userSchema);