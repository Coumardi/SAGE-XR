import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from '../src/Components/Login';

// Mock the fetch function
global.fetch = jest.fn();

describe('Login Component', () => {
  const mockOnLogin = jest.fn();
  
  beforeEach(() => {
    // Clear mock function calls before each test
    mockOnLogin.mockClear();
    global.fetch.mockClear();
  });
  
  test('renders login form with correct elements', () => {
    render(<Login onLogin={mockOnLogin} />);
    
    // Check if the form elements are rendered
    expect(screen.getByPlaceholderText('StarID or Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByTestId('login-button')).toBeInTheDocument();
  });
  
  test('updates input values when user types', () => {
    render(<Login onLogin={mockOnLogin} />);
    
    // Get the input elements
    const identifierInput = screen.getByPlaceholderText('StarID or Email');
    const passwordInput = screen.getByPlaceholderText('Password');
    
    // Type in the inputs
    fireEvent.change(identifierInput, { target: { value: 'user123' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    // Check if the input values are updated
    expect(identifierInput.value).toBe('user123');
    expect(passwordInput.value).toBe('password123');
  });
  
  test('calls onLogin with user data when login is successful', async () => {
    // Mock a successful response
    global.fetch.mockImplementationOnce(() => 
      Promise.resolve({
        status: 200,
        json: () => Promise.resolve({ 
          user: { id: 1, name: 'Test User', user_type: 'Student' },
          token: 'test-token'
        })
      })
    );
    
    render(<Login onLogin={mockOnLogin} />);
    
    // Get the input elements and login button
    const identifierInput = screen.getByPlaceholderText('StarID or Email');
    const passwordInput = screen.getByPlaceholderText('Password');
    const loginButton = screen.getByTestId('login-button');
    
    // Type in the inputs
    fireEvent.change(identifierInput, { target: { value: 'user123' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    // Click the login button
    fireEvent.click(loginButton);
    
    // Wait for the fetch call to complete
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/auth/login'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier: 'user123', password: 'password123' })
        })
      );
    });
    
    // Check if onLogin was called with the correct user data
    await waitFor(() => {
      expect(mockOnLogin).toHaveBeenCalledWith(
        { id: 1, name: 'Test User', user_type: 'Student' },
        'test-token'
      );
    });
  });
  
  test('displays error message when login fails', async () => {
    // Mock a failed response
    global.fetch.mockImplementationOnce(() => 
      Promise.resolve({
        status: 401,
        json: () => Promise.resolve({ message: 'Invalid credentials' })
      })
    );
    
    render(<Login onLogin={mockOnLogin} />);
    
    // Get the input elements and login button
    const identifierInput = screen.getByPlaceholderText('StarID or Email');
    const passwordInput = screen.getByPlaceholderText('Password');
    const loginButton = screen.getByTestId('login-button');
    
    // Type in the inputs
    fireEvent.change(identifierInput, { target: { value: 'user123' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    
    // Click the login button
    fireEvent.click(loginButton);
    
    // Wait for the error message to appear
    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
    
    // Check if onLogin was not called
    expect(mockOnLogin).not.toHaveBeenCalled();
  });
  
  test('handles network errors gracefully', async () => {
    // Mock a network error
    global.fetch.mockImplementationOnce(() => 
      Promise.reject(new Error('Network error'))
    );
    
    render(<Login onLogin={mockOnLogin} />);
    
    // Get the input elements and login button
    const identifierInput = screen.getByPlaceholderText('StarID or Email');
    const passwordInput = screen.getByPlaceholderText('Password');
    const loginButton = screen.getByTestId('login-button');
    
    // Type in the inputs
    fireEvent.change(identifierInput, { target: { value: 'user123' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    // Click the login button
    fireEvent.click(loginButton);
    
    // Wait for the error message to appear
    await waitFor(() => {
      expect(screen.getByText('Error processing your request')).toBeInTheDocument();
    });
    
    // Check if onLogin was not called
    expect(mockOnLogin).not.toHaveBeenCalled();
  });
}); 