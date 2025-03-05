// src/Components/Dropdown.js
import React from 'react';
import PropTypes from 'prop-types';
import './Dropdown.css';
import { FaUser } from 'react-icons/fa';

const Dropdown = ({ options, onSelect }) => {
  return (
    <div className="dropdown">
     <nav className="navbar">
               {/* Other navigation links */}
               <div className="login-icon">
                   <FaUser />
               </div>
           </nav>
      <div className="dropdown-content">
        {options.map((option, index) => (
          <button key={index} onClick={() => onSelect(option)}>
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};

Dropdown.propTypes = {
  options: PropTypes.arrayOf(PropTypes.string).isRequired,
  onSelect: PropTypes.func.isRequired,
};

export default Dropdown;