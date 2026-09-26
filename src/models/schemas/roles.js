import { Schema } from 'mongoose';

export const roleSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    enum: ['user', 'admin']
  },
  description: String
});