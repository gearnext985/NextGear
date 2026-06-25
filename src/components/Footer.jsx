import React from 'react'
import logo from '../assets/NextGear.jpg'

const Footer = () => {
    return (
        <footer style={{ backgroundColor: '#0A0A0A', padding: '5rem 10% 2rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '4rem',
                marginBottom: '4rem'
            }}>
                <div>
                    <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                        <img src={logo} alt="NextGear" style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '8px',
                            objectFit: 'cover'
                        }} />
                        <span style={{ fontWeight: '800', fontSize: '1.2rem', letterSpacing: '1px', color: 'white' }}>
                            NEXT<span style={{ color: '#FF5722' }}>GEAR</span>
                        </span>
                    </div>
                    <p style={{ color: '#A0A0A0', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                        Premium motorcycle gear and accessories for the modern rider. Quality and safety is our priority.
                    </p>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <a href="https://www.facebook.com/p/Next-Gear-Automotive-100075989781594/" target="_blank" rel="noopener noreferrer" style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', transition: '0.3s' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="#A0A0A0"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
                        </a>
                        <a href="https://www.instagram.com/next_gear_automotive/" target="_blank" rel="noopener noreferrer" style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', transition: '0.3s' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A0A0A0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
                        </a>
                    </div>
                </div>

                <div>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', color: 'white' }}>Quick Links</h3>
                    <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', fontSize: '0.9rem', color: '#A0A0A0' }}>
                        <li>About Us</li>
                        <li>Track Order</li>
                        <li>Returns Policy</li>
                    </ul>
                </div>

            </div>

            <div style={{
                borderTop: '1px solid rgba(255,255,255,0.1)',
                paddingTop: '2rem',
                textAlign: 'center',
                color: '#A0A0A0',
                fontSize: '0.8rem'
            }}>
                <p>&copy; 2026 NEXT GEAR. All rights reserved.</p>

            </div>
        </footer>
    )
}

export default Footer
