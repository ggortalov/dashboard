import { describe, it, expect, beforeEach } from 'vitest';
import api, { getToken, clearAuth } from './api';

describe('api module', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  describe('axios instance', () => {
    it('has correct baseURL', () => {
      expect(api.defaults.baseURL).toBe('http://localhost:5001/api');
    });
  });

  describe('getToken', () => {
    it('returns localStorage token when present', () => {
      localStorage.setItem('token', 'local-token-123');
      expect(getToken()).toBe('local-token-123');
    });

    it('returns sessionStorage token when localStorage is empty', () => {
      sessionStorage.setItem('token', 'session-token-456');
      expect(getToken()).toBe('session-token-456');
    });

    it('returns null when both storages are empty', () => {
      expect(getToken()).toBeNull();
    });

    it('prefers localStorage over sessionStorage', () => {
      localStorage.setItem('token', 'local-token');
      sessionStorage.setItem('token', 'session-token');
      expect(getToken()).toBe('local-token');
    });
  });

  describe('clearAuth', () => {
    it('removes token and user from both storages', () => {
      localStorage.setItem('token', 'tok');
      localStorage.setItem('user', '{"id":1}');
      sessionStorage.setItem('token', 'tok2');
      sessionStorage.setItem('user', '{"id":2}');

      clearAuth();

      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
      expect(sessionStorage.getItem('token')).toBeNull();
      expect(sessionStorage.getItem('user')).toBeNull();
    });
  });
});
