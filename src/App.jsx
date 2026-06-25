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

  if (error) {
    return (
      <div style={{ backgroundColor: '#050505', color: 'white', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ color: '#FF5722' }}>Oops! Something went wrong</h2>
          <p style={{ marginTop: '10px', color: '#666' }}>{error}</p>
          <button onClick={() => window.location.reload()} style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: '#FF5722', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Retry</button>
        </div>
      </div>
    );
  }

  if (loading || !isInitialized) {
    return <Loader />;
  }

  return (
    <Router>
      <CartProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/login" element={<Login />} />
          <Route path="/list/:type/:name" element={<ProductList />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/all-bikes" element={<AllBikes />} />
        </Routes>
      </CartProvider>
    </Router>
  )
}

export default App
