import express from 'express';
import tripsController from '../controllers/trips.js';
import trainsController from '../controllers/trains.js';
import { loginUser, logoutUser, registerUser } from '../controllers/auth.js';
import { requirePageRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/trips', tripsController.renderTripsListPage);
router.get('/trips/:id', tripsController.renderTripDetailsPage);
router.get('/trains', trainsController.renderTrainListPage);
router.get('/register', (req, res) => res.render('register', { title: 'Register' }));
router.post('/register', registerUser);
router.get('/login', (req, res) => res.render('login', { title: 'Login' }));
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/admin', requirePageRole('admin'), (req, res) => {
	res.render('admin', { title: 'Admin Dashboard', user: req.session.user });
});

export default router;