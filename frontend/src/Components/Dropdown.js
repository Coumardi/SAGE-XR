import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './Dropdown.css';
import { FaUser } from 'react-icons/fa';
import LoginModal from './LoginModal';
import Login from './Login'; // Assuming you have a Login component

const Dropdown = ({ options, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleSelect = (option) => {
    if (option === 'Login') {
      setModalContent(<Login onLogin={() => setModalContent(null)} />);
    } else if (option === 'Logout') {
      // Handle logout logic here
      setModalContent(<div>Logout successful</div>);
    }
    setIsOpen(false);
  };

  return (
    <div className="dropdown">
      <nav className="navbar">
        {/* Other navigation links */}
        <div className="login-icon" onClick={toggleDropdown} aria-label="User menu">
          <FaUser />
        </div>
      </nav>
      {isOpen && (
        <div className="dropdown-content">
          {options.map((option, index) => (
            <button key={index} onClick={() => handleSelect(option)} aria-label={option}>
              {option}
            </button>
          ))}
        </div>
      )}
      <LoginModal isOpen={!!modalContent} onClose={() => setModalContent(null)}>
        {modalContent}
      </LoginModal>
    </div>
  );
};

Dropdown.propTypes = {
  options: PropTypes.arrayOf(PropTypes.string).isRequired,
  onSelect: PropTypes.func.isRequired,
};

export default Dropdown;