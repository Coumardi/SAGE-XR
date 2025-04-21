import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ModalButtons from '../src/Components/ModalButtons';

describe('ModalButtons Component', () => {
  const mockOnExit = jest.fn();
  const mockOnCommit = jest.fn();
  
  beforeEach(() => {
    // Clear mock function calls before each test
    mockOnExit.mockClear();
    mockOnCommit.mockClear();
  });
  
  test('renders both buttons with correct text', () => {
    render(
      <ModalButtons 
        onExit={mockOnExit} 
        onCommit={mockOnCommit} 
      />
    );
    
    // Check if both buttons are rendered with the correct text
    expect(screen.getByText('Exit')).toBeInTheDocument();
    expect(screen.getByText('Commit')).toBeInTheDocument();
  });
  
  test('calls onExit when Exit button is clicked', () => {
    render(
      <ModalButtons 
        onExit={mockOnExit} 
        onCommit={mockOnCommit} 
      />
    );
    
    // Click the Exit button
    const exitButton = screen.getByText('Exit');
    fireEvent.click(exitButton);
    
    // Check if onExit was called
    expect(mockOnExit).toHaveBeenCalled();
    expect(mockOnExit).toHaveBeenCalledTimes(1);
  });
  
  test('calls onCommit when Commit button is clicked', () => {
    render(
      <ModalButtons 
        onExit={mockOnExit} 
        onCommit={mockOnCommit} 
      />
    );
    
    // Click the Commit button
    const commitButton = screen.getByText('Commit');
    fireEvent.click(commitButton);
    
    // Check if onCommit was called
    expect(mockOnCommit).toHaveBeenCalled();
    expect(mockOnCommit).toHaveBeenCalledTimes(1);
  });
  
  test('buttons have the correct CSS classes', () => {
    render(
      <ModalButtons 
        onExit={mockOnExit} 
        onCommit={mockOnCommit} 
      />
    );
    
    // Check if the buttons have the correct CSS classes
    const exitButton = screen.getByText('Exit');
    const commitButton = screen.getByText('Commit');
    
    expect(exitButton).toHaveClass('exit-modal-button');
    expect(commitButton).toHaveClass('upload-modal-button');
  });
}); 