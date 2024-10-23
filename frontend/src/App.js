
import './App.css';
import React, { useState } from 'react';
import ChatBox from './Components/ChatBox';
import InputArea from './Components/InputArea';
import UploadModal from './Components/UploadModal';
import '@fortawesome/fontawesome-free/css/all.css';



function App() {
  const [messages, setMessages] = useState([]); // To storE chat messages
  const [userInput, setUserInput] = useState(''); // To store user input
  const [isTyping, setIsTyping]= useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);


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


    const typeMessage = (text, index=0)=>{
      if (index < text.length)
      {
        setTimeout(()=>{
          setMessages((prev)=>{
            const lastMessage=prev[prev.length-1];
            const newMessage={ ...lastMessage, text:lastMessage.text +text[index]};
            return[ ...prev.slice(0, -1),newMessage];
          });
          
          typeMessage(text, index+1);
        },30);}

        else{
          setIsTyping(false);
        }
      };


  

  const sendMessage = async () => {
    if (userInput.trim() !== "") {

      const currentTime = new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
      setMessages([...messages, { type: 'user', text: userInput,timeStamp: currentTime }]); // Add user message to chat

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
        const aiCurrentTime = new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}); //add backend respond with timestamp

        setMessages(prev => [...prev, { type: 'ai', text: '',  timeStamp: aiCurrentTime}]); // Add backend response
        typeMessage(result.message);

      } catch (error) {
        console.error('Error calling AI service:', error);
        setMessages(prev => [...prev, { type: 'ai', text: 'Error calling AI service', timeStamp: currentTime }]);
        setIsTyping(false);
      }
  
      setUserInput(''); // Clear input
      const textarea = document.getElementById("chat-input");
      textarea.style.height="auto";
      
    }
  };

  // Function to handle pressing "Enter" key
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

      <h1 className="title"> SAGE XR</h1>
      <div className="chat-box">
        {messages.map((message, index) => (
          <div
            key={index}
            className={message.type === 'user' ? 'user-message' : 'ai-message'}
          >
            {message.text}
            <div className="timestamp">{message.timeStamp}</div>
          </div>
        ))}
      </div>

      <div className="input-area">
        <textarea
          id="chat-input"
          rows={1}
          value={userInput}
          onChange={(e) => {setUserInput(e.target.value);
            adjustInputareaHeight();
          }}
          onKeyPress={handleKeyPress} // Call handleKeyPress when a key is pressed
          placeholder="Ask SAGE anything..."
          autoComplete="off"
        />
        <button id="send-btn" onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default App;
