import React, { useState } from 'react';
import './App.css';

function App() {
  const [messages, setMessages] = useState([]); // To store chat messages
  const [userInput, setUserInput] = useState(''); // To store user input

  // Function to handle sending a message
  const sendMessage = async () => {
    if (userInput.trim() !== "") {
      setMessages([...messages, { type: 'user', text: userInput }]); // Add user message to chat

      try {
        const response = await fetch('http://localhost:5000/call-ai', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ data: userInput })
        });

        const result = await response.json();
        setMessages(prev => [...prev, { type: 'ai', text: result.message }]); // Add backend response
      } catch (error) {
        console.error('Error calling AI service:', error);
        setMessages(prev => [...prev, { type: 'ai', text: 'Error calling AI service' }]);
      }

      setUserInput(''); // Clear input
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-box">
        {messages.map((message, index) => (
          <div
            key={index}
            className={message.type === 'user' ? 'user-message' : 'ai-message'}
          >
            {message.text}
          </div>
        ))}
      </div>

      <div className="input-area">
        <input
          type="text"
          id="chat-input"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Type your message..."
          autoComplete="off"
        />
        <button id="send-btn" onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default App;
