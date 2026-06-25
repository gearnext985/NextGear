import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchGlobalData } from './store/dataSlice'
import Home from './pages/Home'
import Admin from './pages/Admin'
import Login from './pages/Login'
import ProductList from './pages/ProductList'
import ProductDetails from './pages/ProductDetails'
import Cart from './pages/Cart'
import AllBikes from './pages/AllBikes'
import { CartProvider } from './context/CartContext'
import Loader from './components/Loader'

function App() {
  const { loading, isInitialized, error } = useSelector(state => state.data);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchGlobalData());
  }, [dispatch]);

  return (
    <Router>
      <CartProvider>
        {isInitialized ? (
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/login" element={<Login />} />
            <Route path="/list/:type/:name" element={<ProductList />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/all-bikes" element={<AllBikes />} />
          </Routes>
        ) : (
          <div style={{ padding: '20px', color: 'white', backgroundColor: '#050505', height: '100vh' }}>
            Initializing Next Gear... {loading ? "(Fetching Data)" : ""}
            {error && <div style={{ color: 'red' }}>Error: {error}</div>}
          </div>
        )}
      </CartProvider>
    </Router>
  )
}

export default App
