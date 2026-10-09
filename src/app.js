import express from 'express';
import session from 'express-session';
import { randomBytes } from 'crypto';
import 'dotenv/config';
import globalMiddleware from './middleware/global.js';
import Path from 'path';
import routes from './routes/router.js';
import pkg from '../package.json' with { type: 'json' };
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = Path.dirname(__filename);
const SESSION_SECRET = process.env.SESSION_SECRET || randomBytes(32).toString('hex');

if (!process.env.SESSION_SECRET) {
    console.warn('SESSION_SECRET is unset; sessions will be invalidated when the server restarts.');
}

const app = express();

app.use((req, res, next) => {
    res.locals.appVersion = pkg.version;
    next();
});

app.use(express.static(Path.join(__dirname, '../public')));
app.set('view engine', 'ejs');
app.set('views', Path.join(__dirname, 'views'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(session({
    name: 'connect.sid',
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.SESSION_COOKIE_SECURE === 'true',
        maxAge: 1000 * 60 * 60 * 24
    }
}));

app.use(globalMiddleware);
app.use('/', routes);

app.use((req, res, next) => {
    const err = new Error('Page Not Found');
    err.status = 404;
    next(err);
});

app.use((err, req, res, next) => {
    const status = err.status || 500;
    const template = status === 404 ? '404' : '500';
    const context = {
        title: status === 404 ? 'Page Not Found' : 'Server Error',
        error: err.message,
        stack: err.stack
    };

    res.status(status).render(`errors/${template}`, context);
});

export default app;
