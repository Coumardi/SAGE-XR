import React from 'react';

const ChatBox = React.forwardRef(({ messages }, ref) => {
  return (
    <div className="chat-box" ref={ref}>
      {messages.map((message, index) => (
        <div key={index} className={message.type === 'user' ? 'user-message' : 'ai-message'}>
          {message.text}
          <div className="timestamp">{message.timeStamp}</div>
        </div>
      ))}
    </div>
  );
});

// Add display name for debugging purposes
ChatBox.displayName = 'ChatBox';

export default ChatBox;