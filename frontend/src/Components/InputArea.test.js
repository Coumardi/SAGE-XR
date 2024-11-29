import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import InputArea from './InputArea';

describe('InputArea', () => {
  const mockProps = {
    userInput: '',
    setUserInput: jest.fn(),
    sendMessage: jest.fn(),
    adjustInputareaHeight: jest.fn(),
    handleKeyPress: jest.fn(),
    toggleUploadModal: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders all elements correctly', () => {
    render(<InputArea {...mockProps} />);
    
    expect(screen.getByPlaceholderText('Ask SAGE anything...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Send' })).toBeInTheDocument();
    expect(document.querySelector('.upload-icon')).toBeInTheDocument();
  });

  test('handles input change', () => {
    render(<InputArea {...mockProps} />);
    
    const input = screen.getByPlaceholderText('Ask SAGE anything...');
    userEvent.type(input, 'Hello');
    
    expect(mockProps.setUserInput).toHaveBeenCalled();
    expect(mockProps.adjustInputareaHeight).toHaveBeenCalled();
  });

  test('handles send button click', () => {
    render(<InputArea {...mockProps} />);
    
    const sendButton = screen.getByRole('button', { name: 'Send' });
    fireEvent.click(sendButton);
    
    expect(mockProps.sendMessage).toHaveBeenCalled();
  });

  test('handles key press', () => {
    render(<InputArea {...mockProps} />);
    
    const input = screen.getByPlaceholderText('Ask SAGE anything...');
    fireEvent.keyPress(input, { key: 'Enter', code: 13, charCode: 13 });
    
    expect(mockProps.handleKeyPress).toHaveBeenCalled();
  });

  test('handles upload icon click', () => {
    render(<InputArea {...mockProps} />);
    
    const uploadIcon = document.querySelector('.upload-icon');
    fireEvent.click(uploadIcon);
    
    expect(mockProps.toggleUploadModal).toHaveBeenCalled();
  });

  test('displays user input correctly', () => {
    const propsWithInput = {
      ...mockProps,
      userInput: 'Test message'
    };
    
    render(<InputArea {...propsWithInput} />);
    
    expect(screen.getByDisplayValue('Test message')).toBeInTheDocument();
  });
});