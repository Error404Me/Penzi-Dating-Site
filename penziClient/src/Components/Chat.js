import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addMessage, setMessages } from '../Actions/chatActions';

// Define the base URL for the API
const HOST_URL = 'http://localhost:8080/api/sms';

const Chat = () => {
  const [input, setInput] = useState('');
  const dispatch = useDispatch();
  const messages = useSelector((state) => state.chat.messages);
  const messagesEndRef = useRef(null);

  // Retrieve phone number from local storage or set to an empty string
  const phoneNumber = localStorage.getItem("phoneNumber")

  useEffect(() => {
    // Fetch initial messages
    fetch(`${HOST_URL}/messages`)
      .then(response => response.json())
      .then(data => dispatch(setMessages(data)))
      .catch(error => console.error('Error fetching messages:', error));
  }, [dispatch]);

  useEffect(() => {
    // Scroll to the bottom of the chat container whenever messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (input.trim()) {
      const userMessage = { text: input, sender: 'User' };
      dispatch(addMessage(userMessage));
      setInput('');
  
      // Determine the endpoint based on message content
      const [command] = input.split('#').map(part => part.trim().toLowerCase());
      let endpoint = '';
      switch (command) {
        case 'start':
          endpoint = '/register';
          break;
        case 'details':
          endpoint = '/details';
          break;
        case 'myself':
          endpoint = '/myself';
          break;
        case 'match':
          endpoint = '/match';
          break;
        case 'next':
          endpoint = '/next';
          break;
        case 'yes':
          endpoint = '/confirm';
          break;
        default:
          endpoint = '/activate'; // Default to activation
      }
  
      // Construct the request body
      let body;

      if (endpoint === '/activate' && !phoneNumber) {
        body = { phoneNumber: input.split('#')[1]?.trim() };
      } else {
        body = {
          phoneNumber: phoneNumber,
          payload: input
        };
        console.log(body)
      }
      
  
      // Log URL and body for debugging
      console.log('Sending request to:', `${HOST_URL}${endpoint}`);
      console.log('Request body:', body);
  
      // Send message to backend
      fetch(`${HOST_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.text(); // Handle plain text responses
      })
      .then(text => {
        dispatch(addMessage({ text, sender: 'Onfon' }));
  
        // Store the phone number if activation was successful
        if (endpoint === '/activate' && !phoneNumber) {
          const extractedPhoneNumber = input.split('#')[1]?.trim();
          if (extractedPhoneNumber) {
            localStorage.setItem('phoneNumber', extractedPhoneNumber);
            console.log(extractedPhoneNumber)
          }
        }
      })
      .catch(error => console.error('Error sending message:', error));
    }
  };
  
  

  return (
    <div className="chat">
      <div className="messages">
        {messages.map((msg, index) => (
          <div key={index} className={msg.sender === 'User' ? 'message user' : 'message onfon'}>
            {msg.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="input-container">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
        />
        <button onClick={handleSendMessage}>➤</button>
      </div>
    </div>
  );
};

export default Chat;