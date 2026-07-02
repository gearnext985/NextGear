import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useCart } from '../context/CartContext'

const ProductList = () => {
    const { type, name } = useParams()
    const { addToCart } = useCart()

    const allProducts = useSelector(state => state.data.products);
    const globalLoading = useSelector(state => state.data.loading);
    const isInitialized = useSelector(state => state.data.isInitialized);

    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedSizes, setSelectedSizes] = useState({})

    const handleSizeSelect = (productId, size) => {
        setSelectedSizes(prev => ({ ...prev, [productId]: size }))
    }

    const parseSizes = (sizes) => {
        if (typeof sizes === 'string') {
            return sizes.split(',').map(s => s.trim())
        }
        return sizes || []
    }

    useEffect(() => {
        if (!isInitialized) return;

        let filtered = allProducts ? [...allProducts] : [];

        if (name === 'All' && type !== 'accessories') {
            filtered = filtered.filter(p => p.category !== "Accessories");
        } else if (type === 'category') {
            filtered = filtered.filter(p => p.category === name && p.category !== "Accessories");
        } else if (type === 'bike') {
            filtered = filtered.filter(p => p.targetBike === name || p.targetBike === 'All Bikes');
        } else if (type === 'accessories') {
            filtered = filtered.filter(p => p.category === "Accessories");
        }

        setProducts(filtered);
        setLoading(false);
    }, [type, name, allProducts, isInitialized])

    return (
        <div className="ProductList responsive-section" style={{ backgroundColor: '#050505', minHeight: '100vh', padding: '120px 5% 60px 5%', color: 'white', fontFamily: 'Outfit, sans-serif' }}>
            {/* Header */}
            <header style={headerStyle}>
                <Link to="/" style={backLinkStyle}>← Back to Home</Link>
                <h1 style={{ ...titleStyle, fontSize: 'clamp(2rem, 5vw, 3rem)' }}>
                    {type === 'accessories' ? 'Bike Accessories' : (name === 'All' ? 'All Riding Gear' : (type === 'category' ? `Exploration: ${name}` : `Gear for ${name}`))}
                </h1>
                <p style={subtitleStyle}>{products.length} Products Found</p>
            </header>

            {/* Grid */}
            {loading ? (
                <div style={statusStyle}>Loading your gear...</div>
            ) : products.length > 0 ? (
                <div style={productGridStyle}>
                    {products.map((product) => (
                        <div key={product.id} style={cardStyle}>
                            {product.stockCount > 0 && product.stockCount <= 3 && (
                                <span style={{ position: 'absolute', top: '15px', right: '15px', backgroundColor: '#FF9800', color: 'white', padding: '5px 12px', borderRadius: '30px', fontSize: '0.7rem', fontWeight: '900', zIndex: 2 }}>Only {product.stockCount} left!</span>
                            )}
                            {product.stockCount === 0 && (
                                <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <span style={{ backgroundColor: '#F44336', color: 'white', padding: '8px 20px', borderRadius: '8px', fontWeight: 'bold' }}>OUT OF STOCK</span>
                                </div>
                            )}
                            <Link to={`/product/${product.id}`} style={{ textDecoration: 'none' }}>
                                <div style={imageContainerStyle}>
                                    <img src={product.image} alt={product.name} style={productImageStyle} />
                                </div>
                            </Link>
                            <div style={infoStyle}>
                                <div style={ratingStyle}>
                                    {"★".repeat(product.rating)}{"☆".repeat(5 - product.rating)}
                                </div>
                                <Link to={`/product/${product.id}`} style={{ textDecoration: 'none' }}>
                                    <h3 style={productNameStyle}>{product.name}</h3>
                                </Link>
                                {(product.category === 'Helmets' || product.category === 'Boots' || product.category === 'Gloves' || product.category === 'Jackets') && product.sizes && (
                                    <div style={sizeContainerStyle}>
                                        <span style={sizeLabelStyle}>Size:</span>
                                        <div style={sizeOptionsStyle}>
                                            {parseSizes(product.sizes).map((size, index) => (
                                                <span 
                                                    key={index} 
                                                    onClick={() => handleSizeSelect(product.id, size)}
                                                    style={selectedSizes[product.id] === size ? { ...sizeOptionStyle, backgroundColor: '#FF5722', borderColor: '#FF5722', cursor: 'pointer' } : { ...sizeOptionStyle, cursor: 'pointer' }}
                                                >
                                                    {size}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                <div style={priceContainerStyle}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={priceStyle}>₹{product.price}</span>
                                        {product.originalPrice && <span style={{ textDecoration: 'line-through', color: '#666', fontSize: '0.9rem', fontWeight: 'bold' }}>₹{product.originalPrice}</span>}
                                    </div>
                                    <button
                                        onClick={() => {
                                            const productWithSize = { ...product, selectedSize: selectedSizes[product.id] }
                                            addToCart(productWithSize)
                                        }}
                                        disabled={product.stockCount === 0 || ((product.category === 'Helmets' || product.category === 'Boots' || product.category === 'Gloves' || product.category === 'Jackets') && !selectedSizes[product.id])}
                                        style={product.stockCount === 0 || ((product.category === 'Helmets' || product.category === 'Boots' || product.category === 'Gloves' || product.category === 'Jackets') && !selectedSizes[product.id]) ? { ...cartBtnStyle, backgroundColor: '#333', color: '#666', cursor: 'not-allowed' } : cartBtnStyle}
                                    >Add to Cart</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={statusStyle}>
                    <p>No products found for this {type}.</p>
                    <Link to="/" style={{ color: '#FF5722', textDecoration: 'none', fontWeight: 'bold' }}>Explore Other Gear</Link>
                </div>
            )}
        </div>
    )
}

const containerStyle = { backgroundColor: '#050505', minHeight: '100vh', padding: '120px 5% 60px 5%', color: 'white', fontFamily: 'Outfit, sans-serif' };
const headerStyle = { marginBottom: '60px', textAlign: 'center' };
const backLinkStyle = { color: '#666', textDecoration: 'none', fontSize: '0.9rem', marginBottom: '20px', display: 'inline-block' };
const titleStyle = { fontSize: '2.5rem', fontWeight: '900', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '2px' };
const subtitleStyle = { color: '#FF5722', fontWeight: 'bold', letterSpacing: '1px' };
const statusStyle = { textAlign: 'center', padding: '100px', color: '#666' };

const productGridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' };
const cardStyle = { backgroundColor: '#0A0A0A', borderRadius: '24px', overflow: 'hidden', border: '1px solid #111', position: 'relative', transition: 'transform 0.3s ease' };
const imageContainerStyle = { padding: '20px', backgroundColor: '#111', height: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const productImageStyle = { maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' };
const infoStyle = { padding: '25px' };
const ratingStyle = { color: '#FFD700', fontSize: '0.8rem', marginBottom: '10px' };
const productNameStyle = { fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '15px' };
const priceContainerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const priceStyle = { fontSize: '1.5rem', fontWeight: '900', color: '#FF5722' };
const cartBtnStyle = { backgroundColor: 'white', color: 'black', border: 'none', padding: '10px 20px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' };
const sizeContainerStyle = { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' };
const sizeLabelStyle = { color: '#999', fontSize: '0.85rem', fontWeight: 'bold' };
const sizeOptionsStyle = { display: 'flex', gap: '8px', flexWrap: 'wrap' };
const sizeOptionStyle = { backgroundColor: '#1A1A1A', color: '#fff', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold', border: '1px solid #333' };

export default ProductList
