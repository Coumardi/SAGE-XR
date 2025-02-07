import React from 'react';

const SuccefulMessage = ({ message, onClose }) => (
  <div className="SuccefulMessage-backdrop">
    <div className="SuccefulMessage">
      <p>{message}</p>
      <button onClick={onClose}>OK</button>
    </div>
  </div>
);

export default SuccefulMessage;
