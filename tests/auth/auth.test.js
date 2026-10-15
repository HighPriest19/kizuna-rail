import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('bcrypt', () => ({
  default: {
    hash: vi.fn(),
    compare: vi.fn()
  }
}));

vi.mock('../../src/models/User.js', () => ({
  User: {
    create: vi.fn(),
    findOne: vi.fn()
  }
}));

vi.mock('../../src/models/roles.js', () => ({
  Role: {
    findOne: vi.fn()
  }
}));

import bcrypt from 'bcrypt';
import { User } from '../../src/models/User.js';
import { Role } from '../../src/models/roles.js';
import { loginUser, logoutUser, registerUser } from '../../src/controllers/auth.js';

function mockResponse() {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    redirect: vi.fn().mockReturnThis(),
    clearCookie: vi.fn()
  };
}

describe('authentication controllers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('hashes a registration password before saving the user', async () => {
    bcrypt.hash.mockResolvedValue('bcrypt-hash');
    Role.findOne.mockResolvedValue({ _id: 'role-id' });
    User.create.mockResolvedValue({
      _id: 'user-id',
      username: 'rail-user',
      email: 'rail@example.com'
    });
    const req = {
      body: {
        username: 'rail-user',
        email: 'RAIL@example.com',
        password: 'password123'
      },
      accepts: () => false
    };
    const res = mockResponse();

    await registerUser(req, res, vi.fn());

    expect(bcrypt.hash).toHaveBeenCalledWith('password123', 12);
    expect(User.create).toHaveBeenCalledWith(expect.objectContaining({
      username: 'rail-user',
      email: 'rail@example.com',
      passwordHash: 'bcrypt-hash',
      role: 'role-id'
    }));
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('verifies a login password and saves the user identity in the session', async () => {
    const user = {
      _id: 'user-id',
      email: 'rail@example.com',
      passwordHash: 'bcrypt-hash',
      role: { name: 'user' }
    };
    const query = {
      select: vi.fn().mockReturnThis(),
      populate: vi.fn().mockResolvedValue(user)
    };
    User.findOne.mockReturnValue(query);
    bcrypt.compare.mockResolvedValue(true);
    const req = {
      body: { username: 'rail-user', password: 'password123' },
      accepts: () => false,
      session: {
        regenerate: (callback) => callback(),
        save: (callback) => callback()
      }
    };
    const res = mockResponse();

    await loginUser(req, res, vi.fn());

    expect(query.select).toHaveBeenCalledWith('+passwordHash');
    expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'bcrypt-hash');
    expect(req.session.user).toMatchObject({
      id: 'user-id',
      email: 'rail@example.com',
      role: 'user'
    });
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('destroys the session and clears the session cookie on logout', () => {
    const req = {
      accepts: () => false,
      session: {
        destroy: (callback) => callback()
      }
    };
    const res = mockResponse();

    logoutUser(req, res, vi.fn());

    expect(res.clearCookie).toHaveBeenCalledWith('connect.sid', expect.objectContaining({
      httpOnly: true,
      sameSite: 'lax'
    }));
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('clears the session cookie when the request has no session', () => {
    const req = { accepts: () => false };
    const res = mockResponse();

    logoutUser(req, res, vi.fn());

    expect(res.clearCookie).toHaveBeenCalledWith('connect.sid', expect.any(Object));
  });
});
