import mongoose from 'mongoose';
import 'dotenv/config';
import TripSchema from './schemas/trips.js';

const Trip = mongoose.model('Trip', TripSchema);

const sampleTrips = [
  {
    id: 'trip-101',
    title: 'Tokyo to Kyoto Alpine Express',
    description: 'A scenic train route through the Mount Fuji region with ocean vistas.',
    originStationId: 'stn-tokyo',
    destinationStationId: 'stn-kyoto',
    duration: '2h 15m',
    featured: true
  },
  {
    id: 'trip-102',
    title: 'Hokkaido Coastal Line',
    description: 'Travel along northern coastal shores with breathtaking snowy mountains.',
    originStationId: 'stn-hakodate',
    destinationStationId: 'stn-sapporo',
    duration: '3h 40m',
    featured: false
  }
];

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.DATABASE_URL;
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB for seeding...');

    await Trip.deleteMany({});
    await Trip.insertMany(sampleTrips);

    console.log('Successfully seeded trips data!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDB();