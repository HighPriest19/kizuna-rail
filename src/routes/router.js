import challengeScenariosRouter from './scenarios.js';
import railRoutesRouter from './routes.js';
import { Router } from 'express';
import { homePage, aboutPage, testErrorPage } from './index.js';
import { loginUser, logoutUser, registerUser } from '../controllers/auth.js';
import { requirePageRole } from '../middleware/auth.js';

const router = Router();

router.get('/register', (req, res) => res.render('register', { title: 'Register' }));
router.post('/register', registerUser);
router.get('/login', (req, res) => res.render('login', { title: 'Login' }));
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/admin', requirePageRole('admin'), (req, res) => {
	res.render('admin', { title: 'Admin Dashboard', user: req.session.user });
});

// Home page
router.get('/', homePage);

// About page
router.get('/about', aboutPage);

// Rail routes
router.use('/routes', railRoutesRouter);

// Challenge scenarios
router.use('/scenarios', challengeScenariosRouter);

// Test 500 error page
router.get('/500', testErrorPage);

export default router;