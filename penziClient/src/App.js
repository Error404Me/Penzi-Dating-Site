import React, { useState, useEffect } from 'react';
import { Provider } from 'react-redux';
import store from './Store';
import Chat from './Components/Chat';
import './Styles.css';

// Custom hook for managing phone number
const usePhoneNumber = () => {
  const [phoneNumber, setPhoneNumber] = useState(() => localStorage.getItem('phoneNumber'));

  useEffect(() => {
    localStorage.setItem('phoneNumber', phoneNumber);
  }, [phoneNumber]);

  const updatePhoneNumber = (number) => {
    if (number) {
      setPhoneNumber(number);
    }
  };

  return [phoneNumber, updatePhoneNumber];
};

const App = () => {
  const [phoneNumber, updatePhoneNumber] = usePhoneNumber();
  const [inputValue, setInputValue] = useState('');
  const [profilePic, setProfilePic] = useState(null); // State for profile picture

  const handleSubmit = (e) => {
    e.preventDefault();
    updatePhoneNumber(inputValue);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Provider store={store}>
      <div className="app-container">
        <h1 className="app-title">Onfon Dating Bot (Penzi ❤)</h1>
        
        {/* Profile Icon */}
        <div className="profile-container">
          <label htmlFor="profile-pic-upload" className="profile-icon">
            {profilePic ? (
              <img src={profilePic} alt="Profile" className="profile-pic" />
            ) : (
              <span className="profile-placeholder">👤</span>
            )}
            <input
              type="file"
              id="profile-pic-upload"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: 'none' }} // Hide the file input
            />
          </label>
        </div>
        
        {!phoneNumber ? (
          <div className="phone-number-setup">
            <p>Dear User, Input Your <b>PhoneNumber</b> Ensuring It Starts With 07 or 01 and is exactly 10 digits long e.g., 0712345678 or 0112345678 To Get Started</p>
            <form onSubmit={handleSubmit} className="phone-number-form">
              <input
                type="text"
                placeholder="Enter your phone number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="phone-number-input"
                required
              />
              <button type="submit" className="set-phone-button">
                Set Phone Number
              </button>
            </form>
          </div>
        ) : (
          <Chat />
        )}
      </div>
    </Provider>
  );
};

export default App;
