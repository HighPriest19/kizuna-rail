import { describe, expect, it, vi } from 'vitest';
import {
  requireApiLogin,
  requireApiRole,
  requirePageLogin,
  requirePageRole
} from '../../src/middleware/auth.js';

function mockResponse() {
  const res = {
    status: vi.fn(),
    json: vi.fn(),
    redirect: vi.fn(),
    render: vi.fn()
  };
  res.status.mockReturnValue(res);
  return res;
}

describe('authentication middleware', () => {
  it('returns the specified JSON error for unauthenticated API login', () => {
    const res = mockResponse();

    requireApiLogin({}, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
  });

  it('redirects unauthenticated page login to the login form', () => {
    const res = mockResponse();

    requirePageLogin({}, res, vi.fn());

    expect(res.redirect).toHaveBeenCalledWith('/login');
  });

  it('returns 401 for an unauthenticated API role check', () => {
    const res = mockResponse();

    requireApiRole('admin')({}, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
  });

  it('returns 403 JSON when an authenticated API user has the wrong role', () => {
    const res = mockResponse();

    requireApiRole('admin')({ session: { user: { role: 'user' } } }, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'Forbidden' });
  });

  it('renders a 403 page when an authenticated page user has the wrong role', () => {
    const res = mockResponse();

    requirePageRole('admin')({ session: { user: { role: 'user' } } }, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.render).toHaveBeenCalledWith('errors/403', expect.objectContaining({
      title: 'Forbidden'
    }));
  });

  it('passes authenticated users with the required role to the next handler', () => {
    const next = vi.fn();
    const res = mockResponse();

    requireApiRole('admin')({ session: { user: { role: 'admin' } } }, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(res.status).not.toHaveBeenCalled();
  });
});
