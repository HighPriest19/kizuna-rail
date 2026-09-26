import bcrypt from 'bcrypt';
import { User } from '../models/users.js';
import { Role } from '../models/roles.js';

const sessionUser = (user, role) => ({
  id: String(user._id),
  username: user.username,
  email: user.email,
  role
});

const prefersHtml = (req) => req.accepts('html');

function regenerateSession(req, user) {
  return new Promise((resolve, reject) => {
    req.session.regenerate((error) => {
      if (error) return reject(error);
      req.session.user = user;
      req.session.save((saveError) => saveError ? reject(saveError) : resolve());
    });
  });
}

function renderAuthError(req, res, view, title, message, status = 400) {
  if (!prefersHtml(req)) return res.status(status).json({ error: message });
  return res.status(status).render(view, { title, error: message });
}

export async function registerUser(req, res, next) {
  try {
    const username = String(req.body.username || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    const displayName = String(req.body.displayName || '').trim();

    if (!username || !email || !password) {
      return renderAuthError(req, res, 'register', 'Register', 'Username, email, and password are required.');
    }
    if (password.length < 8) {
      return renderAuthError(req, res, 'register', 'Register', 'Password must be at least 8 characters long.');
    }

    const role = await Role.findOne({ name: 'user' });
    if (!role) {
      return renderAuthError(req, res, 'register', 'Register', 'Registration is temporarily unavailable. Please try again later.', 503);
    }

    const user = await User.create({
      username,
      email,
      password: await bcrypt.hash(password, 12),
      displayName: displayName || undefined,
      role: role._id
    });
    const payload = sessionUser(user, 'user');

    if (req.session) await regenerateSession(req, payload);
    if (prefersHtml(req)) return res.redirect('/');
    return res.status(201).json({ message: 'Registration successful', user: payload });
  } catch (error) {
    if (error.code === 11000) {
      return renderAuthError(req, res, 'register', 'Register', 'That username or email is already registered.', 409);
    }
    return next(error);
  }
}

export async function loginUser(req, res, next) {
  try {
    const username = String(req.body.username || '').trim();
    const password = String(req.body.password || '');
    if (!username || !password) {
      return renderAuthError(req, res, 'login', 'Login', 'Username and password are required.');
    }

    const user = await User.findOne({ username }).populate('role');
    const isValid = user && user.role && await bcrypt.compare(password, user.password);
    if (!isValid) {
      return renderAuthError(req, res, 'login', 'Login', 'Invalid username or password.', 401);
    }

    const payload = sessionUser(user, user.role.name);
    if (req.session) await regenerateSession(req, payload);
    if (prefersHtml(req)) return res.redirect('/');
    return res.status(200).json({ message: 'Login successful', user: payload });
  } catch (error) {
    return next(error);
  }
}

export function logoutUser(req, res, next) {
  if (!req.session) {
    if (prefersHtml(req)) return res.redirect('/login');
    return res.status(200).json({ message: 'Logged out successfully' });
  }

  req.session.destroy((error) => {
    if (error) return next(error);
    res.clearCookie('connect.sid', { httpOnly: true, sameSite: 'lax' });
    if (prefersHtml(req)) return res.redirect('/login');
    return res.status(200).json({ message: 'Logged out successfully' });
  });
}
