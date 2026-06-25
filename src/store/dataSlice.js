import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

export const fetchGlobalData = createAsyncThunk(
    'data/fetchGlobalData',
    async (_, { getState }) => {
        try {
            const { data } = getState();
            if (data.isInitialized) return null;

            console.log("Redux: Starting Firestore fetch for collections:", ['products', 'categories', 'offers', 'brands', 'bikes', 'slides']);
            const collections = ['products', 'categories', 'offers', 'brands', 'bikes', 'slides'];
            const results = await Promise.all(
                collections.map(col => getDocs(collection(db, col)))
            );

            const payload = {};
            collections.forEach((col, index) => {
                payload[col] = results[index].docs.map(doc => ({ id: doc.id, ...doc.data() }));
            });

            console.log("Redux: Fetching complete. Data weights:", Object.keys(payload).map(k => `${k}: ${payload[k].length}`).join(', '));
            return payload;
        } catch (error) {
            console.error("Redux: THUNK CRASHED:", error);
            throw error;
        }
    }
);

const dataSlice = createSlice({
    name: 'data',
    initialState: {
        products: [],
        categories: [],
        offers: [],
        brands: [],
        bikes: [],
        slides: [],
        loading: false,
        isInitialized: false,
        error: null,
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchGlobalData.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchGlobalData.fulfilled, (state, action) => {
                if (action.payload) {
                    state.products = action.payload.products || [];
                    state.categories = action.payload.categories || [];
                    state.offers = action.payload.offers || [];
                    state.brands = action.payload.brands || [];
                    state.bikes = action.payload.bikes || [];
                    state.slides = action.payload.slides || [];
                    state.isInitialized = true;
                }
                state.loading = false;
            })
            .addCase(fetchGlobalData.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            });
    },
});

export default dataSlice.reducer;

