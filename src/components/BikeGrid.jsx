import React from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'

const BikeGrid = () => {
    const bikes = useSelector(state => state.data.bikes) || [];
    const loading = useSelector(state => state.data.loading);

    if (loading || bikes.length === 0) return null;

    return (
        <section style={{ padding: '8rem 10%', backgroundColor: '#0A0A0A' }}>
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <h4 style={{ color: '#FF5722', letterSpacing: '4px', marginBottom: '1rem' }}>FEATURED BIKES</h4>
                <h2 style={{ fontSize: '3rem', color: 'white', fontWeight: '900' }}>DOMINATE THE ROAD</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2.5rem' }}>
                {bikes.slice(0, 5).map(bike => (
                    <Link
                        to={`/list/bike/${bike.name}`}
                        key={bike.id}
                        style={{
                            borderRadius: '30px',
                            overflow: 'hidden',
                            backgroundColor: '#111',
                            border: '1px solid #222',
                            transition: '0.4s',
                            textDecoration: 'none',
                            display: 'block'
                        }}
                    >
                        <div style={{ height: '300px', overflow: 'hidden' }}>
                            <img src={bike.image} alt={bike.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div style={{ padding: '2rem' }}>
                            <h3 style={{ fontSize: '1.5rem', color: 'white', marginBottom: '1rem' }}>{bike.name}</h3>
                            <p style={{ color: '#888', lineHeight: '1.6', marginBottom: '1.5rem' }}>{bike.description}</p>
                            <button style={{
                                background: 'transparent',
                                border: '1px solid #FF5722',
                                color: '#FF5722',
                                padding: '10px 20px',
                                borderRadius: '8px',
                                fontWeight: 'bold',
                                cursor: 'pointer'
                            }}>VIEW ACCESSORIES</button>
                        </div>
                    </Link>
                ))}

                {bikes.length >= 6 && (
                    <Link
                        to="/all-bikes"
                        style={{
                            borderRadius: '30px',
                            overflow: 'hidden',
                            backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${bikes[5].image})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            border: '1px solid #222',
                            transition: '0.4s',
                            textDecoration: 'none',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            height: '100%',
                            minHeight: '400px'
                        }}
                    >
                        <div style={{
                            backgroundColor: 'rgba(255, 87, 34, 0.9)',
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginBottom: '1.5rem',
                            fontSize: '2rem',
                            color: 'white'
                        }}>+</div>
                        <h3 style={{ fontSize: '2rem', color: 'white', fontWeight: '900', textAlign: 'center' }}>VIEW ALL<br /><span style={{ color: '#FF5722' }}>BIKE MODELS</span></h3>
                        <p style={{ color: '#AAA', marginTop: '1rem' }}>{bikes.length - 5} More Available</p>
                    </Link>
                )}
            </div>
        </section>
    )
}

export default BikeGrid
