import { configureStore } from '@reduxjs/toolkit';
import tshirtReducer from './features/tshirtSlice'; 

export const store = configureStore({
  reducer: {
    // This creates 'state.tshirt' inside your useSelector hooks
    tshirt: tshirtReducer, 
    
    // If you add more features later (like authentication or a global cart),
    // you register their reducers here:
    // user: userReducer,
  },
});