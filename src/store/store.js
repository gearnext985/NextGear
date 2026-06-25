import { configureStore } from '@reduxjs/toolkit';
import dataReducer from './dataSlice';

export const store = configureStore({
    reducer: {
        data: dataReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false, // Firestore timestamps and other non-serialized data
        }),
});
