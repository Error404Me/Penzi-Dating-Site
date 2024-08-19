import { ADD_MESSAGE, SET_MESSAGES } from '../Actions/actionTypes';

const initialState = {
  messages: []
};

const chatReducer = (state = initialState, action) => {
  switch (action.type) {
    case ADD_MESSAGE:
      return {
        ...state,
        messages: [...state.messages, action.payload]
      };
    case SET_MESSAGES:
      return {
        ...state,
        messages: action.payload
      };
    default:
      return state;
  }
};

export default chatReducer;
