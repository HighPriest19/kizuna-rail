import scheduleModel from '../models/schedules.js';
import tripModel from '../models/trips.js';

const getSchedulesByTripId = async (req, res) => {
  try {
    const { id } = req.params;
    const { month } = req.query;

    const trip = await tripModel.getTripById(id);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    const schedules = await scheduleModel.getSchedulesByTripId(id, month ?? null);
    return res.status(200).json(schedules);
  } catch (error) {
    console.error('Error fetching trip schedules:', error);
    return res.status(500).json({ message: error.message });
  }
};

export default {
  getSchedulesByTripId
};
