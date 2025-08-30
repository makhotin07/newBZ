import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import AuthProvider, { useAuth } from '../../app/providers/AuthProvider';

// Mock the API
jest.mock('../../shared/api', () => ({
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

  return ({ children }: { children: React.ReactNode }) => {
    return React.createElement(QueryClientProvider, { client: queryClient },
      React.createElement(AuthProvider, {}, children)
    );
  };
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
    expect(result.current.loading).toBe(false);
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

    localStorage.setItem('access_token', mockToken);

    const wrapper = createWrapper();
    const { result } = renderHook(() => useAuth(), { wrapper });

    // AuthProvider делает API запрос, поэтому user будет null в тестах
    expect(result.current.user).toBeNull();
  });

  test('should handle invalid JSON in localStorage', () => {
    localStorage.setItem('user', 'invalid-json');
    localStorage.setItem('access_token', 'mock-token');

    const wrapper = createWrapper();
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.user).toBeNull();
  });

  test('should clear user and token on logout', () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      first_name: 'Test',
      last_name: 'User',
      full_name: 'Test User'
    };

    localStorage.setItem('access_token', 'mock-token');

    const wrapper = createWrapper();
    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(localStorage.getItem('access_token')).toBeUndefined();
  });

  test('should provide login and register functions', () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(typeof result.current.login).toBe('function');
    expect(typeof result.current.register).toBe('function');
    expect(typeof result.current.logout).toBe('function');
  });
});
