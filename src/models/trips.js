import mongoose from 'mongoose';
import tripSchema from './schemas/trips.js';

const Trip = mongoose.models.Trip || mongoose.model('Trip', tripSchema);

const getAllTrips = async () => {
  return await Trip.find({});
};

const getTripById = async (id) => {
  return await Trip.findOne({ id: id });
};

export default {
  getAllTrips,
  getTripById
};