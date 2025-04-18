import React from 'react';
import { render, screen } from '@testing-library/react';
import ChatBox from '../src/Components/ChatBox';

describe('ChatBox Component', () => {
  const mockMessages = [
    { text: 'Hello', type: 'user', timeStamp: '10:00 AM' },
    { text: 'Hi there!', type: 'ai', timeStamp: '10:01 AM' }
  ];
  
  const mockChatBoxRef = React.createRef();

  test('renders chat messages correctly', () => {
    render(<ChatBox messages={mockMessages} isTyping={false} chatBoxRef={mockChatBoxRef} />);
    
    // Check if user message is rendered
    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.getByText('10:00 AM')).toBeInTheDocument();
    
    // Check if AI message is rendered
    expect(screen.getByText('Hi there!')).toBeInTheDocument();
    expect(screen.getByText('10:01 AM')).toBeInTheDocument();
  });

  test('renders empty chat box when no messages', () => {
    render(<ChatBox messages={[]} isTyping={false} chatBoxRef={mockChatBoxRef} />);
    
    // Chat box should be empty but still rendered
    const chatBox = screen.getByTestId('chat-box');
    expect(chatBox).toBeInTheDocument();
    expect(chatBox.children.length).toBe(0);
  });

  test('applies correct CSS classes based on message type', () => {
    render(<ChatBox messages={mockMessages} isTyping={false} chatBoxRef={mockChatBoxRef} />);
    
    // Check if user message has the correct class
    const userMessageElement = screen.getByText('Hello').closest('div');
    expect(userMessageElement).toHaveClass('user-message');
    
    // Check if AI message has the correct class
    const aiMessageElement = screen.getByText('Hi there!').closest('div');
    expect(aiMessageElement).toHaveClass('ai-message');
  });
}); 