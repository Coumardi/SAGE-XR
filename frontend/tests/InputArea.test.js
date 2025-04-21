import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import InputArea from '../src/Components/InputArea';

describe('InputArea Component', () => {
  const mockUserInput = 'Hello, SAGE!';
  const mockSetUserInput = jest.fn();
  const mockSendMessage = jest.fn();
  const mockAdjustInputareaHeight = jest.fn();
  const mockHandleKeyPress = jest.fn();
  const mockToggleUploadModal = jest.fn();

  beforeEach(() => {
    // Clear mock function calls before each test
    mockSetUserInput.mockClear();
    mockSendMessage.mockClear();
    mockAdjustInputareaHeight.mockClear();
    mockHandleKeyPress.mockClear();
    mockToggleUploadModal.mockClear();
  });

  test('renders input area with correct elements', () => {
    render(
      <InputArea
        user={null}
        userInput={mockUserInput}
        setUserInput={mockSetUserInput}
        sendMessage={mockSendMessage}
        adjustInputareaHeight={mockAdjustInputareaHeight}
        handleKeyPress={mockHandleKeyPress}
        toggleUploadModal={mockToggleUploadModal}
      />
    );
    
    // Check if the textarea and send button are rendered
    expect(screen.getByPlaceholderText('Ask SAGE anything...')).toBeInTheDocument();
    expect(screen.getByText('Send')).toBeInTheDocument();
  });

  test('displays the correct user input in the textarea', () => {
    render(
      <InputArea
        user={null}
        userInput={mockUserInput}
        setUserInput={mockSetUserInput}
        sendMessage={mockSendMessage}
        adjustInputareaHeight={mockAdjustInputareaHeight}
        handleKeyPress={mockHandleKeyPress}
        toggleUploadModal={mockToggleUploadModal}
      />
    );
    
    // Check if the textarea displays the correct user input
    const textarea = screen.getByPlaceholderText('Ask SAGE anything...');
    expect(textarea.value).toBe(mockUserInput);
  });

  test('calls setUserInput and adjustInputareaHeight when textarea value changes', () => {
    render(
      <InputArea
        user={null}
        userInput={mockUserInput}
        setUserInput={mockSetUserInput}
        sendMessage={mockSendMessage}
        adjustInputareaHeight={mockAdjustInputareaHeight}
        handleKeyPress={mockHandleKeyPress}
        toggleUploadModal={mockToggleUploadModal}
      />
    );
    
    // Change the textarea value
    const textarea = screen.getByPlaceholderText('Ask SAGE anything...');
    fireEvent.change(textarea, { target: { value: 'New input' } });
    
    // Check if setUserInput and adjustInputareaHeight were called
    expect(mockSetUserInput).toHaveBeenCalledWith('New input');
    expect(mockAdjustInputareaHeight).toHaveBeenCalled();
  });

  test('calls handleKeyPress when a key is pressed in the textarea', () => {
    render(
      <InputArea
        user={null}
        userInput={mockUserInput}
        setUserInput={mockSetUserInput}
        sendMessage={mockSendMessage}
        adjustInputareaHeight={mockAdjustInputareaHeight}
        handleKeyPress={mockHandleKeyPress}
        toggleUploadModal={mockToggleUploadModal}
      />
    );
    
    // Press a key in the textarea
    const textarea = screen.getByPlaceholderText('Ask SAGE anything...');
    fireEvent.keyPress(textarea, { key: 'Enter', code: 13, charCode: 13 });
    
    // Check if handleKeyPress was called
    expect(mockHandleKeyPress).toHaveBeenCalled();
  });

  test('calls sendMessage when the send button is clicked', () => {
    render(
      <InputArea
        user={null}
        userInput={mockUserInput}
        setUserInput={mockSetUserInput}
        sendMessage={mockSendMessage}
        adjustInputareaHeight={mockAdjustInputareaHeight}
        handleKeyPress={mockHandleKeyPress}
        toggleUploadModal={mockToggleUploadModal}
      />
    );
    
    // Click the send button
    const sendButton = screen.getByText('Send');
    fireEvent.click(sendButton);
    
    // Check if sendMessage was called
    expect(mockSendMessage).toHaveBeenCalled();
  });

  test('shows upload icon for Instructor or Administrator users', () => {
    // Test with Instructor user
    const { rerender } = render(
      <InputArea
        user={{ user_type: 'Instructor' }}
        userInput={mockUserInput}
        setUserInput={mockSetUserInput}
        sendMessage={mockSendMessage}
        adjustInputareaHeight={mockAdjustInputareaHeight}
        handleKeyPress={mockHandleKeyPress}
        toggleUploadModal={mockToggleUploadModal}
      />
    );
    
    // Check if the upload icon is rendered for Instructor
    expect(screen.getByTestId('upload-icon')).toBeInTheDocument();
    
    // Test with Administrator user
    rerender(
      <InputArea
        user={{ user_type: 'Administrator' }}
        userInput={mockUserInput}
        setUserInput={mockSetUserInput}
        sendMessage={mockSendMessage}
        adjustInputareaHeight={mockAdjustInputareaHeight}
        handleKeyPress={mockHandleKeyPress}
        toggleUploadModal={mockToggleUploadModal}
      />
    );
    
    // Check if the upload icon is rendered for Administrator
    expect(screen.getByTestId('upload-icon')).toBeInTheDocument();
    
    // Test with Student user
    rerender(
      <InputArea
        user={{ user_type: 'Student' }}
        userInput={mockUserInput}
        setUserInput={mockSetUserInput}
        sendMessage={mockSendMessage}
        adjustInputareaHeight={mockAdjustInputareaHeight}
        handleKeyPress={mockHandleKeyPress}
        toggleUploadModal={mockToggleUploadModal}
      />
    );
    
    // Check if the upload icon is not rendered for Student
    expect(screen.queryByTestId('upload-icon')).not.toBeInTheDocument();
  });

  test('calls toggleUploadModal when the upload icon is clicked', () => {
    render(
      <InputArea
        user={{ user_type: 'Instructor' }}
        userInput={mockUserInput}
        setUserInput={mockSetUserInput}
        sendMessage={mockSendMessage}
        adjustInputareaHeight={mockAdjustInputareaHeight}
        handleKeyPress={mockHandleKeyPress}
        toggleUploadModal={mockToggleUploadModal}
      />
    );
    
    // Click the upload icon
    const uploadIcon = screen.getByTestId('upload-icon');
    fireEvent.click(uploadIcon);
    
    // Check if toggleUploadModal was called
    expect(mockToggleUploadModal).toHaveBeenCalled();
  });
}); 