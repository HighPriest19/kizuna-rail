import { Schema } from 'mongoose';

export const userSchema = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  displayName: String,
  role: {
    type: Schema.Types.ObjectId,
    ref: 'Role',
    required: true
  }
}, { timestamps: true });