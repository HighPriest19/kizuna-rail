import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import app from '../../src/app.js';
import bcrypt from 'bcrypt';
import { User } from '../../src/models/User.js';
import Trip from '../../src/models/Trip.js';

vi.mock('bcrypt', () => ({
    default: { compare: vi.fn() }
}));

vi.mock('../../src/models/User.js', () => ({
    User: { findOne: vi.fn() }
}));

vi.mock('../../src/models/Trip.js', () => ({
    default: {
        create: vi.fn(),
        findByIdAndUpdate: vi.fn(),
        findByIdAndDelete: vi.fn()
    }
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
    beforeEach(() => {
        User.findOne.mockReset();
        bcrypt.compare.mockReset();
        Trip.create.mockReset();
        Trip.findByIdAndUpdate.mockReset();
        Trip.findByIdAndDelete.mockReset();
    });

    it('creates a trip for an authenticated admin', async () => {
        const admin = await loginAs('admin');
        Trip.create.mockResolvedValue(trip);

        const response = await admin
            .post('/api/trips')
            .send({ ...trip, ignored: 'not persisted' });

        expect(response.status).toBe(201);
        expect(response.body.trip).toMatchObject({ name: trip.name, region: trip.region });
        expect(Trip.create).toHaveBeenCalledWith(expect.not.objectContaining({ ignored: 'not persisted' }));
    });

    it('updates a trip for an authenticated admin', async () => {
        const admin = await loginAs('admin');
        const updatedTrip = { ...trip, name: 'Updated Coastal Breeze' };
        Trip.findByIdAndUpdate.mockResolvedValue(updatedTrip);

        const response = await admin
            .put(`/api/trips/${trip._id}`)
            .send({ name: updatedTrip.name });

        expect(response.status).toBe(200);
        expect(response.body.trip.name).toBe(updatedTrip.name);
        expect(Trip.findByIdAndUpdate).toHaveBeenCalledWith(
            trip._id,
            { $set: { name: updatedTrip.name } },
            { new: true, runValidators: true }
        );
    });

    it('deletes a trip for an authenticated admin', async () => {
        const admin = await loginAs('admin');
        Trip.findByIdAndDelete.mockResolvedValue(trip);

        const response = await admin.delete(`/api/trips/${trip._id}`);

        expect(response.status).toBe(204);
        expect(Trip.findByIdAndDelete).toHaveBeenCalledWith(trip._id);
    });

    it('rejects write requests without an authenticated session', async () => {
        const response = await request(app).post('/api/trips').send(trip);

        expect(response.status).toBe(401);
    });

    it('rejects write requests from a non-admin user', async () => {
        const user = await loginAs('user');
        const response = await user.post('/api/trips').send(trip);

        expect(response.status).toBe(403);
    });
});
