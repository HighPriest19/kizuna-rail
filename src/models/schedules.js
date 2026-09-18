import mongoose from 'mongoose';
import scheduleSchema from './schemas/schedules.js';

const Schedule = mongoose.models.Schedule || mongoose.model('Schedule', scheduleSchema);

const fallbackScheduleMap = {
  'trip-101': [
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
    }
  ],
  'trip-102': [
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
  ]
};

const getSchedulesByTripId = async (tripId, month = null) => {
  const query = { tripId };
  const scheduleData = await Schedule.find(query).sort({ departureTime: 1 }).lean();

  if (scheduleData.length > 0) {
    if (month !== null && month !== undefined && month !== '') {
      const monthNumber = Number(month);
      return scheduleData.filter((schedule) =>
        Array.isArray(schedule.operatingMonths)
          ? schedule.operatingMonths.includes(monthNumber)
          : true
      );
    }
    return scheduleData;
  }

  const fallbackSchedules = fallbackScheduleMap[tripId] ?? [];
  if (month !== null && month !== undefined && month !== '') {
    const monthNumber = Number(month);
    return fallbackSchedules.filter((schedule) =>
      Array.isArray(schedule.operatingMonths)
        ? schedule.operatingMonths.includes(monthNumber)
        : true
    );
  }

  return fallbackSchedules;
};

export default {
  getSchedulesByTripId
};
