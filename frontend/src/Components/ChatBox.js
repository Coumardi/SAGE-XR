import React, { useState } from 'react';

function ChatBox({ messages, isTyping, chatBoxRef }) {
  const [openSourceIndex, setOpenSourceIndex] = useState(null);
  return (
    <div className="chat-box" ref={chatBoxRef} data-testid="chat-box">
      {messages.map((message, index) => (
        <div key={index} className={message.type === 'user' ? 'user-message' : 'ai-message'}>
          {message.text}

          {message.citations?.length > 0 && (
            <div className="citations-box">
              <button
                className="source-button"
                onClick={() => setOpenSourceIndex(openSourceIndex === index ? null : index)}
              >
                Source:
              </button>
              {openSourceIndex === index && (
                <div className="source-content">
                  {message.citations.map((source, index) => (
                    <div key={index} className="citation-item">
                      <strong>
                      {source.fileName} - chunk {source.chunk} of {source.totalChunks}
                      </strong>
                      <p className="chunk-text">{source.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
                   
        <div className="timestamp">{message.timeStamp}</div>
        </div>
      ))}
    </div>
  );
}

// Add display name for debugging purposes
ChatBox.displayName = 'ChatBox';

export default ChatBox;