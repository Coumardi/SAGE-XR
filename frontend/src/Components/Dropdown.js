import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './Dropdown.css';
import { FaUser } from 'react-icons/fa';

const Dropdown = ({ options, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleSelect = (option) => {
    onSelect(option);
    setIsOpen(false);
  };

  return (
    <div className="dropdown">
      <div className="login-icon" onClick={toggleDropdown} aria-label="User menu">
        <FaUser />
      </div>
      {isOpen && (
        <div className="dropdown-content">
          {options.map((option, index) => (
            <button key={index} onClick={() => handleSelect(option)} aria-label={option}>
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

Dropdown.propTypes = {
  options: PropTypes.arrayOf(PropTypes.string).isRequired,
  onSelect: PropTypes.func.isRequired,
};

export default Dropdown;