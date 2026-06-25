import React, { useState } from 'react'
import { db } from '../firebase'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'

const Login = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const handleLogin = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            // WARNING: Storing and checking credentials manually in Firestore is less secure 
            // than using Firebase Authentication (built-in hashing/salting).
            const q = query(
                collection(db, "users"),
                where("email", "==", email),
                where("password", "==", password)
            )

            const querySnapshot = await getDocs(q)

            if (!querySnapshot.empty) {
                // Success - Found a matching user
                const userData = querySnapshot.docs[0].data()

                console.log("HJLVJKDVHKJDVKJVDKJVDKJVKDJ ", JSON.stringify(userData));


                // Store session locally since we are not using Firebase Auth's persistent state
                localStorage.setItem('ng_admin_user', JSON.stringify({
                    email: userData.email,
                    role: 'admin',
                    loginTime: Date.now()
                }))

                navigate('/admin')
            } else {
                setError('Invalid email or password. Please try again.')
            }
        } catch (err) {
            setError('System error. Please try again later.')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#0A0A0A',
            color: 'white',
            fontFamily: 'Outfit, sans-serif'
        }}>
            <form onSubmit={handleLogin} style={{
                backgroundColor: '#111',
                padding: '3rem',
                borderRadius: '24px',
                width: '100%',
                maxWidth: '400px',
                border: '1px solid rgba(255, 87, 34, 0.2)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
            }}>
                <h2 style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '2rem', fontWeight: '900' }}>
                    ADMIN<span style={{ color: '#FF5722' }}> LOGIn</span>
                </h2>

                {error && <p style={{ color: '#FF3D00', backgroundColor: 'rgba(255, 61, 0, 0.1)', padding: '10px', borderRadius: '8px', fontSize: '0.8rem', marginBottom: '1.5rem', textAlign: 'center' }}>{error}</p>}

                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888', fontSize: '0.9rem' }}>Admin Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="admin@nextgear.com"
                        style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #333', backgroundColor: '#050505', color: 'white' }}
                        required
                    />
                </div>

                <div style={{ marginBottom: '2rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888', fontSize: '0.9rem' }}>Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #333', backgroundColor: '#050505', color: 'white' }}
                        required
                    />
                </div>

                <button type="submit" disabled={loading} style={{
                    width: '100%',
                    padding: '16px',
                    borderRadius: '12px',
                    border: 'none',
                    backgroundColor: loading ? '#555' : '#FF5722',
                    color: 'white',
                    fontWeight: '800',
                    fontSize: '1rem',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: '0.3s'
                }}>
                    {loading ? 'Verifying...' : 'Login'}
                </button>


            </form>
        </div>
    )
}

export default Login
