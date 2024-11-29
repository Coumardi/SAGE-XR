import React from 'react';
import { render, screen } from '@testing-library/react';
import ChatBox from './ChatBox';

describe('ChatBox', () => {
  const mockRef = React.createRef();
  const mockMessages = [
    { type: 'user', text: 'Hello', timeStamp: '10:00' },
    { type: 'ai', text: 'Hi there!', timeStamp: '10:01' }
  ];

  test('renders messages correctly', () => {
    render(<ChatBox messages={mockMessages} ref={mockRef} />);
    
    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.getByText('Hi there!')).toBeInTheDocument();
  });

  test('renders timestamps correctly', () => {
    render(<ChatBox messages={mockMessages} ref={mockRef} />);
    
    expect(screen.getByText('10:00')).toBeInTheDocument();
    expect(screen.getByText('10:01')).toBeInTheDocument();
  });

  test('applies correct classes for different message types', () => {
    render(<ChatBox messages={mockMessages} ref={mockRef} />);
    
    const userMessage = screen.getByText('Hello').closest('.user-message');
    const aiMessage = screen.getByText('Hi there!').closest('.ai-message');
    
    expect(userMessage).toHaveClass('user-message');
    expect(aiMessage).toHaveClass('ai-message');
  });

  test('renders empty chat box when no messages', () => {
    render(<ChatBox messages={[]} ref={mockRef} />);
    
    const chatBox = document.querySelector('.chat-box');
    expect(chatBox.children.length).toBe(0);
  });
});