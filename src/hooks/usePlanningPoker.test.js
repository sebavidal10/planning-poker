import { renderHook, act } from '@testing-library/react';
import { usePlanningPoker } from '../hooks/usePlanningPoker';
import { io } from 'socket.io-client';

// Mock socket.io-client
jest.mock('socket.io-client');

describe('usePlanningPoker Hook', () => {
  let mockSocket;
  let mockEmit;
  let mockOn;
  let mockClose;

  beforeEach(() => {
    mockEmit = jest.fn();
    mockOn = jest.fn();
    mockClose = jest.fn();

    mockSocket = {
      emit: mockEmit,
      on: mockOn,
      close: mockClose,
      connected: true,
    };

    io.mockReturnValue(mockSocket);

    // Mock fetch for initial room details
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            room: { slug: 'test-room', open: true, deckType: 'fibonacci' },
            participants: [],
            owner: 'owner-user',
          }),
      }),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('initializes socket connection on mount', async () => {
    const { result } = renderHook(() => usePlanningPoker('test-room', 'user1'));

    expect(io).toHaveBeenCalled();
    // Wait for useEffect
    await act(async () => {});

    // Check initial emit join
    // The socket.on('connect', callback) is where join happens.
    // We need to simulate 'connect' event.
    const connectCallback = mockOn.mock.calls.find(
      (call) => call[0] === 'connect',
    )[1];
    act(() => {
      connectCallback();
    });

    expect(mockEmit).toHaveBeenCalledWith('join', {
      name: 'user1',
      votingInstanceName: 'test-room',
    });
  });

  it('handles updateParticipants event', async () => {
    const { result } = renderHook(() => usePlanningPoker('test-room', 'user1'));
    await act(async () => {});

    const updateCallback = mockOn.mock.calls.find(
      (call) => call[0] === 'updateParticipants',
    )[1];

    act(() => {
      updateCallback({
        participants: [{ name: 'user1', hasVoted: false }],
        owner: 'user1',
      });
    });

    expect(result.current.participants).toHaveLength(1);
    expect(result.current.owner).toBe('user1');
  });

  it('selects vote', async () => {
    const { result } = renderHook(() => usePlanningPoker('test-room', 'user1'));
    await act(async () => {});

    act(() => {
      result.current.actions.selectVote(5);
    });

    expect(mockEmit).toHaveBeenCalledWith('selectVote', {
      name: 'user1',
      vote: 5,
      votingInstanceName: 'test-room',
    });
  });

  it('starts timer', async () => {
    const { result } = renderHook(() => usePlanningPoker('test-room', 'user1'));
    await act(async () => {});

    act(() => {
      result.current.actions.startTimer();
    });

    expect(mockEmit).toHaveBeenCalledWith('startTimer', {
      votingInstanceName: 'test-room',
    });
  });

  it('handles timerTick', async () => {
    jest.useFakeTimers();
    const { result } = renderHook(() => usePlanningPoker('test-room', 'user1'));
    await act(async () => {});

    const tickCallback = mockOn.mock.calls.find(
      (call) => call[0] === 'timerTick',
    )[1];

    act(() => {
      tickCallback();
    });

    // Timer starts at 3
    expect(result.current.timer).toBe(3);

    // Advance timer
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(result.current.timer).toBe(2);

    act(() => {
      jest.advanceTimersByTime(3000); // Finish timer
    });

    expect(result.current.timer).toBe(null);
    expect(result.current.isRevealed).toBe(true);

    jest.useRealTimers();
  });

  it('handles room closed', async () => {
    const { result } = renderHook(() => usePlanningPoker('test-room', 'user1'));
    await act(async () => {});

    const closedCallback = mockOn.mock.calls.find(
      (call) => call[0] === 'roomClosed',
    )[1];

    // Mock alert
    window.alert = jest.fn();

    act(() => {
      closedCallback();
    });

    expect(result.current.room.open).toBe(false);
    expect(window.alert).toHaveBeenCalled();
  });

  it('handles socket error', async () => {
    jest.useFakeTimers();
    const { result } = renderHook(() => usePlanningPoker('test-room', 'user1'));
    await act(async () => {});

    const errorCallback = mockOn.mock.calls.find(
      (call) => call[0] === 'error',
    )[1];

    act(() => {
      errorCallback('Some error');
    });

    expect(result.current.error).toBe('Some error');

    // Should clear error after 3s
    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(result.current.error).toBe(null);
    jest.useRealTimers();
  });
});
