import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';
import { GameProvider } from './services/GameContext';
import { SocketProvider } from './services/SocketProvider';

// Mock the navigate function
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

const customRender = (ui, options) => {
  return render(
    <GameProvider>
      <SocketProvider>
        {ui}
      </SocketProvider>
    </GameProvider>,
    options
  );
};

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    customRender(<App />);
  });

  describe('Login Page', () => {
    it('renders login page by default', () => {
      customRender(<App />);
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });

    it('displays the Spotify login button', () => {
      customRender(<App />);
      expect(screen.getByText('Login with Spotify')).toBeInTheDocument();
    });

    it('displays the AnimatedLogo component', () => {
      customRender(<App />);
      const logo = screen.getByTestId('animated-logo');
      expect(logo).toBeInTheDocument();
      expect(logo).toHaveAttribute('alt', 'Aux Wars Logo');
    });

    it('displays the guest login button', () => {
      customRender(<App />);
      expect(screen.getByText('Play As Guest')).toBeInTheDocument();
    });

    it('displays the how to play link', () => {
      customRender(<App />);
      expect(screen.getByText('How to play')).toBeInTheDocument();
    });
  });
}); 