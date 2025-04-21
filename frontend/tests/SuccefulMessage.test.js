import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SuccefulMessage from '../src/Components/SuccefulMessage';

describe('SuccefulMessage Component', () => {
  const mockMessage = 'Operation completed successfully!';
  const mockOnClose = jest.fn();
  
  beforeEach(() => {
    // Clear mock function calls before each test
    mockOnClose.mockClear();
  });
  
  test('renders with the correct message', () => {
    render(<SuccefulMessage message={mockMessage} onClose={mockOnClose} />);
    
    // Check if the message is rendered correctly
    expect(screen.getByText(mockMessage)).toBeInTheDocument();
  });
  
  test('renders OK button', () => {
    render(<SuccefulMessage message={mockMessage} onClose={mockOnClose} />);
    
    // Check if the OK button is rendered
    expect(screen.getByText('OK')).toBeInTheDocument();
  });
  
  test('calls onClose when OK button is clicked', () => {
    render(<SuccefulMessage message={mockMessage} onClose={mockOnClose} />);
    
    // Click the OK button
    const okButton = screen.getByText('OK');
    fireEvent.click(okButton);
    
    // Check if onClose was called
    expect(mockOnClose).toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
  
  test('renders with different messages', () => {
    const differentMessage = 'Another success message';
    
    // Render with the first message
    const { rerender } = render(
      <SuccefulMessage message={mockMessage} onClose={mockOnClose} />
    );
    expect(screen.getByText(mockMessage)).toBeInTheDocument();
    
    // Rerender with a different message
    rerender(<SuccefulMessage message={differentMessage} onClose={mockOnClose} />);
    expect(screen.getByText(differentMessage)).toBeInTheDocument();
  });
}); 