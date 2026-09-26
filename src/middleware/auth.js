// Protect JSON API routes (require logged-in user)
export function requireApiLogin(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }
  return res.status(401).json({ error: 'Unauthorized: Login required' });
}

// Protect EJS page routes (redirect to login if unauthenticated)
export function requirePageLogin(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }
  return res.redirect('/login');
}

// Protect JSON API routes by specific role
export function requireApiRole(roleName) {
  return (req, res, next) => {
    if (!req.session || !req.session.user) {
      return res.status(401).json({ error: 'Unauthorized: Login required' });
    }
    if (req.session.user.role !== roleName) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }
    return next();
  };
}

// Protect EJS page routes by specific role
export function requirePageRole(roleName) {
  return (req, res, next) => {
    if (!req.session || !req.session.user) {
      return res.redirect('/login');
    }
    if (req.session.user.role !== roleName) {
      return res.status(403).send('Forbidden: Access denied');
    }
    return next();
  };
}