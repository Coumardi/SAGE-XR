import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import FileInput from '../src/Components/FileInput';

describe('FileInput Component', () => {
  const mockAddFiles = jest.fn();

  beforeEach(() => {
    // Clear mock function calls before each test
    mockAddFiles.mockClear();
  });

  test('renders file input component with correct text', () => {
    render(<FileInput addFiles={mockAddFiles} />);
    
    // Check if the component renders with the correct text
    expect(screen.getByText('Choose a file or Drag it here')).toBeInTheDocument();
    expect(screen.getByText('Select up to 3 files')).toBeInTheDocument();
    expect(screen.getByText('Choose File')).toBeInTheDocument();
  });

  test('file input is hidden', () => {
    render(<FileInput addFiles={mockAddFiles} />);
    
    // Check if the file input is hidden
    const fileInput = document.getElementById('file-input');
    expect(fileInput).toBeInTheDocument();
    expect(fileInput.style.display).toBe('none');
  });

  test('calls addFiles when files are selected', () => {
    render(<FileInput addFiles={mockAddFiles} />);
    
    // Create a mock file
    const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
    
    // Get the file input and trigger change event
    const fileInput = document.getElementById('file-input');
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    // Check if addFiles was called with the correct file
    expect(mockAddFiles).toHaveBeenCalledWith([file]);
    expect(mockAddFiles).toHaveBeenCalledTimes(1);
  });

  test('handles drag and drop events', () => {
    render(<FileInput addFiles={mockAddFiles} />);
    
    // Create a mock file
    const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
    
    // Get the container and trigger drop event
    const container = screen.getByText('Choose a file or Drag it here').parentElement;
    
    // Simulate drag over event
    fireEvent.dragOver(container, { preventDefault: jest.fn() });
    
    // Simulate drop event
    fireEvent.drop(container, {
      preventDefault: jest.fn(),
      stopPropagation: jest.fn(),
      dataTransfer: { files: [file] }
    });
    
    // Check if addFiles was called with the correct file
    expect(mockAddFiles).toHaveBeenCalledWith([file]);
    expect(mockAddFiles).toHaveBeenCalledTimes(1);
  });

  test('clicking the custom button triggers the hidden file input', () => {
    render(<FileInput addFiles={mockAddFiles} />);
    
    // Mock the click method of the hidden file input
    const fileInput = document.getElementById('file-input');
    const clickSpy = jest.spyOn(fileInput, 'click');
    
    // Click the custom button
    const customButton = screen.getByText('Choose File');
    fireEvent.click(customButton);
    
    // Check if the hidden file input was clicked
    expect(clickSpy).toHaveBeenCalled();
  });
}); 