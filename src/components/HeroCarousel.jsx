import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'

const HeroCarousel = () => {
    const slides = useSelector(state => state.data.slides);
    const loading = useSelector(state => state.data.loading);
    const [current, setCurrent] = useState(0)

    useEffect(() => {
        if (!slides || slides.length === 0) return
        const timer = setInterval(() => {
            setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1))
        }, 5000)
        return () => clearInterval(timer)
    }, [slides])

    if (loading || !slides || slides.length === 0) {
        return null
    }

    const slide = slides[current]
    if (!slide) return null;

    return (
        <div className="carousel-container" style={{
            width: '100%',
            height: '80vh',
            overflow: 'hidden',
            marginTop: '70px',
            position: 'relative'
        }}>
            <div
                key={current}
                className="responsive-section"
                style={{
                    width: '100%',
                    height: '100%',
                    backgroundImage: `linear-gradient(to right, rgba(10, 10, 10, 0.9) 20%, transparent 100%), url(${slide.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    transition: 'opacity 0.8s ease'
                }}
            >
                <div className="hero-content" style={{ maxWidth: '600px' }}>
                    <h4 style={{ color: slide.color || '#FF5722', marginBottom: '1rem', fontSize: '1.2rem' }}>{slide.title}</h4>
                    <h1 style={{ marginBottom: '1.5rem', lineHeight: '1' }}>{slide.subtitle}</h1>
                    <p style={{ color: '#A0A0A0', fontSize: '1.1rem', marginBottom: '2.5rem' }}>{slide.description}</p>
                    <button style={{ backgroundColor: slide.color || '#FF5722', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Shop Now</button>
                </div>
            </div>
            {/* Dots */}
            <div style={{ position: 'absolute', bottom: '30px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '10px' }}>
                {slides.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setCurrent(i)}
                        style={{
                            width: i === current ? '30px' : '10px',
                            height: '10px',
                            borderRadius: '5px',
                            border: 'none',
                            backgroundColor: i === current ? (slide.color || '#FF5722') : '#444',
                            cursor: 'pointer',
                            transition: '0.3s'
                        }}
                    />
                ))}
            </div>
        </div>
    )
}

export default HeroCarousel
