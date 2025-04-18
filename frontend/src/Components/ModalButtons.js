import React from 'react';

function ModalButtons({ onExit, onCommit, commitButtonRef }) {
  return (
    <div className="modal-buttons" data-testid="modal-buttons">
      <button 
        type="button" 
        onClick={onExit} 
        className="exit-modal-button"
      >
        Exit
      </button>
      <button 
        type="button" 
        onClick={onCommit} 
        className="upload-modal-button"
        ref={commitButtonRef}
      >
        Commit
      </button>
    </div>
  );
}

export default ModalButtons;