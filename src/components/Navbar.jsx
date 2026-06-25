import React from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import logo from '../assets/NextGear.jpg'

const Navbar = () => {
  const { cart } = useCart();
  const cartCount = cart.reduce((total, item) => total + (item.quantity || 1), 0);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <>
      <nav className="nav-container" style={{
        position: 'fixed',
        top: 0,
        width: '100%',
        zIndex: 1000,
        backgroundColor: 'rgba(10, 10, 10, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        color: 'white'
      }}>
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <img src={logo} alt="NextGear" style={{
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              objectFit: 'cover'
            }} />
            <span className="logo-text" style={{ fontWeight: '800', fontSize: '1.6rem', letterSpacing: '1px' }}>
              NEXT<span style={{ color: '#FF5722' }}>GEAR</span>
            </span>
          </div>
        </Link>

        {/* Desktop Links */}
        <div className="nav-links" style={{ fontWeight: '600', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '1px' }}>
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

          {/* Mobile Toggle Button */}
          <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(true)}>
            ☰
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div className={`mobile-menu-overlay ${mobileMenuOpen ? 'open' : ''}`} onClick={() => setMobileMenuOpen(false)}>
        <div className="mobile-menu-drawer" onClick={(e) => e.stopPropagation()}>
          <div className="close-menu" onClick={() => setMobileMenuOpen(false)}>&times;</div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1rem' }}>
            <img src={logo} alt="NextGear" style={{ width: '40px', height: '40px', borderRadius: '8px' }} />
            <span style={{ fontWeight: '800', fontSize: '1.5rem', letterSpacing: '1px' }}>NEXT<span style={{ color: '#FF5722' }}>GEAR</span></span>
          </div>

          <Link to="/" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>Home</Link>
          <Link to="/list/category/Helmets" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>Helmets</Link>
          <Link to="/list/category/Jackets" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>Jackets</Link>
          <Link to="/list/accessories/All" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>Accessories</Link>
          <Link to="/cart" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>Cart ({cartCount})</Link>

          <div style={{ marginTop: 'auto', color: '#666', fontSize: '0.9rem' }}>
            &copy; 2026 Next Gear
          </div>
        </div>
      </div>
    </>
  )
}

export default Navbar
