import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import ProtectedRoute from './ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';

jest.mock('@/hooks/useAuth');
const mockedUseAuth = useAuth as jest.Mock;

describe('ProtectedRoute', () => {
  it('shows loader when loading', () => {
    mockedUseAuth.mockReturnValue({ user: null, loading: true });
    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>secret</div>
        </ProtectedRoute>
      </MemoryRouter>
    );
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('redirects to auth when no user', () => {
    mockedUseAuth.mockReturnValue({ user: null, loading: false });
    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route path="/protected" element={<ProtectedRoute><div>secret</div></ProtectedRoute>} />
          <Route path="/auth" element={<div>auth page</div>} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText('auth page')).toBeInTheDocument();
    expect(screen.queryByText('secret')).toBeNull();
  });

  it('renders children when user exists', () => {
    mockedUseAuth.mockReturnValue({ user: { id: '1' }, loading: false });
    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>secret</div>
        </ProtectedRoute>
      </MemoryRouter>
    );
    expect(screen.getByText('secret')).toBeInTheDocument();
  });
});
