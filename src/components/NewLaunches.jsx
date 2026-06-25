import React from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useSelector } from 'react-redux'

const ProductCard = ({ product }) => {
    const { addToCart } = useCart();
    return (
        <div style={cardStyle}>
            {product.badge && <span style={badgeStyle}>{product.badge}</span>}
            <Link to={`/product/${product.id}`} style={{ textDecoration: 'none' }}>
                <div style={imageContainerStyle}>
                    <img src={product.image} alt={product.name} style={productImageStyle} />
                </div>
            </Link>
            <div style={infoStyle}>
                <Link to={`/product/${product.id}`} style={{ textDecoration: 'none' }}>
                    <h3 style={productNameStyle}>{product.name}</h3>
                </Link>
                <div style={priceContainerStyle}>
                    <span style={priceStyle}>₹{product.price}</span>
                    <button onClick={() => addToCart(product)} style={cartBtnStyle}>🛒 Add</button>
                </div>
            </div>
        </div>
    )
}

const NewLaunches = () => {
    const allProducts = useSelector(state => state.data.products) || [];
    const loading = useSelector(state => state.data.loading);

    // Get latest 3 products (assuming they are sorted or simply taking top 3)
    const products = allProducts.slice(0, 3);

    if (loading || products.length === 0) return null;

    return (
        <section style={{ padding: '8rem 10%', backgroundColor: '#050505' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '5rem' }}>
                <div>
                    <h4 style={{ color: '#FF5722', letterSpacing: '4px', marginBottom: '1rem' }}>FRESH FROM THE TRACK</h4>
                    <h2 style={{ fontSize: '3.5rem', color: 'white', fontWeight: '900' }}>NEW LAUNCHES</h2>
                </div>
                <Link to="/list/category/All" style={{ color: '#FF5722', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem', border: '1px solid #FF5722', padding: '10px 25px', borderRadius: '30px' }}>VIEW ALL PRODUCTS</Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem' }}>
                {products.map(product => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </section>
    );
};

const cardStyle = { backgroundColor: '#0A0A0A', borderRadius: '30px', overflow: 'hidden', border: '1px solid #111', position: 'relative' };
const imageContainerStyle = { height: '300px', backgroundColor: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' };
const productImageStyle = { maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' };
const infoStyle = { padding: '30px' };
const productNameStyle = { fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '20px', color: 'white' };
const priceContainerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const priceStyle = { fontSize: '1.8rem', fontWeight: '900', color: '#FF5722' };
const cartBtnStyle = { backgroundColor: '#FF5722', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '15px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.9rem', letterSpacing: '0.5px' };
const badgeStyle = { position: 'absolute', top: '20px', right: '20px', backgroundColor: '#FF5722', color: 'white', padding: '6px 15px', borderRadius: '30px', fontSize: '0.8rem', fontWeight: 'bold', zIndex: 2 };

export default NewLaunches
