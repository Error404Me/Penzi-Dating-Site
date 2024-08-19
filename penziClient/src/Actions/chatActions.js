// src/Actions/chatActions.js
import { ADD_MESSAGE, SET_MESSAGES } from './actionTypes';

// Synchronous Action Creators
export const addMessage = (message) => ({
  type: ADD_MESSAGE,
  payload: message
});

export const setMessages = (messages) => ({
  type: SET_MESSAGES,
  payload: messages
});

// Asynchronous Action Creators using Thunks
export const sendChatMessage = (message) => async (dispatch) => {
  dispatch(addMessage({ ...message, from: 'User' }));

  // Determine the endpoint based on message content
  const BASE_URL = process.env.REACT_APP_API_URL;
  let endpoint = '';
  const [command] = message.text.split('#').map(part => part.trim().toLowerCase());

  switch (command) {
    case 'start':
      endpoint = '/api/registerUser';
      break;
    case 'details':
      endpoint = '/api/registerDetails';
      break;
    case 'myself':
      endpoint = '/api/registerSelfDescription';
      break;
    case 'match':
      endpoint = '/api/handleMatchingRequest';
      break;
    case 'next':
    case 'describe':
      endpoint = '/api/handleSubsequentDetails';
      break;
    case 'yes':
      endpoint = '/api/handleUserConfirmation';
      break;
    default:
      endpoint = '/api/activateService';
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from: 'User', body: message.text }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.text();
    dispatch(addMessage({ from: 'Onfon', to: 'User', text: data }));
  } catch (error) {
    console.error('Error sending message:', error);
  }
};
