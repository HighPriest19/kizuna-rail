import express from 'express';
import tripsController from '../controllers/trips.js';
import trainsController from '../controllers/trains.js';

const router = express.Router();

router.get('/trips', tripsController.renderTripsListPage);
router.get('/trips/:id', tripsController.renderTripDetailsPage);
router.get('/trains', trainsController.renderTrainListPage);

export default router;