import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import Home from './Home';

// Mock useNavigate
const mockedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
}));

// Mock Framer Motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, ...props }) => (
      <div className={className} {...props}>
        {children}
      </div>
    ),
  },
}));

// Mock Fetch API
global.fetch = jest.fn();

describe('Home Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders create room form', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    );

    expect(screen.getByText('Planning Poker')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('e.g. Sprint 23 Planning'),
    ).toBeInTheDocument();
    expect(screen.getByText('Create Room')).toBeInTheDocument();
  });

  test('shows error when submitting empty form', async () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByText('Create Room'));
    expect(screen.getByText('Please enter a room name.')).toBeInTheDocument();
  });

  test('handles successful room creation', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ slug: 'my-sprint', deckType: 'fibonacci' }),
    });

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    );

    const input = screen.getByPlaceholderText('e.g. Sprint 23 Planning');
    fireEvent.change(input, { target: { value: 'My Sprint' } });

    // Select deck type (optional, default is fibonacci)
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 't-shirt' } });

    fireEvent.click(screen.getByText('Create Room'));

    // Should show loading state
    expect(screen.getByText('Creating...')).toBeInTheDocument();

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/rooms'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ slug: 'my-sprint', deckType: 't-shirt' }),
        }),
      );
      expect(mockedNavigate).toHaveBeenCalledWith('/my-sprint');
    });
  });

  test('handles api error', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Slug already exists' }),
    });

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    );

    const input = screen.getByPlaceholderText('e.g. Sprint 23 Planning');
    fireEvent.change(input, { target: { value: 'Duplicate' } });
    fireEvent.click(screen.getByText('Create Room'));

    await waitFor(() => {
      expect(screen.getByText('Slug already exists')).toBeInTheDocument();
    });
  });
});
