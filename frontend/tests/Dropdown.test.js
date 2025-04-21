import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Dropdown from '../src/Components/Dropdown';

// Mock the react-icons/fa module
jest.mock('react-icons/fa', () => ({
  FaUser: () => <div data-testid="user-icon">User Icon</div>
}));

describe('Dropdown Component', () => {
  const mockOptions = ['Option 1', 'Option 2', 'Option 3'];
  const mockOnSelect = jest.fn();

  beforeEach(() => {
    // Clear mock function calls before each test
    mockOnSelect.mockClear();
  });

  test('renders dropdown with user icon', () => {
    render(<Dropdown options={mockOptions} onSelect={mockOnSelect} />);
    
    // Check if user icon is rendered
    expect(screen.getByTestId('user-icon')).toBeInTheDocument();
  });

  test('dropdown is closed by default', () => {
    render(<Dropdown options={mockOptions} onSelect={mockOnSelect} />);
    
    // Dropdown content should not be visible
    const dropdownContent = screen.queryByRole('button', { name: 'Option 1' });
    expect(dropdownContent).not.toBeInTheDocument();
  });

  test('opens dropdown when user icon is clicked', () => {
    render(<Dropdown options={mockOptions} onSelect={mockOnSelect} />);
    
    // Click on the user icon to open dropdown
    const userIcon = screen.getByTestId('user-icon').parentElement;
    fireEvent.click(userIcon);
    
    // Check if all options are now visible
    mockOptions.forEach(option => {
      expect(screen.getByRole('button', { name: option })).toBeInTheDocument();
    });
  });

  test('calls onSelect with correct option when an option is clicked', () => {
    render(<Dropdown options={mockOptions} onSelect={mockOnSelect} />);
    
    // Open dropdown
    const userIcon = screen.getByTestId('user-icon').parentElement;
    fireEvent.click(userIcon);
    
    // Click on an option
    const optionButton = screen.getByRole('button', { name: 'Option 2' });
    fireEvent.click(optionButton);
    
    // Check if onSelect was called with the correct option
    expect(mockOnSelect).toHaveBeenCalledWith('Option 2');
    expect(mockOnSelect).toHaveBeenCalledTimes(1);
  });

  test('closes dropdown after an option is selected', () => {
    render(<Dropdown options={mockOptions} onSelect={mockOnSelect} />);
    
    // Open dropdown
    const userIcon = screen.getByTestId('user-icon').parentElement;
    fireEvent.click(userIcon);
    
    // Click on an option
    const optionButton = screen.getByRole('button', { name: 'Option 1' });
    fireEvent.click(optionButton);
    
    // Dropdown should be closed
    const dropdownContent = screen.queryByRole('button', { name: 'Option 2' });
    expect(dropdownContent).not.toBeInTheDocument();
  });
}); 