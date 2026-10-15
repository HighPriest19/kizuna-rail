/**
 * Helper function to set all expected res.locals values
 */
const setLocalVariables = (req, res, next) => {
    // Make NODE_ENV available to all templates
    res.locals.NODE_ENV = process.env.NODE_ENV?.toLowerCase() || 'production';

    // Make any query parameters available to all templates
    res.locals.query = req.query;

    // Make the authenticated user available to shared views
    res.locals.user = req.session?.user;

    next();
};

export default setLocalVariables;