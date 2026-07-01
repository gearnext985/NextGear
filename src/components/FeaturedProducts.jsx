import React, { useState, useEffect } from 'react'
import { db } from '../firebase'
import { collection, getDocs, query, limit } from 'firebase/firestore'
import { useCart } from '../context/CartContext'

const ProductCard = ({ product }) => {
    const { addToCart } = useCart();
    return (
        <div
            style={{
                backgroundColor: '#1A1A1A',
                borderRadius: '20px',
                padding: '1.5rem',
                position: 'relative',
                border: '1px solid rgba(255,255,255,0.05)'
            }}
        >
            <div style={{ height: '200px', backgroundColor: '#111', borderRadius: '12px', overflow: 'hidden', marginBottom: '1rem', position: 'relative' }}>
                <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                {product.stockCount > 0 && product.stockCount <= 3 && (
                    <span style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: '#FF9800', color: 'white', padding: '4px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 'bold' }}>Only {product.stockCount} left</span>
                )}
                {product.stockCount === 0 && (
                    <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ backgroundColor: '#F44336', color: 'white', padding: '5px 12px', borderRadius: '6px', fontWeight: 'bold', fontSize: '0.8rem' }}>OUT OF STOCK</span>
                    </div>
                )}
            </div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'white' }}>{product.name}</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <p style={{ color: '#FF5722', fontWeight: 'bold', fontSize: '1.2rem' }}>₹{product.price}</p>
                {product.originalPrice && <p style={{ textDecoration: 'line-through', color: '#666', fontSize: '0.9rem', fontWeight: 'bold' }}>₹{product.originalPrice}</p>}
            </div>
            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                <button
                    onClick={() => addToCart(product)}
                    disabled={product.stockCount === 0}
                    style={{
                        padding: '8px 15px',
                        borderRadius: '8px',
                        border: 'none',
                        backgroundColor: product.stockCount === 0 ? '#333' : '#FF5722',
                        color: product.stockCount === 0 ? '#666' : 'white',
                        cursor: product.stockCount === 0 ? 'not-allowed' : 'pointer',
                        fontWeight: '600'
                    }}>🛒 Add to Cart</button>
            </div>
        </div>
    )
}

const FeaturedProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const q = query(collection(db, "products"), limit(6));
                const querySnapshot = await getDocs(q);
                const productsData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                // If no products in DB, show warning in console but the site will be empty
                if (productsData.length === 0) {
                    console.log("No products found in Firestore collection 'products'");
                }

                setProducts(productsData);
            } catch (error) {
                console.error("Error fetching products: ", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    if (loading) {
        return (
            <section style={{ padding: '5rem 10%', backgroundColor: '#050505', textAlign: 'center' }}>
                <h2 style={{ color: 'white' }}>Loading amazing gear...</h2>
            </section>
        );
    }

    return (
        <section style={{ padding: '5rem 10%', backgroundColor: '#050505' }}>
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <h4 style={{ color: '#FF5722', marginBottom: '0.5rem', letterSpacing: '2px' }}>FOR THE BOLD</h4>
                <h2 style={{ fontSize: '3rem', color: 'white' }}>Featured Products</h2>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '2.5rem'
            }}>
                {products.length > 0 ? (
                    products.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))
                ) : (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', backgroundColor: '#111', borderRadius: '20px' }}>
                        <p style={{ color: '#888' }}>No products available yet. Check back soon!</p>
                    </div>
                )}
            </div>
        </section>
    )
}

export default FeaturedProducts
