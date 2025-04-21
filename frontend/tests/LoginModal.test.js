import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import LoginModal from '../src/Components/LoginModal';

describe('LoginModal Component', () => {
  const mockOnClose = jest.fn();
  
  beforeEach(() => {
    // Clear mock function calls before each test
    mockOnClose.mockClear();
  });
  
  test('does not render when isOpen is false', () => {
    render(
      <LoginModal isOpen={false} onClose={mockOnClose}>
        <div>Modal Content</div>
      </LoginModal>
    );
    
    // Modal content should not be visible
    expect(screen.queryByText('Modal Content')).not.toBeInTheDocument();
  });
  
  test('renders when isOpen is true', () => {
    render(
      <LoginModal isOpen={true} onClose={mockOnClose}>
        <div>Modal Content</div>
      </LoginModal>
    );
    
    // Modal content should be visible
    expect(screen.getByText('Modal Content')).toBeInTheDocument();
  });
  
  test('renders close button', () => {
    render(
      <LoginModal isOpen={true} onClose={mockOnClose}>
        <div>Modal Content</div>
      </LoginModal>
    );
    
    // Close button should be visible
    expect(screen.getByText('X')).toBeInTheDocument();
  });
  
  test('calls onClose when close button is clicked', () => {
    render(
      <LoginModal isOpen={true} onClose={mockOnClose}>
        <div>Modal Content</div>
      </LoginModal>
    );
    
    // Click the close button
    const closeButton = screen.getByText('X');
    fireEvent.click(closeButton);
    
    // Check if onClose was called
    expect(mockOnClose).toHaveBeenCalled();
  });
  
  test('renders children correctly', () => {
    render(
      <LoginModal isOpen={true} onClose={mockOnClose}>
        <div data-testid="test-child">Test Child</div>
      </LoginModal>
    );
    
    // Child content should be rendered
    expect(screen.getByTestId('test-child')).toBeInTheDocument();
    expect(screen.getByText('Test Child')).toBeInTheDocument();
  });
  
  test('renders multiple children correctly', () => {
    render(
      <LoginModal isOpen={true} onClose={mockOnClose}>
        <div data-testid="child-1">Child 1</div>
        <div data-testid="child-2">Child 2</div>
      </LoginModal>
    );
    
    // All children should be rendered
    expect(screen.getByTestId('child-1')).toBeInTheDocument();
    expect(screen.getByTestId('child-2')).toBeInTheDocument();
    expect(screen.getByText('Child 1')).toBeInTheDocument();
    expect(screen.getByText('Child 2')).toBeInTheDocument();
  });
}); 