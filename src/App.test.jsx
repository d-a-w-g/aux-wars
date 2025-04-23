import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

describe('App', () => {
  it('renders without crashing', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );
  });

  it('renders login page by default', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );
    // Add more specific tests based on your Login component's content
    expect(screen.getByTestId('login-page')).toBeInTheDocument();
  });
}); 