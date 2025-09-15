import { renderHook, act } from '@testing-library/react';
import { AuthProvider, useAuth } from './useAuth';

const mockSignIn = jest.fn().mockResolvedValue({ error: null });
const mockSignUp = jest.fn().mockResolvedValue({ error: null });
const mockSignOut = jest.fn().mockResolvedValue({});
const mockGetSession = jest.fn().mockResolvedValue({ data: { session: null } });
let authChangeCallback: any;
const mockOnAuthStateChange = jest.fn((cb: any) => {
  authChangeCallback = cb;
  return { data: { subscription: { unsubscribe: jest.fn() } } };
});

jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      signInWithPassword: (...args: any[]) => mockSignIn(...args),
      signUp: (...args: any[]) => mockSignUp(...args),
      signOut: (...args: any[]) => mockSignOut(...args),
      getSession: (...args: any[]) => mockGetSession(...args),
      onAuthStateChange: (...args: any[]) => mockOnAuthStateChange(...args),
    },
  },
}));

describe('useAuth', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('signIn updates user on auth change', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.signIn('test@example.com', 'pass');
    });

    expect(mockSignIn).toHaveBeenCalledWith({ email: 'test@example.com', password: 'pass' });

    act(() => {
      authChangeCallback('SIGNED_IN', { user: { id: '123' } } as any);
    });

    expect(result.current.user).toEqual({ id: '123' } as any);
  });

  it('signOut clears user on auth change', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      authChangeCallback('SIGNED_IN', { user: { id: '1' } } as any);
    });

    expect(result.current.user).toEqual({ id: '1' } as any);

    await act(async () => {
      await result.current.signOut();
    });

    expect(mockSignOut).toHaveBeenCalled();

    act(() => {
      authChangeCallback('SIGNED_OUT', null);
    });

    expect(result.current.user).toBeNull();
  });

  it('signUp forwards display name', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.signUp('test@example.com', 'pass', 'Tester');
    });

    expect(mockSignUp).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'pass',
      options: {
        emailRedirectTo: expect.any(String),
        data: { display_name: 'Tester' },
      },
    });
  });
});
