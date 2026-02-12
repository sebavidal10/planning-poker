import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Card from './Card';

// Mock Framer Motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    button: ({ children, onClick, className, disabled, ...props }) => (
      <button
        onClick={onClick}
        className={className}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    ),
    div: ({ children, className }) => (
      <div className={className}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

describe('Card Component', () => {
  const mockOnSelect = jest.fn();

  beforeEach(() => {
    mockOnSelect.mockClear();
  });

  test('renders card value correctly', () => {
    render(
      <Card
        value="8"
        onSelect={mockOnSelect}
        isSelected={false}
        disabled={false}
      />,
    );
    expect(screen.getByText('8')).toBeInTheDocument();
  });

  test('calls onSelect when clicked', () => {
    render(
      <Card
        value="5"
        onSelect={mockOnSelect}
        isSelected={false}
        disabled={false}
      />,
    );
    const cardButton = screen.getByText('5').closest('button');
    fireEvent.click(cardButton);
    expect(mockOnSelect).toHaveBeenCalledWith('5');
  });

  test.skip('does not call onSelect when disabled', () => {
    render(
      <Card
        value="3"
        onSelect={mockOnSelect}
        isSelected={false}
        disabled={true}
      />,
    );
    const cardButton = screen.getByText('3').closest('button');
    fireEvent.click(cardButton);
    expect(mockOnSelect).not.toHaveBeenCalled();
  });

  test('shows selected state styling (indirectly via class check mock)', () => {
    const { container } = render(
      <Card
        value="XS"
        onSelect={mockOnSelect}
        isSelected={true}
        disabled={false}
      />,
    );
    // Since we mocked motion.button to pass className, we can check if it contains the selected bg color class
    // In our implementation: 'bg-indigo-600'
    expect(container.firstChild).toHaveClass('bg-indigo-600');
  });
});
