import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import App from './App';
import { usePlanningPoker } from '../hooks/usePlanningPoker';

// Mock the hook
jest.mock('../hooks/usePlanningPoker');

// Mock Card component to avoid animation issues
jest.mock(
  '../components/Card',
  () =>
    ({ value, onSelect, isSelected, disabled }) => (
      <button
        onClick={() => !disabled && onSelect(value)}
        disabled={disabled}
        data-testid={`card-${value}`}
        className={isSelected ? 'selected' : ''}
      >
        {value}
      </button>
    ),
);

const mockActions = {
  selectVote: jest.fn(),
  startTimer: jest.fn(),
  deleteVotes: jest.fn(),
  closeRoom: jest.fn(),
  revealVotes: jest.fn(),
};

describe('App View', () => {
  beforeEach(() => {
    usePlanningPoker.mockReturnValue({
      participants: [],
      room: { slug: 'test-room', open: true, deckType: 'fibonacci' },
      owner: 'other-user',
      timer: null,
      isRevealed: false,
      error: null,
      actions: mockActions,
    });
    sessionStorage.clear();
  });

  test('renders join screen when not joined', () => {
    render(
      <MemoryRouter initialEntries={['/test-room']}>
        <Routes>
          <Route path="/:slug" element={<App />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Join Room')).toBeInTheDocument();
  });

  test('joins room and shows game board', () => {
    render(
      <MemoryRouter initialEntries={['/test-room']}>
        <Routes>
          <Route path="/:slug" element={<App />} />
        </Routes>
      </MemoryRouter>,
    );

    const input = screen.getByPlaceholderText('Enter your name');
    fireEvent.change(input, { target: { value: 'User 1' } });
    fireEvent.click(screen.getByText('Join Session'));

    expect(screen.getByText('test-room')).toBeInTheDocument();
    expect(sessionStorage.getItem('userName')).toBe('User 1');
  });

  test('shows owner controls when owner', () => {
    sessionStorage.setItem('userName', 'Owner');
    usePlanningPoker.mockReturnValue({
      participants: [],
      room: { slug: 'test-room', open: true },
      owner: 'Owner',
      timer: null,
      isRevealed: false,
      error: null,
      actions: mockActions,
    });

    render(
      <MemoryRouter initialEntries={['/test-room']}>
        <Routes>
          <Route path="/:slug" element={<App />} />
        </Routes>
      </MemoryRouter>,
    );

    // Join automatically if sessionStorage set?
    // Logic: const [userName, setUserName] = useState(sessionStorage.getItem('userName') || '');
    // const [isJoined, setIsJoined] = useState(!!sessionStorage.getItem('userName'));

    expect(screen.getByText('Reveal Cards')).toBeInTheDocument();
    expect(screen.getByText('Timer (3s)')).toBeInTheDocument();
    expect(screen.getByText('Reset')).toBeInTheDocument();
  });

  test('handles voting', () => {
    sessionStorage.setItem('userName', 'User 1');
    usePlanningPoker.mockReturnValue({
      participants: [],
      room: { slug: 'test-room', open: true, deckType: 'fibonacci' },
      owner: 'Owner',
      timer: null,
      isRevealed: false,
      error: null,
      actions: mockActions,
    });

    render(
      <MemoryRouter initialEntries={['/test-room']}>
        <Routes>
          <Route path="/:slug" element={<App />} />
        </Routes>
      </MemoryRouter>,
    );

    const card = screen.getByTestId('card-5');
    fireEvent.click(card);

    expect(mockActions.selectVote).toHaveBeenCalledWith(5);
  });

  test('displays average when revealed', () => {
    sessionStorage.setItem('userName', 'User 1');
    usePlanningPoker.mockReturnValue({
      participants: [
        { name: 'User 1', vote: 5, hasVoted: true },
        { name: 'User 2', vote: 8, hasVoted: true },
      ],
      room: { slug: 'test-room', open: true },
      owner: 'Owner',
      timer: null,
      isRevealed: true,
      error: null,
      actions: mockActions,
    });

    render(
      <MemoryRouter initialEntries={['/test-room']}>
        <Routes>
          <Route path="/:slug" element={<App />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Average')).toBeInTheDocument();
    expect(screen.getByText('6.5')).toBeInTheDocument();
  });
});
