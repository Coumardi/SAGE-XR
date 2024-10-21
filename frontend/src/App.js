import './App.css';
import React, { useState } from 'react';
import ChatBox from './Components/ChatBox';
import InputArea from './Components/InputArea';
import UploadModal from './Components/UploadModal';
import '@fortawesome/fontawesome-free/css/all.css';



function App() {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);

  const adjustInputareaHeight = () => {
    const textarea = document.getElementById("chat-input");
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;

    if (textarea.scrollHeight > 50) {
      textarea.style.overflowY = "auto";
    } else {
      textarea.style.overflowY = "hidden";
    }
  };

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

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
  };

  const toggleUploadModal = () => {
    setShowUploadModal(!showUploadModal);
  };



  return (
    <div className="chat-container">
      <ChatBox messages={messages} />
      <InputArea
        userInput={userInput}
        setUserInput={setUserInput}
        sendMessage={sendMessage}
        adjustInputareaHeight={adjustInputareaHeight}
        handleKeyPress={handleKeyPress}
        toggleUploadModal={toggleUploadModal}
      />
      {showUploadModal && (
        <UploadModal toggleUploadModal={toggleUploadModal} />
      )}
    </div>
  );
}

export default App;
