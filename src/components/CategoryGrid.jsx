import React from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'

const CategoryGrid = () => {
    const categories = useSelector(state => state.data.categories) || [];
    const loading = useSelector(state => state.data.loading);

    if (loading || categories.length === 0) return null;

    return (
        <section id="riding-gears" style={{ padding: '8rem 10%', backgroundColor: '#0A0A0A' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '5rem' }}>
                <div>
                    <h4 style={{ color: '#FF5722', letterSpacing: '4px', marginBottom: '1rem' }}>SHOP BY CATEGORY</h4>
                    <h2 style={{ fontSize: '3rem', color: 'white', fontWeight: '900' }}>RIDING GEARS</h2>
                </div>
                <Link to="/list/category/All" style={{ color: '#FF5722', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem', border: '1px solid #FF5722', padding: '10px 25px', borderRadius: '30px' }}>VIEW ALL GEARS</Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                {categories.slice(0, 6).map((category) => (
                    <Link
                        to={`/list/category/${category.name}`}
                        key={category.id}
                        style={{
                            height: '400px',
                            borderRadius: '30px',
                            overflow: 'hidden',
                            position: 'relative',
                            cursor: 'pointer',
                            transition: '0.5s',
                            border: '1px solid rgba(255,255,255,0.05)',
                            display: 'block',
                            textDecoration: 'none'
                        }}
                    >
                        <img
                            src={category.image}
                            alt={category.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <div style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 60%)',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'flex-end',
                            padding: '2.5rem'
                        }}>
                            <h3 style={{ fontSize: '2rem', color: 'white', marginBottom: '0.5rem' }}>{category.name}</h3>
                            <p style={{ color: '#FF5722', fontWeight: 'bold', letterSpacing: '1px', fontSize: '0.8rem' }}>SHOP NOW &rarr;</p>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    )
}

export default CategoryGrid
