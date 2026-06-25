import React from 'react'
import { useSelector } from 'react-redux'

const BrandGrid = () => {
    const brands = useSelector(state => state.data.brands) || [];
    const loading = useSelector(state => state.data.loading);

    if (loading || brands.length === 0) return null;

    return (
        <section style={{ padding: '4rem 10%', backgroundColor: '#050505', borderTop: '1px solid #111' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h4 style={{ color: '#666', letterSpacing: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>PARTNER BRANDS</h4>
            </div>
            <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '4rem',
                opacity: '0.6'
            }}>
                {brands.map(brand => (
                    <img
                        key={brand.id}
                        src={brand.logo}
                        alt={brand.name}
                        style={{ height: '40px', filter: 'grayscale(100%) brightness(200%)' }}
                    />
                ))}
            </div>
        </section>
    )
}

export default BrandGrid
