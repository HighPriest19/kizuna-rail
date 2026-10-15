// Protect JSON API routes (require logged-in user)
export function requireApiLogin(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }
  return res.status(401).json({ error: 'Unauthorized' });
}

// Protect EJS page routes (redirect to login if unauthenticated)
export function requirePageLogin(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }
  return res.redirect('/login');
}

// Protect JSON API routes by specific role
export function requireApiRole(role) {
  return (req, res, next) => {
    if (!req.session || !req.session.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (req.session.user.role !== role) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    return next();
  };
}

// Protect EJS page routes by specific role
export function requirePageRole(role) {
  return (req, res, next) => {
    if (!req.session || !req.session.user) {
      return res.redirect('/login');
    }
    if (req.session.user.role !== role) {
      return res.status(403).render('errors/403', {
        title: 'Forbidden',
        error: 'You do not have permission to access this page.'
      });
    }
    return next();
  };
}