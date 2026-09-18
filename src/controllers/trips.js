import tripModel from '../models/trips.js';

// API: Get all trips
const getAllTrips = async (req, res) => {
  try {
    const trips = await tripModel.getAllTrips();
    res.status(200).json(trips);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// API: Get trip by ID
const getTripById = async (req, res) => {
  try {
    const trip = await tripModel.getTripById(req.params.id);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    res.status(200).json(trip);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// EJS View: Render trips list page
const renderTripsListPage = async (req, res) => {
  try {
    return res.render('trips/list', { title: 'Scenic Rail Trips' });
  } catch (error) {
    return res.status(500).render('500', { title: 'Server Error' });
  }
};

// EJS View: Render trip details page
const renderTripDetailsPage = async (req, res) => {
  try {
    const trip = await tripModel.getTripById(req.params.id);
    if (!trip) {
      return res.status(404).render('404', { title: 'Trip Not Found' });
    }
    res.render('trips/details', { title: trip.title, trip });
  } catch (error) {
    res.status(500).render('500', { title: 'Server Error' });
  }
};

export default {
  getAllTrips,
  getTripById,
  renderTripsListPage,
  renderTripDetailsPage
};