  // store.js
  import { createStore, combineReducers } from 'redux';
  import chatReducer from './Reducers/chatReducers';

  const rootReducer = combineReducers({
    chat: chatReducer
  });

  const store = createStore(rootReducer);

  export default store;
