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
        name: 'Winter Wetlands',
        description: 'A quiet winter trip through coastal wetlands.',
        region: 'Coastal',
        bestSeason: 'Winter'
    },
    {
        id: 'trip-3',
        name: 'Alpine Panorama',
        description: 'A mountain journey through alpine valleys.',
        region: 'Mountain',
        bestSeason: 'Summer'
    }
];

describe('GET /api/trips pagination and search', () => {
    beforeEach(() => {
        getAllRoutes.mockResolvedValue(trips);
    });

    it('applies page, limit, region, season, and search filters with metadata', async () => {
        const response = await request(app)
            .get('/api/trips')
            .query({ page: 1, limit: 1, region: 'Coastal', season: 'Summer', search: 'breeze' });

        expect(response.status).toBe(200);
        expect(response.body.trips).toHaveLength(1);
        expect(response.body.trips[0].id).toBe('trip-1');
        expect(response.body.metadata).toMatchObject({
            totalItems: 1,
            totalPages: 1,
            currentPage: 1,
            itemsPerPage: 1,
            filters: { region: 'Coastal', season: 'Summer', keyword: 'breeze' }
        });
    });

    it('returns an empty list and zero pages when filters match no trips', async () => {
        const response = await request(app)
            .get('/api/trips')
            .query({ search: 'no matching trip' });

        expect(response.status).toBe(200);
        expect(response.body.trips).toEqual([]);
        expect(response.body.metadata).toMatchObject({
            totalItems: 0,
            totalPages: 0,
            currentPage: 1
        });
    });

    it('returns fewer than the page limit when the requested page is partially filled', async () => {
        const response = await request(app)
            .get('/api/trips')
            .query({ page: 2, limit: 2 });

        expect(response.status).toBe(200);
        expect(response.body.trips.map(trip => trip.id)).toEqual(['trip-3']);
        expect(response.body.metadata).toMatchObject({
            totalItems: 3,
            totalPages: 2,
            currentPage: 2,
            itemsPerPage: 2
        });
    });
});
