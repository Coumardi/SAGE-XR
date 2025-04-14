import './App.css';
import React, { useEffect, useState, useRef } from 'react';
import ChatBox from './Components/ChatBox';
import InputArea from './Components/InputArea';
import UploadModal from './Components/UploadModal';
import Dropdown from './Components/Dropdown';
import Login from './Components/Login';
import LoginModal from './Components/LoginModal';
import '@fortawesome/fontawesome-free/css/all.css';
import { apiUrl } from './config';
import { createConversation, loadConversation } from './utils/conversationManager';

function App() {
  // Chat related state
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [userType, setUserType] = useState(null);
  const [currentConversation, setCurrentConversation] = useState(null);
  
  // User authentication state
  const [user, setUser] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

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

  // Initialize conversation when user logs in
  useEffect(() => {
    if (user) {
      const newConversation = createConversation(user.id);
      setCurrentConversation(newConversation);
      setMessages([]); // Clear messages for new conversation
    }
  }, [user]);

  // Check if user is already logged in on app load
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

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

      const userMessage = {
        type: 'user',
        text: userInput,
        timeStamp: currentTime
      };

      // Add message to conversation
      if (currentConversation) {
        currentConversation.addMessage(userMessage);
      }

      setMessages([...messages, userMessage]);
      setUserInput('');

      try {
        setIsTyping(true);
        const response = await fetch(`${apiUrl}/api/query`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(localStorage.getItem('token') && { 
              'Authorization': `Bearer ${localStorage.getItem('token')}` 
            })
          },
          body: JSON.stringify({ 
            prompt: userInput,
            context: currentConversation ? currentConversation.getContext() : [],
            userId: user ? user.id : 'anonymous'
          })
        });

        const result = await response.json();
        const aiCurrentTime = new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        });

        const aiMessage = {
          type: 'ai',
          text: result.result,
          timeStamp: aiCurrentTime,
          relevantMemories: result.relevantMemories
        };

        // Add complete AI message to conversation
        if (currentConversation) {
          currentConversation.addMessage(aiMessage);
        }

        // Add to messages state and animate typing
        setMessages(prev => [...prev, { ...aiMessage, text: '' }]);
        typeMessage(result.result);

      } catch (error) {
        console.error('Error:', error);
        const errorMessage = {
          type: 'ai',
          text: 'Error processing your request',
          timeStamp: currentTime
        };

        // Add error message to conversation
        if (currentConversation) {
          currentConversation.addMessage(errorMessage);
        }

        setMessages(prev => [...prev, errorMessage]);
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

  // Toggle file upload modal
  const toggleUploadModal = () => {
    if (user && (user.user_type === 'Student' || user.user_type === 'Guest')) {
      return; // Prevent opening for Students and Guests
    }
    setShowUploadModal(!showUploadModal);
  };
  
  

  // Toggle login modal
  const toggleLoginModal = () => {
    setShowLoginModal(!showLoginModal);
  };

  // Handle login
  const handleLogin = (userData, token) => {
    setUser(userData);
    setUserType(userData.user_type);
    if (token) {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
    }
    setShowLoginModal(false);
  };

  // Handle logout
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  // Handle dropdown selection
  const handleSelect = (option) => {
    if (option === 'Login') {
      toggleLoginModal();
    } else if (option === 'Logout') {
      handleLogout();
    }
  };

  // Get dropdown options based on login status
  const getDropdownOptions = () => {
    return user ? ['Logout'] : ['Login'];
  };

  // Render different components based on user type
  const renderUserSpecificComponents = () => {
    if (!user) return null;

    switch (user.user_type) {
      case 'Administrator':
        // Intentional fallthrough - Administrator has same features as Instructor
        // eslint-disable-next-line no-fallthrough

      case 'Instructor':
        // Intentional fallthrough - Instructor has same features as Student
        // eslint-disable-next-line no-fallthrough

      case 'Student':
        // Intentional fallthrough - Student has same features as default
        // eslint-disable-next-line no-fallthrough

      default:
        return null;
    }
  };

  return (
    <div className="chat-container">
      <header className="header">
        <h1 className="title">SAGE XR</h1>
        <div className="user-info">
          {user && <span>Welcome, {user.first_name} ({user.user_type})</span>}
          <Dropdown options={getDropdownOptions()} onSelect={handleSelect} />
        </div>
      </header>
      
      {renderUserSpecificComponents()}
      
      <ChatBox 
        messages={messages} 
        isTyping={isTyping}
        chatBoxRef={chatBoxRef}
      />
      <InputArea
        user={user}
        userInput={userInput}
        setUserInput={setUserInput}
        sendMessage={sendMessage}
        adjustInputareaHeight={adjustInputareaHeight}
        handleKeyPress={handleKeyPress}
        toggleUploadModal={toggleUploadModal}
      />
      
      {showUploadModal && ( user && (user.user_type === 'Instructor' || user.user_type === 'Administrator')) && (
        <UploadModal 
          toggleUploadModal={toggleUploadModal} 
          setUploadSuccess={setUploadSuccess} 
        />
      )}
      
      {uploadSuccess && (
        <div className="success-message">
          Files uploaded successfully!
        </div>
      )}
      
      <LoginModal isOpen={showLoginModal} onClose={toggleLoginModal}>
        <Login onLogin={handleLogin} />
      </LoginModal>
    </div>
  );
}

export default App;
