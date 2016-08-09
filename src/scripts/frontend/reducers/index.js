import { routerReducer as routing } from 'react-router-redux';
import { combineReducers } from 'redux';

const filter = (state = '', action) => {
  return state;
};


const rootReducer = combineReducers({
    filter,
    routing
});

export default rootReducer;
