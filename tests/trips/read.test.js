import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import { getAllRoutes, getRouteById } from '../../src/models/model.js';
import app from '../../src/app.js';

vi.mock('../../src/models/model.js', () => ({
    getAllRoutes: vi.fn(),
    getRouteById: vi.fn(),
    getListOfRegions: vi.fn(),
    getListOfSeasons: vi.fn()
}));

const trips = [
    {
        id: 'coastal-breeze',
        name: 'Coastal Breeze Line',
        description: 'Follow the scenic coastline of the Sea of Japan with ocean views and sunset vistas.',
        region: 'northern',
        startStation: 'aomori',
        endStation: 'akita',
        duration: '5 hours',
        distance: 147,
        highlights: ['Sea of Japan coastline', 'Senjojiki Rock Beach', 'Traditional fishing villages'],
        bestSeason: 'summer',
        operatingMonths: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
        imageUrl: '/images/routes/coastal-breeze.png'
    },
    {
        id: 'alpine-panorama',
        name: 'Alpine Panorama Express',
        description: 'Journey through the Japanese Alps with stunning mountain views and traditional villages.',
        region: 'central',
        startStation: 'nagoya',
        endStation: 'toyama',
        duration: '4.5 hours',
        distance: 180,
        highlights: ['Mount Tateyama views', 'Hida River gorge', 'Traditional alpine villages'],
        bestSeason: 'autumn',
        operatingMonths: [4, 5, 6, 7, 8, 9, 10, 11],
        imageUrl: '/images/routes/alpine-panorama.png'
    }
];

describe('Trip read endpoints', () => {
    beforeEach(() => {
        getAllRoutes.mockResolvedValue(trips);
        getRouteById.mockReset();
    });

    it('GET /api/trips returns 200 with an array of all trips', async () => {
        const response = await request(app).get('/api/trips');

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body.trips)).toBe(true);
        expect(response.body.trips).toEqual(trips);
    });

    it('GET /api/trips/:id returns 200 with a valid seeded trip', async () => {
        const seededTrip = trips[0];
        getRouteById.mockResolvedValue(seededTrip);

        const response = await request(app).get(`/api/trips/${seededTrip.id}`);

        expect(response.status).toBe(200);
        expect(response.body.trip).toEqual(seededTrip);
        expect(getRouteById).toHaveBeenCalledWith(seededTrip.id);
    });

    it('GET /api/trips/:id returns 404 when the trip does not exist', async () => {
        const missingTripId = '507f1f77bcf86cd799439011';
        getRouteById.mockResolvedValue(null);

        const response = await request(app).get(`/api/trips/${missingTripId}`);

        expect(response.status).toBe(404);
        expect(response.body).toEqual({ error: 'Trip not found.' });
        expect(getRouteById).toHaveBeenCalledWith(missingTripId);
    });
});
