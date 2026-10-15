import { getAllRoutes, getListOfRegions, getListOfSeasons, getRouteById } from '../models/model.js';
import Trip from '../models/Trip.js';

const MAX_ITEMS_PER_PAGE = 100;
const TRIP_FIELDS = [
    'name',
    'description',
    'region',
    'startStation',
    'endStation',
    'duration',
    'distance',
    'highlights',
    'bestSeason',
    'operatingMonths',
    'imageUrl'
];

const getTripFields = (body) => Object.fromEntries(
    TRIP_FIELDS
        .filter(field => Object.hasOwn(body ?? {}, field))
        .map(field => [field, body[field]])
);

const handleTripWriteError = (error, res, next) => {
    if (error.name === 'ValidationError' || error.name === 'CastError') {
        return res.status(400).json({ error: error.message });
    }
    return next(error);
};

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

const parseChoiceFilter = (value, parameter, choices) => {
    if (value === undefined) {
        return { value: null };
    }
    if (typeof value !== 'string') {
        return { error: `${parameter} must be a single value.` };
    }

    const normalizedValue = value.trim();
    if (!normalizedValue || normalizedValue.toLowerCase() === 'all') {
        return { value: null };
    }

    const matchingChoice = choices.find(choice => choice.toLowerCase() === normalizedValue.toLowerCase());
    return matchingChoice
        ? { value: matchingChoice }
        : { error: `${parameter} must be one of: ${choices.join(', ')}.` };
};

const parseKeywordFilter = (value) => {
    if (value === undefined) {
        return { value: null };
    }
    if (typeof value !== 'string') {
        return { error: 'keyword must be a single value.' };
    }

    const keyword = value.trim();
    if (keyword.length > 100) {
        return { error: 'keyword must be 100 characters or fewer.' };
    }
    return { value: keyword || null };
};

export const tripsPage = async (req, res) => {
    const [regions, seasons] = await Promise.all([getListOfRegions(), getListOfSeasons()]);
    const regionQuery = typeof req.query.region === 'string' ? req.query.region.toLowerCase() : '';
    const seasonQuery = typeof req.query.season === 'string' ? req.query.season.toLowerCase() : '';

    res.render('trips/list', {
        title: 'Scenic Train Trips',
        regions,
        seasons,
        selectedRegion: regions.find(region => region.toLowerCase() === regionQuery) || '',
        selectedSeason: seasons.find(season => season.toLowerCase() === seasonQuery) || '',
        keyword: typeof req.query.keyword === 'string' ? req.query.keyword : ''
    });
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

    const allTrips = await getAllRoutes();
    const regionResult = parseChoiceFilter(req.query.region, 'region', [...new Set(allTrips.map(trip => trip.region))]);
    const seasonResult = parseChoiceFilter(req.query.season, 'season', [...new Set(allTrips.map(trip => trip.bestSeason))]);
    const keywordResult = parseKeywordFilter(req.query.search ?? req.query.keyword);

    for (const [parameter, result] of [
        ['region', regionResult],
        ['season', seasonResult],
        ['keyword', keywordResult]
    ]) {
        if (result.error) {
            details.push({ parameter, message: result.error });
        }
    }

    if (details.length > 0) {
        return res.status(400).json({ error: 'Invalid query parameters.', details });
    }

    const page = pageResult.value;
    const limit = limitResult.value;
    const { value: region } = regionResult;
    const { value: season } = seasonResult;
    const { value: keyword } = keywordResult;
    const normalizedKeyword = keyword?.toLowerCase();
    const filteredTrips = allTrips.filter(trip => {
        if (region && trip.region.toLowerCase() !== region.toLowerCase()) return false;
        if (season && trip.bestSeason.toLowerCase() !== season.toLowerCase()) return false;
        if (normalizedKeyword && ![trip.name, trip.description].some(value => value.toLowerCase().includes(normalizedKeyword))) {
            return false;
        }
        return true;
    });
    const totalItems = filteredTrips.length;
    const totalPages = Math.ceil(totalItems / limit);
    const startIndex = (page - 1) * limit;

    return res.json({
        trips: filteredTrips.slice(startIndex, startIndex + limit),
        metadata: {
            totalItems,
            currentPage: page,
            totalPages,
            itemsPerPage: limit,
            filters: { region, season, keyword }
        }
    });
};

export const getTripApi = async (req, res) => {
    const trip = await getRouteById(req.params.id);
    if (!trip) {
        return res.status(404).json({ error: 'Trip not found.' });
    }
    return res.status(200).json({ trip });
};

export const createTrip = async (req, res, next) => {
    try {
        const trip = await Trip.create(getTripFields(req.body));
        return res.status(201).json({ trip });
    } catch (error) {
        return handleTripWriteError(error, res, next);
    }
};

export const updateTrip = async (req, res, next) => {
    try {
        const trip = await Trip.findByIdAndUpdate(
            req.params.id,
            { $set: getTripFields(req.body) },
            { new: true, runValidators: true }
        );
        if (!trip) {
            return res.status(404).json({ error: 'Trip not found.' });
        }
        return res.status(200).json({ trip });
    } catch (error) {
        return handleTripWriteError(error, res, next);
    }
};

export const deleteTrip = async (req, res, next) => {
    try {
        const trip = await Trip.findByIdAndDelete(req.params.id);
        if (!trip) {
            return res.status(404).json({ error: 'Trip not found.' });
        }
        return res.status(204).end();
    } catch (error) {
        return handleTripWriteError(error, res, next);
    }
};