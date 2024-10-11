import './App.css';
import React, { useState, useEffect, useRef } from 'react';

function App() {
  const [messages, setMessages] = useState([]); // To storE chat messages
  const [userInput, setUserInput] = useState(''); // To store user input
  const inputRef = useRef(null); // Reference to the textarea

  useEffect(() => {
    
    fetch('http://localhost:5000/')  // Replace with backend URL 
      .then(response => response.text())
      .then(data => console.log(data)) // Handle backend data if needed
      .catch(error => console.error('Error fetching data from backend:', error));
  }, []);

  // Function to handle sending a message
  const sendMessage = () => {
    if (userInput.trim() !== "") {
      setMessages([...messages, { type: 'user', text: userInput }]); // Add user message
      setUserInput(''); // Clear input
      inputRef.current.style.height = 'auto'; // Reset height to auto for new input
    }
  };

  // Function to handle pressing "Enter" key
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Prevent default behavior of Enter
      sendMessage(); // Send the message
    }
  };

  // Dynamically adjust the textarea height as the user types
  const adjustTextareaHeight = () => {
    const textarea = inputRef.current;
    textarea.style.height = 'auto'; // Reset height to auto to calculate new height
    textarea.style.height = `${textarea.scrollHeight}px`; // Adjust height based on scroll height
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
        <textarea
          id="chat-input"
          value={userInput}
          onChange={(e) => {
            setUserInput(e.target.value);
            adjustTextareaHeight(); // Adjust height as user types
          }}
          onKeyPress={handleKeyPress} // Handle "Enter" key press
          placeholder="Type your message..."
          ref={inputRef} // Attach ref to the textarea
          rows={1} // Start with a single row
          style={{ resize: 'none', overflowY: 'auto' }} // Disable manual resizing and enable vertical scroll
        />
        <button id="send-btn" onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default App;
