import React from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'

const OfferSection = () => {
    const offers = useSelector(state => state.data.offers) || [];
    const loading = useSelector(state => state.data.loading);

    if (loading || offers.length === 0) return null;

    return (
        <section style={{ padding: '4rem 10%', backgroundColor: '#050505' }}>
            <div style={{ display: 'grid', gridTemplateColumns: offers.length > 1 ? 'repeat(auto-fit, minmax(400px, 1fr))' : '1fr', gap: '2rem' }}>
                {offers.map(offer => (
                    <a
                        key={offer.id}
                        href={offer.link || '#'}
                        style={{
                            display: 'block',
                            height: '300px',
                            borderRadius: '30px',
                            overflow: 'hidden',
                            position: 'relative',
                            textDecoration: 'none'
                        }}
                    >
                        <img
                            src={offer.image}
                            alt={offer.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <div style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'linear-gradient(to right, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 60%)',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            padding: '3rem'
                        }}>
                            <h4 style={{ color: '#FF5722', marginBottom: '0.5rem', fontWeight: 'bold' }}>OFFER</h4>
                            <h2 style={{ color: 'white', fontSize: '2rem', maxWidth: '300px', lineHeight: '1.2' }}>{offer.title}</h2>
                            <button style={{
                                marginTop: '1.5rem',
                                padding: '10px 20px',
                                background: '#FF5722',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontWeight: 'bold',
                                width: 'fit-content'
                            }}>CLAIM NOW</button>
                        </div>
                    </a>
                ))}
            </div>
        </section>
    )
}

export default OfferSection
