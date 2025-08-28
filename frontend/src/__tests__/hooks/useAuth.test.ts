import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useAuth, AuthProvider } from '../../contexts/AuthContext';

// Mock the API
jest.mock('../../services/api', () => ({
  defaults: { headers: { common: {} } },
  post: jest.fn(),
  get: jest.fn(),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
};

describe('useAuth Hook', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('should initialize with no user', () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  test('should load user from localStorage on init', () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      first_name: 'Test',
      last_name: 'User',
      full_name: 'Test User'
    };
    const mockToken = 'mock-token';

    localStorage.setItem('user', JSON.stringify(mockUser));
    localStorage.setItem('token', mockToken);

    const wrapper = createWrapper();
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.token).toBe(mockToken);
  });

  test('should handle invalid JSON in localStorage', () => {
    localStorage.setItem('user', 'invalid-json');
    localStorage.setItem('token', 'mock-token');

    const wrapper = createWrapper();
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
  });

  test('should clear user and token on logout', () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      first_name: 'Test',
      last_name: 'User',
      full_name: 'Test User'
    };

    localStorage.setItem('user', JSON.stringify(mockUser));
    localStorage.setItem('token', 'mock-token');

    const wrapper = createWrapper();
    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
    expect(localStorage.getItem('token')).toBeNull();
  });

  test('should provide login and register functions', () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(typeof result.current.login).toBe('function');
    expect(typeof result.current.register).toBe('function');
    expect(typeof result.current.logout).toBe('function');
  });
});
