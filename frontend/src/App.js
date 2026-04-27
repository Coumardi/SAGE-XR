import './App.css';
import React, { useEffect, useState, useRef } from 'react';
import ChatBox from './Components/ChatBox';
import InputArea from './Components/InputArea';
import UploadModal from './Components/UploadModal';
import Dropdown from './Components/Dropdown';
import Login from './Components/Login';
import LoginModal from './Components/LoginModal';
import SlideBarToggleable from './Components/SlideBarToggleable';
import MetricsChart from './Components/MetricsChart';
import '@fortawesome/fontawesome-free/css/all.css';
import { apiUrl } from './config';
import { createConversation } from './utils/conversationManager';

function App() {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [showReport, setShowReport] = useState(false);

  const [user, setUser] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const chatBoxRef = useRef(null);
  const chatContainerRef = useRef(null);

  const toggleSlidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  const handleReportClick = () => {
    setShowReport(true);
    setSidebarOpen(false);
  };

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (isTyping && chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [isTyping, messages]);

  useEffect(() => {
    if (user) {
      const newConversation = createConversation(user.id);
      setCurrentConversation(newConversation);
      setMessages([]);
    }
  }, [user]);

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

  const adjustInputareaHeight = () => {
    const textarea = document.getElementById("chat-input");
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
    textarea.style.overflowY = textarea.scrollHeight > 50 ? "auto" : "hidden";
  };

  const typeMessage = (text, index = 0) => {
    if (index < text.length) {
      setTimeout(() => {
        setMessages((prev) => {
          const lastMessage = prev[prev.length - 1];
          const newMessage = {
            ...lastMessage,
            text: lastMessage.text + text[index]
          };
          return [...prev.slice(0, -1), newMessage];
        });
        typeMessage(text, index + 1);
      }, 10);
    } else {
      setIsTyping(false);
    }
  };

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
            userId: user ? user.id : 'anonymous',
            conversationId: currentConversation ? currentConversation.getMongoId() : null,
            isNewConversation: !currentConversation || !currentConversation.getMongoId()
          })
        });

        const result = await response.json();

        const aiMessage = {
          type: 'ai',
          text: result.result,
          timeStamp: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          }),
          relevantMemories: result.relevantMemories
        };

        if (currentConversation && !currentConversation.getMongoId() && result.conversationId) {
          currentConversation.setMongoId(result.conversationId);
        }

        if (currentConversation) {
          currentConversation.addMessage(aiMessage);
        }

        setMessages(prev => [...prev, { ...aiMessage, text: '' }]);
        typeMessage(result.result);

      } catch (error) {
        console.error('Error:', error);

        const errorMessage = {
          type: 'ai',
          text: 'Error processing your request',
          timeStamp: currentTime
        };

        if (currentConversation) {
          currentConversation.addMessage(errorMessage);
        }

        setMessages(prev => [...prev, errorMessage]);
        setIsTyping(false);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!userInput.trim()) return alert('Please enter a message');
      if (userInput.length >= 1000) return alert('Message too long');
      sendMessage();
    }
  };

  const toggleUploadModal = () => setShowUploadModal(!showUploadModal);
  const toggleLoginModal = () => setShowLoginModal(!showLoginModal);

  const handleLogin = (userData, token) => {
    setUser(userData);
    if (token) {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
    }
    setShowLoginModal(false);
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentConversation(null);
    setMessages([]);
    localStorage.clear();
  };

  const handleSelect = (option) => {
    option === 'Login' ? toggleLoginModal() : handleLogout();
  };

  return (
    <div className="chat-container">
      <SlideBarToggleable
        isOpen={sidebarOpen}
        toggleSlidebar={toggleSlidebar}
        onReportClick={handleReportClick}
      />

      <header className="header">
        <h1 className="title">SAGE XR</h1>
        <div className="user-info">
          {user && <span>Welcome, {user.first_name}</span>}
          <Dropdown options={user ? ['Logout'] : ['Login']} onSelect={handleSelect} />
        </div>
      </header>

      {/* 🔥 MODAL (BEST UI) */}
      {showReport && (
        <div className="report-modal">
          <div className="report-modal-content">
            <button className="report-close-btn" onClick={() => setShowReport(false)}>
              ×
            </button>
            <MetricsChart />
          </div>
        </div>
      )}

      <ChatBox messages={messages} isTyping={isTyping} chatBoxRef={chatBoxRef} />

      <InputArea
        user={user}
        userInput={userInput}
        setUserInput={setUserInput}
        sendMessage={sendMessage}
        adjustInputareaHeight={adjustInputareaHeight}
        handleKeyPress={handleKeyPress}
        toggleUploadModal={toggleUploadModal}
        toggleSlidebar={toggleSlidebar}
      />

      {showUploadModal && (
        <UploadModal toggleUploadModal={toggleUploadModal} setUploadSuccess={setUploadSuccess} />
      )}

      {uploadSuccess && <div className="success-message">Files uploaded successfully!</div>}

      <LoginModal isOpen={showLoginModal} onClose={toggleLoginModal}>
        <Login onLogin={handleLogin} />
      </LoginModal>
    </div>
  );
}

export default App;