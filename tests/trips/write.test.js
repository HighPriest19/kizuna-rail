import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import app from '../../src/app.js';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { User } from '../../src/models/User.js';
import Trip from '../../src/models/Trip.js';

vi.mock('bcrypt', () => ({
    default: { compare: vi.fn() }
}));

vi.mock('../../src/models/User.js', () => ({
    User: { findOne: vi.fn() }
}));

const trip = {
    _id: '507f1f77bcf86cd799439011',
    name: 'Coastal Breeze',
    description: 'A scenic coastal journey.',
    region: 'northern',
    startStation: 'aomori',
    endStation: 'akita',
    duration: '5 hours',
    distance: 147,
    highlights: ['Coastline views'],
    bestSeason: 'summer',
    operatingMonths: [6, 7, 8]
};

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri(), { dbName: 'kizuna-rail-write-tests' });
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

const loginAs = async (role) => {
    const agent = request.agent(app);
    const user = {
        _id: '507f1f77bcf86cd799439012',
        username: role,
        email: `${role}@example.com`,
        passwordHash: 'hashed-password',
        role: { name: role }
    };
    const query = {
        select: vi.fn().mockReturnThis(),
        populate: vi.fn().mockResolvedValue(user)
    };
    User.findOne.mockReturnValue(query);
    bcrypt.compare.mockResolvedValue(true);

    const response = await agent
        .post('/login')
        .set('Accept', 'application/json')
        .send({ username: role, password: 'password123' });

    expect(response.status).toBe(200);
    return agent;
};

describe('Trip write endpoints', () => {
    beforeEach(async () => {
        User.findOne.mockReset();
        bcrypt.compare.mockReset();
        await Trip.deleteMany({});
    });

    it('creates a trip for an authenticated admin', async () => {
        const admin = await loginAs('admin');

        const response = await admin
            .post('/api/trips')
            .send({ ...trip, ignored: 'not persisted' });

        expect(response.status).toBe(201);
        expect(response.body.trip).toMatchObject({ name: trip.name, region: trip.region });
        const storedTrip = await Trip.findById(response.body.trip._id);
        expect(storedTrip).toMatchObject({ name: trip.name, region: trip.region });
        expect(storedTrip.toObject()).not.toHaveProperty('ignored');
    });

    it('updates a trip for an authenticated admin', async () => {
        const admin = await loginAs('admin');
        const seededTrip = await Trip.create({ ...trip });
        const updatedName = 'Updated Coastal Breeze';

        const response = await admin
            .put(`/api/trips/${seededTrip._id}`)
            .send({ name: updatedName });

        expect(response.status).toBe(200);
        expect(response.body.trip.name).toBe(updatedName);
        const storedTrip = await Trip.findById(seededTrip._id);
        expect(storedTrip).toMatchObject({ name: updatedName });
    });

    it('deletes a trip for an authenticated admin', async () => {
        const admin = await loginAs('admin');
        const seededTrip = await Trip.create({ ...trip });

        const response = await admin.delete(`/api/trips/${seededTrip._id}`);

        expect(response.status).toBe(204);
        expect(await Trip.findById(seededTrip._id)).toBeNull();
    });

    it('rejects write requests without an authenticated session', async () => {
        const response = await request(app).post('/api/trips').send(trip);

        expect(response.status).toBe(401);
        expect(await Trip.findById(trip._id)).toBeNull();
    });

    it('rejects write requests from a non-admin user', async () => {
        const user = await loginAs('user');
        const response = await user.post('/api/trips').send(trip);

        expect(response.status).toBe(403);
        expect(await Trip.findById(trip._id)).toBeNull();
    });
});
