import mongoose from 'mongoose';

const tripSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  originStationId: {
    type: String,
    required: true
  },
  destinationStationId: {
    type: String,
    required: true
  },
  duration: {
    type: String,
    required: true
  },
  featured: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

export default tripSchema;