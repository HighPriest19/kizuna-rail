import { Schema } from 'mongoose';

export const userSchema = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true, select: false },
  displayName: { type: String, trim: true },
  role: {
    type: Schema.Types.ObjectId,
    ref: 'Role',
    required: true
  }
}, { timestamps: true });