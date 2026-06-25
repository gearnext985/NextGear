import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useCart } from '../context/CartContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const ProductDetails = () => {
    const { id } = useParams()
    const { addToCart } = useCart()
    const products = useSelector(state => state.data.products) || []
    const product = products.find(p => p.id === id)
    const [selectedSize, setSelectedSize] = React.useState('')

    if (!product) {
        return (
            <div style={{ backgroundColor: '#050505', minHeight: '100vh', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Product Not Found</h2>
                    <Link to="/" style={{ color: '#FF5722', textDecoration: 'none', fontWeight: 'bold' }}>Back to Home</Link>
                </div>
            </div>
        )
    }

    const availableSizes = product.sizes ? product.sizes.split(',').map(s => s.trim()) : [];

    const handleAddToCart = () => {
        if (product.category !== 'Accessories' && availableSizes.length > 0 && !selectedSize) {
            alert("Please select a size first!");
            return;
        }
        addToCart({ ...product, selectedSize });
    };

    return (
        <div style={{ backgroundColor: '#050505', minHeight: '100vh', color: 'white', fontFamily: 'Outfit, sans-serif' }}>
            <Navbar />

            <main className="responsive-section grid-responsive" style={{ paddingTop: '120px', paddingBottom: '80px' }}>
                {/* Left: Images */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div style={{ backgroundColor: '#0A0A0A', borderRadius: '32px', padding: '20px', border: '1px solid #111', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px', height: 'fit-content' }}>
                        <img src={product.image} alt={product.name} style={{ maxWidth: '100%', maxHeight: '500px', objectFit: 'contain' }} />
                    </div>
                </div>

                {/* Right: Info */}
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                        <span style={{ backgroundColor: 'rgba(255,87,34,0.1)', color: '#FF5722', padding: '6px 15px', borderRadius: '30px', fontSize: '0.7rem', fontWeight: 'bold', letterSpacing: '1px' }}>{product.category}</span>
                        {product.badge && <span style={{ backgroundColor: '#FF5722', color: 'white', padding: '6px 15px', borderRadius: '30px', fontSize: '0.7rem', fontWeight: 'bold' }}>{product.badge}</span>}
                    </div>

                    <h1 style={{ fontSize: 'clamp(2rem, 6vw, 3.5rem)', fontWeight: '900', marginBottom: '1rem', lineHeight: '1.1' }}>{product.name}</h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                        <div style={{ color: '#FFD700', fontSize: '1.1rem' }}>{"★".repeat(product.rating)}{"☆".repeat(5 - product.rating)}</div>
                        <span style={{ color: '#666', fontSize: '0.8rem' }}>(Review Verified)</span>
                    </div>

                    <div style={{ marginBottom: '2.5rem' }}>
                        <span style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: '900', color: '#FF5722' }}>₹{product.price}</span>
                        <p style={{ color: '#666', marginTop: '5px', fontSize: '0.9rem' }}>Tax included. Shipping calculated at checkout.</p>
                    </div>

                    {/* Size Selector */}
                    {product.category !== 'Accessories' && availableSizes.length > 0 && (
                        <div style={{ marginBottom: '3rem' }}>
                            <h4 style={{ fontSize: '0.9rem', color: '#666', marginBottom: '15px' }}>AVAILABLE SIZES</h4>
                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                {availableSizes.map(size => (
                                    <button
                                        key={size}
                                        onClick={() => setSelectedSize(size)}
                                        style={{
                                            padding: '12px 25px',
                                            borderRadius: '12px',
                                            border: '1px solid',
                                            borderColor: selectedSize === size ? '#FF5722' : '#333',
                                            backgroundColor: selectedSize === size ? '#FF5722' : 'transparent',
                                            color: selectedSize === size ? 'white' : '#AAA',
                                            fontWeight: 'bold',
                                            cursor: 'pointer',
                                            transition: '0.3s'
                                        }}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div style={{ marginBottom: '3rem', backgroundColor: '#0A0A0A', padding: '2rem', borderRadius: '24px', border: '1px solid #111' }}>
                        <h4 style={{ color: '#fff', marginBottom: '1rem', letterSpacing: '1px' }}>DESCRIPTION</h4>
                        <p style={{ color: '#AAA', lineHeight: '1.8', fontSize: '1rem' }}>
                            {product.description || "Premium quality motorcycle gear engineered for performance and safety. Designed with high-grade materials to ensure maximum protection and ventilation."}
                        </p>
                    </div>

                    <button
                        onClick={handleAddToCart}
                        style={{ backgroundColor: '#FF5722', color: 'white', border: 'none', padding: '20px 40px', borderRadius: '16px', fontSize: '1.2rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
                        <span style={{ fontSize: '1.5rem' }}>🛒</span> ADD TO YOUR BAG
                    </button>

                    {/* Size Chart Section */}
                    {product.category !== 'Accessories' && product.sizeChart && (
                        <div style={{ marginTop: '4rem', paddingTop: '3rem', borderTop: '1px solid #111' }}>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                📐 SIZE GUIDE
                            </h3>
                            <div style={{ backgroundColor: '#FFF', borderRadius: '24px', padding: '20px' }}>
                                <img src={product.sizeChart} alt="Size Chart" style={{ width: '100%', height: 'auto', borderRadius: '12px' }} />
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Recommendations or similar products could go here */}

            <Footer />
        </div>
    )
}

export default ProductDetails
