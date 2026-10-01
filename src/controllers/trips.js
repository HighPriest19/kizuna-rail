import { getAllRoutes } from '../models/model.js';

const MAX_ITEMS_PER_PAGE = 100;

const parsePositiveInteger = (value, parameter, defaultValue, maximum = Number.MAX_SAFE_INTEGER) => {
    if (value === undefined) {
        return { value: defaultValue };
    }

    if (typeof value !== 'string' || !/^\d+$/.test(value)) {
        return { error: `${parameter} must be a positive integer.` };
    }

    const parsedValue = Number(value);
    if (!Number.isSafeInteger(parsedValue) || parsedValue < 1 || parsedValue > maximum) {
        const maximumMessage = maximum === Number.MAX_SAFE_INTEGER
            ? 'a safe positive integer'
            : `between 1 and ${maximum}`;
        return { error: `${parameter} must be ${maximumMessage}.` };
    }

    return { value: parsedValue };
};

export const tripsPage = (req, res) => {
    res.render('trips/list', { title: 'Scenic Train Trips' });
};

export const tripsApi = async (req, res) => {
    const pageResult = parsePositiveInteger(req.query.page, 'page', 1);
    const limitResult = parsePositiveInteger(req.query.limit, 'limit', 10, MAX_ITEMS_PER_PAGE);
    const details = [];

    if (pageResult.error) {
        details.push({ parameter: 'page', message: pageResult.error });
    }
    if (limitResult.error) {
        details.push({ parameter: 'limit', message: limitResult.error });
    }
    if (details.length > 0) {
        return res.status(400).json({ error: 'Invalid pagination parameters.', details });
    }

    const page = pageResult.value;
    const limit = limitResult.value;
    const allTrips = await getAllRoutes();
    const totalItems = allTrips.length;
    const totalPages = Math.ceil(totalItems / limit);
    const startIndex = (page - 1) * limit;

    return res.json({
        trips: allTrips.slice(startIndex, startIndex + limit),
        metadata: {
            totalItems,
            currentPage: page,
            totalPages,
            itemsPerPage: limit
        }
    });
};