import dns from 'node:dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);
dns.setDefaultResultOrder('ipv4first');

import mongoose from 'mongoose';
import 'dotenv/config';
import app from './src/app.js';
import Path from 'path';
import { fileURLToPath } from 'url';
import { initializeDatabase } from './src/models/db-in-file.js';
import { seedRoles } from './src/models/roles.js';

const __dirname = Path.dirname(fileURLToPath(import.meta.url));
const NODE_ENV = process.env.NODE_ENV?.toLowerCase() || 'production';
const PORT = process.env.PORT || 3000;
const DATABASE_FILE = Path.join(__dirname, 'src/models/db-in-file.json');
const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL;

if (MONGODB_URI) {
    mongoose.connect(MONGODB_URI)
        .then(async () => {
            console.log('Successfully connected to MongoDB');
            await seedRoles();
            console.log('Ensured default user roles exist');
        })
        .catch((err) => console.error('MongoDB connection error:', err));
} else {
    console.error('Missing MONGODB_URI in .env file; authentication requires MongoDB.');
}

initializeDatabase(DATABASE_FILE);

if (NODE_ENV.includes('dev')) {
    const ws = await import('ws');

    try {
        const wsPort = parseInt(PORT) + 1;
        const wsServer = new ws.WebSocketServer({ port: wsPort });

        wsServer.on('listening', () => {
            console.log(`WebSocket server is running on port ${wsPort}`);
        });

        wsServer.on('error', (error) => {
            console.error('WebSocket server error:', error);
        });
    } catch (error) {
        console.error('Failed to start WebSocket server:', error);
    }
}

app.listen(PORT, async () => {
    console.log(`Server is running on http://127.0.0.1:${PORT}`);
});
