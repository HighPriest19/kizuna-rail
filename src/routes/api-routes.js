import express from 'express';
import tripsController from '../controllers/trips.js';
import scheduleController from '../controllers/schedules.js';

const router = express.Router();

/**
 * @swagger
 * /api/trips:
 *   get:
 *     summary: Retrieve all trips
 *     responses:
 *       200:
 *         description: A list of trips
 */
router.get('/api/trips', tripsController.getAllTrips);

/**
 * @swagger
 * /api/trips/{id}:
 *   get:
 *     summary: Get a trip by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Trip details
 *       404:
 *         description: Trip not found
 */
router.get('/api/trips/:id', tripsController.getTripById);

router.get('/api/trips/:id/schedules', scheduleController.getSchedulesByTripId);

export default router;