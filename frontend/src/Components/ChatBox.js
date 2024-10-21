import React from 'react';

function ChatBox({ messages }) {
  return (
    <div className="chat-box">
      {messages.map((message, index) => (
        <div key={index} className={message.type === 'user' ? 'user-message' : 'ai-message'}>
          {message.text}
        </div>
      ))}
    </div>
  );
}

export default ChatBox;
