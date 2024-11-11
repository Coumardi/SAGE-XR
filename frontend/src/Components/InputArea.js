import React from 'react';

function InputArea({ userInput, setUserInput, sendMessage, adjustInputareaHeight, handleKeyPress, toggleUploadModal }) {
  return (
    <div className="input-area">
      <i className="fas fa-paperclip upload-icon" onClick={toggleUploadModal}></i>
      <textarea
        id="chat-input"
        rows={1}
        value={userInput}
        onChange={(e) => {
          setUserInput(e.target.value);
          adjustInputareaHeight();
        }}
        onKeyPress={handleKeyPress}
        placeholder="Ask SAGE anything..."
        autoComplete="off"
      />
      <button id="send-btn" onClick={sendMessage}>Send</button>
    </div>
  );
}

export default InputArea;
