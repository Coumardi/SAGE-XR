import React from 'react';

function InputArea({user, userInput, setUserInput, sendMessage, adjustInputareaHeight, handleKeyPress, toggleUploadModal, toggleSlidebar }) {
  return (
    <div className="input-area">
      {user && (user.user_type === 'Instructor' || user.user_type === 'Administrator') && (
      <>
      <i className="fas fa-paperclip upload-icon" onClick={toggleUploadModal} data-testid="upload-icon"></i>
      </>
      )}
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
