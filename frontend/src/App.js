import './App.css';
import React, { useEffect, useState, useRef } from 'react';
import ChatBox from './Components/ChatBox';
import InputArea from './Components/InputArea';
import UploadModal from './Components/UploadModal';
import Dropdown from './Components/Dropdown';
import '@fortawesome/fontawesome-free/css/all.css';

function App() {
  // Chat related state
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Chat container
  const chatBoxRef = useRef(null);

  // Scroll to the bottom when message is added
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  // File upload related state
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Create a ref for the chat container
  const chatContainerRef = useRef(null);

  // Auto-scroll effect when isTyping changes
  useEffect(() => {
    if (isTyping && chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [isTyping, messages]);

  // Adjust input area height when input text increases
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

  // Simulate typing effect for AI response
  const typeMessage = (text, index = 0) => {
    if (index < text.length) {
      setTimeout(() => {
        setMessages((prev) => {
          const lastMessage = prev[prev.length - 1];
          const newMessage = { ...lastMessage, text: lastMessage.text + text[index] };
          return [...prev.slice(0, -1), newMessage];
        });
        typeMessage(text, index + 1);
      }, 10);
    } else {
      setIsTyping(false);
    }
  };

  // Send message to SAGE Service
  const sendMessage = async () => {
    if (userInput.trim() !== '') {
      const currentTime = new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      });

      setMessages([...messages, {
        type: 'user',
        text: userInput,
        timeStamp: currentTime
      }]);

      setUserInput('');

      try {
        setIsTyping(true);
        const response = await fetch('http://localhost:5000/api/query', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ prompt: userInput })
        });

        const result = await response.json();
        const aiCurrentTime = new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        });

        // Initialize empty AI message
        setMessages(prev => [...prev, {
          type: 'ai',
          text: '',  // Start empty
          timeStamp: aiCurrentTime,
          relevantMemories: result.relevantMemories
        }]);

        // Type out the message
        typeMessage(result.result);

      } catch (error) {
        console.error('Error:', error);
        setMessages(prev => [...prev, {
          type: 'ai',
          text: 'Error processing your request',
          timeStamp: currentTime
        }]);
        setIsTyping(false);
      }
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (userInput.trim() === "") {
        alert('Please enter a message');
      } else if (userInput.length >= 1000) {
        alert('Message is too long. Please keep it under 1000 characters.');
      } else {
        sendMessage();
      }
    }
  };

  // Toggle file upload modal and simulate file download progress
  const toggleUploadModal = () => {
    setShowUploadModal(!showUploadModal);
  };

  // Handle dropdown selection
  const handleSelect = (role) => {
    console.log('Selected role:', role);
    // Handle the selected role logic here
  };

  return (
    <div className="chat-container">
      <header className="header">
        <h1 className="title">SAGE XR</h1>
        <Dropdown options={['Admin', 'Student', 'Guest', 'Instructor']} onSelect={handleSelect} />
      </header>
      <ChatBox 
        messages={messages} 
        isTyping={isTyping}
        ref={chatContainerRef}
      />
      <InputArea
        userInput={userInput}
        setUserInput={setUserInput}
        sendMessage={sendMessage}
        adjustInputareaHeight={adjustInputareaHeight}
        handleKeyPress={handleKeyPress}
        toggleUploadModal={toggleUploadModal}
      />
      {showUploadModal && (
        <UploadModal 
          toggleUploadModal={toggleUploadModal}
          setUploadSuccess={setUploadSuccess}
        />
      )}
      {uploadSuccess && (           
        <div className="success-message">
          <span className="success-icon">✔</span>
          <span>Documents uploaded successfully!</span>
        </div>
      )}
    </div>
  );
}

export default App;
