import React from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'

const Navbar = () => {
  const { cart } = useCart();
  const cartCount = cart.reduce((total, item) => total + (item.quantity || 1), 0);

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      width: '100%',
      zIndex: 1000,
      padding: '1.2rem 10%',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: 'rgba(10, 10, 10, 0.95)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      color: 'white'
    }}>
      <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
        <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <img src="/src/assets/NextGear.jpg" alt="NextGear" style={{
            width: '38px',
            height: '38px',
            borderRadius: '8px',
            objectFit: 'cover'
          }} />
          <span style={{ fontWeight: '800', fontSize: '1.6rem', letterSpacing: '1px' }}>
            NEXT<span style={{ color: '#FF5722' }}>GEAR</span>
          </span>
        </div>
      </Link>

      <div style={{ display: 'flex', gap: '2.5rem', fontWeight: '600', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '1px' }}>
        <Link to="/" style={{ color: '#FF5722', textDecoration: 'none' }}>Home</Link>
        <Link to="/list/category/Helmets" style={{ color: 'white', textDecoration: 'none' }}>Helmets</Link>
        <Link to="/list/category/Jackets" style={{ color: 'white', textDecoration: 'none' }}>Jackets</Link>
        <Link to="/list/accessories/All" style={{ color: 'white', textDecoration: 'none' }}>Accessories</Link>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        <span style={{ fontSize: '1.2rem', cursor: 'pointer' }}>🔍</span>
        <Link to="/cart" style={{ position: 'relative', textDecoration: 'none', color: 'inherit' }}>
          <span style={{ fontSize: '1.2rem', cursor: 'pointer' }}>🛒</span>
          {cartCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '-8px',
              right: '-8px',
              backgroundColor: '#FF5722',
              color: 'white',
              fontSize: '0.65rem',
              padding: '2px 5px',
              borderRadius: '50%',
              fontWeight: 'bold'
            }}>{cartCount}</span>
          )}
        </Link>

      </div>
    </nav>
  )
}

export default Navbar
