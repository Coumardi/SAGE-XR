// SlideBarToggleable.js
import React from 'react';
import './SlideBarToggleable.css'; 

const SlideBarToggleable = ({ isOpen, toggleSlidebar, onReportClick }) => {
  return (
    <>
      <button className="menu-btn" onClick={toggleSlidebar}>
        <i className="fa-solid fa-bars"></i> 
      </button>

      <div className={`slidebar ${isOpen ? 'open' : ''}`}>
        <button className="close-btn" onClick={toggleSlidebar}>
          &times;
        </button>
        
        <div className="slidebar-content">
          <button
            className="report-btn"
            onClick={onReportClick}
          >
            Report
          </button> 
        </div>
      </div>
    </>
  );
};

export default SlideBarToggleable;