import React from 'react';

function ModalButtons({ clearFiles, handleUpload }) {
  return (
    <div className="modal-buttons">
      <button 
        type="button" 
        onClick={clearFiles} 
        className="exit-modal-button"
      >
        Exit
      </button>
      <button 
        type="button" 
        onClick={handleUpload} 
        className="upload-modal-button"
      >
        Commit
      </button>
    </div>
  );
}

export default ModalButtons;