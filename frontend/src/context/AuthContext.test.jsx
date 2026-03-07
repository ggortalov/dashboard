import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';

// Mock the authService module
vi.mock('../services/authService', () => ({
  default: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    getMe: vi.fn(),
    uploadAvatar: vi.fn(),
  },
}));

// Mock the api module
vi.mock('../services/api', () => ({
  default: {},
  getToken: vi.fn(() => null),
  clearAuth: vi.fn(),
}));

import authService from '../services/authService';
import { getToken, clearAuth } from '../services/api';

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
  });

  describe('useAuth', () => {
    it('throws when used outside AuthProvider', () => {
      // Suppress React error boundary output
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      expect(() => {
        renderHook(() => useAuth());
      }).toThrow('useAuth must be used within AuthProvider');
      consoleSpy.mockRestore();
    });
  });

  describe('AuthProvider', () => {
    it('provides isAuthenticated=false initially when no token', async () => {
      getToken.mockReturnValue(null);

      function TestComponent() {
        const { isAuthenticated } = useAuth();
        return <div>{isAuthenticated ? 'authenticated' : 'not-authenticated'}</div>;
      }

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('not-authenticated')).toBeInTheDocument();
      });
    });

    it('provides loading=true initially then false after mount', async () => {
      getToken.mockReturnValue(null);

      const loadingStates = [];

      function TestComponent() {
        const { loading } = useAuth();
        loadingStates.push(loading);
        return <div>{loading ? 'loading' : 'loaded'}</div>;
      }

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('loaded')).toBeInTheDocument();
      });

      // The first render should have captured loading=true,
      // and a subsequent render should have loading=false
      expect(loadingStates[0]).toBe(true);
      expect(loadingStates[loadingStates.length - 1]).toBe(false);
    });
  });
});
