import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import { getAllRoutes } from '../../src/models/model.js';
import app from '../../src/app.js';

vi.mock('../../src/models/model.js', () => ({
    getAllRoutes: vi.fn(),
    getListOfRegions: vi.fn(),
    getListOfSeasons: vi.fn()
}));

const trips = [
    {
        id: 'trip-1',
        name: 'Coastal Breeze',
        description: 'A scenic journey along the coast.',
        region: 'Coastal',
        bestSeason: 'Summer'
    },
    {
        id: 'trip-2',
        name: 'Alpine Panorama',
        description: 'A mountain journey through alpine valleys.',
        region: 'Mountain',
        bestSeason: 'Winter'
    }
];

describe('GET /api/trips', () => {
    beforeEach(() => {
        getAllRoutes.mockResolvedValue(trips);
    });

    it('returns a list of trips with their expected fields', async () => {
        const response = await request(app).get('/api/trips');

        expect(response.status).toBe(200);
        expect(response.body.trips).toHaveLength(2);
        expect(response.body.trips[0]).toMatchObject({
            id: 'trip-1',
            name: 'Coastal Breeze',
            region: 'Coastal',
            bestSeason: 'Summer'
        });
        expect(response.body.metadata).toMatchObject({
            totalItems: 2,
            currentPage: 1,
            totalPages: 1,
            itemsPerPage: 10
        });
    });
});
