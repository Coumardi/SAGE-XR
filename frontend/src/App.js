import './App.css';
import React, { useEffect, useState } from 'react';
import ChatBox from './Components/ChatBox';
import InputArea from './Components/InputArea';
import UploadModal from './Components/UploadModal';
import '@fortawesome/fontawesome-free/css/all.css';
import {v4 as uuidv4} from 'uuid';

function App() {
  // Chat related state
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // File upload related state
  const [showUploadModal, setShowUploadModal] = useState(false);

  // User identification
  const [userId] = useState(() => {
    const stored = localStorage.getItem('chatUserId');
    return stored || `user_${Date.now()}`;
  });

  // Store userId in localStorage when created
  useEffect(() => {
    if (!localStorage.getItem('chatUserId')) {
      localStorage.setItem('chatUserId', userId);
    }
  }, [userId]);

  // Store question in MongoDB
  const storeQuestion = async (question, responseId) => {
<<<<<<< Updated upstream
    const currentTime = new Date().toISOString();
  
    const data = {
      userId: userId, 
      question: question,
      responseId: responseId,
      timeStamp: currentTime,
    };
  
    try {
      const response = await fetch('http://localhost:5000/api/question/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
=======
    try{

      const response= await fetch ('http://localhost:5000/api/question/add',  {
        method:'POST',
        headers:{
          'content-Type': 'application/json',
>>>>>>> Stashed changes
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to store question');
      }
  
      return response.json();
    } catch (error) {
      console.error('Error storing question:', error);
    }
  };
<<<<<<< Updated upstream
  


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
=======
    
>>>>>>> Stashed changes

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
      }, 30);
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

      // Add user message to chat
      setMessages([...messages, {
        type: 'user',
        text: userInput,
        timeStamp: currentTime
      }]);

      try {
        setIsTyping(true);
        const response = await fetch('http://localhost:5000/call-ai', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ data: userInput })
        });

        const result = await response.json();
        const aiCurrentTime = new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        });

        // Add AI message placeholder
        setMessages(prev => [...prev, {
          type: 'ai',
          text: '',
          timeStamp: aiCurrentTime
        }]);

        // Start typing effect
        typeMessage(result.message);
        
        // Generate a unique responseid using UUID

        const responseId = uuidv4(); // generate a unique responseid

        // Store question and response in database
        await storeQuestion(userInput, responseId);

      } catch (error) {
        console.error('Error calling AI service:', error);
        setMessages(prev => [...prev, {
          type: 'ai',
          text: 'Error calling AI service',
          timeStamp: currentTime
        }]);
        setIsTyping(false);
      }

      // Clear input
      setUserInput('');
      const textarea = document.getElementById("chat-input");
      textarea.style.height = "auto";
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent default Enter behavior

      if (userInput.trim() === "") {
        alert('Please enter a message');
      } else if (userInput.length >= 1000) {
        alert('Message is too long. Please keep it under 1000 characters.');
      } else {
        sendMessage(); // Send message if conditions are met
      }
    }
  };

<<<<<<< Updated upstream
  // Toggle file upload modal
=======
  // this funtion adjust the input area when input text increase and adjust 
// overflow behavior based on content height

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

  
  //toggle file upload modal
  
>>>>>>> Stashed changes
  const toggleUploadModal = () => {
    setShowUploadModal(!showUploadModal);
  };

  return (
    <div className="chat-container">
      <h1 className="title">SAGE XR</h1>
      <ChatBox 
        messages={messages} 
        isTyping={isTyping}
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
        />
      )}
    </div>
  );
}

export default App;