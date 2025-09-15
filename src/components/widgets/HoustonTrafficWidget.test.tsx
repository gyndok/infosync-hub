import { render, screen } from '@testing-library/react';
import { HoustonTrafficWidget } from './HoustonTrafficWidget';
import { useHoustonTraffic } from '@/hooks/useHoustonTraffic';

jest.mock('@/hooks/useHoustonTraffic');
const mockedHook = useHoustonTraffic as jest.Mock;

describe('HoustonTrafficWidget', () => {
  it('renders traffic incidents', () => {
    mockedHook.mockReturnValue({
      trafficIncidents: [{ id: '1', title: 'Accident on I-10', severity: 'high' }],
      metroAlerts: [],
      isLoading: false,
      error: null,
      lastUpdated: new Date(),
      refreshData: jest.fn(),
    });
    render(<HoustonTrafficWidget />);
    expect(screen.getByText('Houston Traffic')).toBeInTheDocument();
    expect(screen.getByText('Accident on I-10')).toBeInTheDocument();
  });

  it('shows error state', () => {
    mockedHook.mockReturnValue({
      trafficIncidents: [],
      metroAlerts: [],
      isLoading: false,
      error: 'Failed to load',
      lastUpdated: null,
      refreshData: jest.fn(),
    });
    render(<HoustonTrafficWidget />);
    expect(screen.getByText(/Unable to load traffic data/i)).toBeInTheDocument();
  });
});
