import mongoose from 'mongoose';

const scheduleSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  tripId: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  departureTime: {
    type: String,
    required: true,
    trim: true
  },
  arrivalTime: {
    type: String,
    required: true,
    trim: true
  },
  operatingMonths: {
    type: [Number],
    default: [],
    validate: {
      validator: (months) => months.every((month) => month >= 1 && month <= 12),
      message: 'Each operating month must be between 1 and 12.'
    }
  },
  daysOfWeek: {
    type: [String],
    default: []
  },
  status: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

export default scheduleSchema;
