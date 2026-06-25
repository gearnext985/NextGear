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
            <div style={{ height: '200px', backgroundColor: '#111', borderRadius: '12px', overflow: 'hidden', marginBottom: '1rem' }}>
                <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'white' }}>{product.name}</h3>
            <p style={{ color: '#FF5722', fontWeight: 'bold', fontSize: '1.2rem' }}>₹{product.price}</p>
            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                <button
                    onClick={() => addToCart(product)}
                    style={{
                        padding: '8px 15px',
                        borderRadius: '8px',
                        border: 'none',
                        backgroundColor: '#FF5722',
                        color: 'white',
                        cursor: 'pointer',
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
