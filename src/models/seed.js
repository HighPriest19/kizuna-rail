import mongoose from 'mongoose';
import 'dotenv/config';
import trainSchema from './schemas/trains.js';
import tripSchema from './schemas/trips.js';

const rawTrainSchema = trainSchema.schema || trainSchema;
const rawTripSchema = tripSchema.schema || tripSchema;

const Train = mongoose.models.Train || mongoose.model('Train', rawTrainSchema);
const Trip = mongoose.models.Trip || mongoose.model('Trip', rawTripSchema);

const sampleTrains = [
  {
    id: 'trn-101',
    name: 'Shinkansen N700S',
    type: 'Bullet Train',
    capacity: 1323,
    status: 'Active',
    operator: 'JR Central',
    maxSpeedKmh: 300,
    powerSource: 'Electric Overhead'
  },
  {
    id: 'trn-102',
    name: 'Limited Express Odakyu',
    type: 'Express',
    capacity: 450,
    status: 'Active',
    operator: 'Odakyu Electric Railway',
    maxSpeedKmh: 110,
    powerSource: 'Electric Overhead'
  }
];

const sampleTrips = [
  {
    id: 'trip-101',
    title: 'Tokyo to Kyoto Express',
    description: 'A scenic train route through Mount Fuji region.',
    originStationId: 'stn-tokyo',
    destinationStationId: 'stn-kyoto',
    duration: '2h 15m',
    featured: true
  },
  {
    id: 'trip-102',
    title: 'Hokkaido Coastal Line',
    description: 'Travel along northern coastal shores.',
    originStationId: 'stn-hakodate',
    destinationStationId: 'stn-sapporo',
    duration: '3h 40m',
    featured: false
  }
];

const sampleSchedules = [
  {
    id: 'sched-trip-101-jan',
    tripId: 'trip-101',
    departureTime: '08:00',
    arrivalTime: '10:45',
    operatingMonths: [1, 3, 5, 7, 9, 11],
    daysOfWeek: ['Monday', 'Wednesday', 'Friday'],
    status: true
  },
  {
    id: 'sched-trip-101-mar',
    tripId: 'trip-101',
    departureTime: '12:30',
    arrivalTime: '15:15',
    operatingMonths: [2, 4, 6, 8, 10, 12],
    daysOfWeek: ['Tuesday', 'Thursday', 'Saturday'],
    status: true
  },
  {
    id: 'sched-trip-102-feb',
    tripId: 'trip-102',
    departureTime: '09:15',
    arrivalTime: '13:05',
    operatingMonths: [2, 5, 7, 9, 11],
    daysOfWeek: ['Tuesday', 'Thursday', 'Sunday'],
    status: true
  },
  {
    id: 'sched-trip-102-jul',
    tripId: 'trip-102',
    departureTime: '15:00',
    arrivalTime: '18:40',
    operatingMonths: [3, 6, 8, 10, 12],
    daysOfWeek: ['Monday', 'Wednesday', 'Saturday'],
    status: true
  }
];

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.DATABASE_URL;
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB for seeding...');

    await Train.deleteMany({});
    await Train.insertMany(sampleTrains);
    console.log('Seeded Trains collection.');

    await Trip.deleteMany({});
    await Trip.insertMany(sampleTrips);
    console.log('Seeded Trips collection.');

    const Schedule = mongoose.models.Schedule || mongoose.model('Schedule', new mongoose.Schema({
      id: { type: String, required: true, unique: true },
      tripId: { type: String, required: true },
      departureTime: { type: String, required: true },
      arrivalTime: { type: String, required: true },
      operatingMonths: { type: [Number], default: [] },
      daysOfWeek: { type: [String], default: [] },
      status: { type: Boolean, default: true }
    }, { timestamps: true }));

    await Schedule.deleteMany({});
    await Schedule.insertMany(sampleSchedules);
    console.log('Seeded Schedules collection.');

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDB();