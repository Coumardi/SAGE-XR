// SlideBarToggleable.js
import React from 'react';
import './SlideBarToggleable.css'; 


const SlideBarToggleable = ({ isOpen, toggleSlidebar }) => {
  return (
    <>
      {/* Toggle button (hamburger icon) always visible in top-left. will need to fix this if need to only allow instructor and admin to view it*/ }
      <button className="menu-btn" onClick={toggleSlidebar}>
        <i className="fa-solid fa-bars"></i> 
       
      </button>

      {/* Sidebar */}
      <div className={`slidebar ${isOpen ? 'open' : ''}`}>
        <button className="close-btn" onClick={toggleSlidebar}>
          &times;
        </button>
        
        {/* sidebar content here */}
        <div className="slidebar-content">
          <button
          className="report-btn"
          onClick={() => console.log('Report buton clickeed')}
          >Report</button> 
        </div>
      </div>
    </>
  );
};

export default SlideBarToggleable;
