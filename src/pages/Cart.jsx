import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { db } from '../firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

const Cart = () => {
    const { cart, removeFromCart, clearCart } = useCart();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);

    // Form State
    const [customerInfo, setCustomerInfo] = useState({
        fullName: '',
        phone: '',
        address: ''
    });
    const [paymentScreenshot, setPaymentScreenshot] = useState('');

    const total = cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);

    const compressImage = (file, callback) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 1200;
                const MAX_HEIGHT = 1200;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                // Compress to JPEG with 0.7 quality
                const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                callback(dataUrl);
            };
        };
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsProcessing(true);
        compressImage(file, (compressedBase64) => {
            setPaymentScreenshot(compressedBase64);
            setIsProcessing(false);
        });
    };

    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        if (cart.length === 0) return;
        if (!paymentScreenshot) {
            alert("Please upload your payment screenshot to continue.");
            return;
        }

        setIsProcessing(true);
        try {
            const orderData = {
                customer: customerInfo,
                items: cart,
                total: total,
                paymentProof: paymentScreenshot,
                status: 'Pending',
                createdAt: serverTimestamp()
            };

            await addDoc(collection(db, "orders"), orderData);
            alert("Order placed successfully! Our team will verify and contact you soon.");
            clearCart();
            navigate('/');
        } catch (err) {
            console.error("Order failed:", err);
            alert("Something went wrong. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div style={containerStyle}>
            <header style={headerStyle}>
                <Link to="/" style={backLinkStyle}>← Continue Shopping</Link>
                <h1 style={titleStyle}>Your Riding Bag</h1>
                <p style={subtitleStyle}>{cart.length} Items Selected</p>
            </header>

            {cart.length > 0 ? (
                <div style={contentStyle}>
                    <div style={itemsContainerStyle}>
                        {cart.map((item) => (
                            <div key={item.id} style={itemCardStyle}>
                                <div style={itemImageContainer}>
                                    <img src={item.image} alt={item.name} style={itemImageStyle} />
                                </div>
                                <div style={itemDetailsStyle}>
                                    <h3 style={itemNameStyle}>{item.name}</h3>
                                    <p style={itemCategoryStyle}>{item.category} {item.targetBike ? `| for ${item.targetBike}` : ''}</p>
                                    <div style={itemActionsStyle}>
                                        <span style={itemPriceStyle}>₹{item.price} x {item.quantity || 1} {item.selectedSize ? <span style={{ color: '#666', fontSize: '0.9rem', marginLeft: '10px' }}>(Size: {item.selectedSize})</span> : ''}</span>
                                        <button onClick={() => removeFromCart(item.id, item.selectedSize)} style={removeBtnStyle}>Remove</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <button onClick={clearCart} style={clearBtnStyle}>Clear Cart</button>

                        {/* Shipping Form */}
                        <div style={formSectionStyle}>
                            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', fontWeight: 'bold' }}>Shipping Details</h2>
                            <form id="orderForm" onSubmit={handlePlaceOrder} style={formStyle}>
                                <input
                                    type="text"
                                    placeholder="Full Name"
                                    required
                                    value={customerInfo.fullName}
                                    onChange={e => setCustomerInfo({ ...customerInfo, fullName: e.target.value })}
                                    style={inputStyle}
                                />
                                <input
                                    type="tel"
                                    placeholder="Phone Number"
                                    required
                                    value={customerInfo.phone}
                                    onChange={e => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                                    style={inputStyle}
                                />
                                <textarea
                                    placeholder="Full Delivery Address"
                                    required
                                    value={customerInfo.address}
                                    onChange={e => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                                    style={{ ...inputStyle, gridColumn: '1 / -1', height: '100px', resize: 'none' }}
                                />

                                <div style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
                                    <label style={labelStyle}>Attach Payment Screenshot</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        required
                                        onChange={handleFileSelect}
                                        style={inputStyle}
                                    />
                                    {paymentScreenshot && <p style={{ color: '#4CAF50', fontSize: '0.8rem', marginTop: '5px' }}>✓ Screenshot uploaded</p>}
                                </div>
                            </form>
                        </div>
                    </div>

                    <div style={summaryCardStyle}>
                        <h2 style={summaryTitleStyle}>Order Summary</h2>
                        <div style={summaryRowStyle}>
                            <span>Subtotal</span>
                            <span>₹{total.toFixed(2)}</span>
                        </div>
                        <div style={summaryRowStyle}>
                            <span>Shipping</span>
                            <span style={{ color: '#4CAF50' }}>FREE</span>
                        </div>
                        <hr style={dividerStyle} />
                        <div style={{ ...summaryRowStyle, fontSize: '1.5rem', fontWeight: '900' }}>
                            <span>Total</span>
                            <span style={{ color: '#FF5722' }}>₹{total.toFixed(2)}</span>
                        </div>
                        <button
                            type="submit"
                            form="orderForm"
                            disabled={isProcessing}
                            style={checkoutBtnStyle}
                        >
                            {isProcessing ? 'Processing Order...' : 'Place Order'}
                        </button>
                        <p style={secureInfoStyle}>📦 Our team will call you for confirmation</p>
                    </div>
                </div>
            ) : (
                <div style={emptyStateStyle}>
                    <div style={emptyIconStyle}>🛒</div>
                    <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Your bag is empty</h2>
                    <p style={{ color: '#666', marginBottom: '2rem' }}>Looks like you haven't added any gear yet.</p>
                    <Link to="/" style={shopNowBtnStyle}>Start Shopping</Link>
                </div>
            )}
        </div>
    )
}

const containerStyle = { backgroundColor: '#050505', minHeight: '100vh', padding: '120px 10% 60px 10%', color: 'white', fontFamily: 'Outfit, sans-serif' };
const headerStyle = { marginBottom: '60px', textAlign: 'center' };
const backLinkStyle = { color: '#666', textDecoration: 'none', fontSize: '0.9rem', marginBottom: '20px', display: 'inline-block' };
const titleStyle = { fontSize: '3rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '10px' };
const subtitleStyle = { color: '#FF5722', fontWeight: 'bold' };

const contentStyle = { display: 'grid', gridTemplateColumns: '1fr 350px', gap: '40px', alignItems: 'start' };
const itemsContainerStyle = { display: 'flex', flexDirection: 'column', gap: '20px' };
const itemCardStyle = { display: 'flex', backgroundColor: '#0A0A0A', borderRadius: '24px', padding: '20px', gap: '25px', border: '1px solid #111' };
const itemImageContainer = { width: '120px', height: '120px', backgroundColor: '#111', borderRadius: '15px', overflow: 'hidden' };
const itemImageStyle = { width: '100%', height: '100%', objectFit: 'cover' };
const itemDetailsStyle = { flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' };
const itemNameStyle = { fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '5px' };
const itemCategoryStyle = { color: '#666', fontSize: '0.9rem', marginBottom: '15px' };
const itemActionsStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const itemPriceStyle = { fontSize: '1.1rem', fontWeight: 'bold', color: '#FF5722' };
const removeBtnStyle = { background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '0.8rem', textDecoration: 'underline' };
const clearBtnStyle = { alignSelf: 'flex-start', background: 'none', border: 'none', color: '#666', cursor: 'pointer', marginTop: '10px' };

const formSectionStyle = { marginTop: '40px', backgroundColor: '#0A0A0A', padding: '30px', borderRadius: '24px', border: '1px solid #111' };
const formStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' };
const inputStyle = { width: '100%', padding: '15px', borderRadius: '12px', background: '#111', border: '1px solid #222', color: 'white', fontSize: '0.9rem' };
const labelStyle = { display: 'block', color: '#666', fontSize: '0.8rem', marginBottom: '10px' };

const summaryCardStyle = { backgroundColor: '#0A0A0A', borderRadius: '30px', padding: '40px', border: '1px solid #111', position: 'sticky', top: '120px' };
const summaryTitleStyle = { fontSize: '1.6rem', fontWeight: 'bold', marginBottom: '30px' };
const summaryRowStyle = { display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '1rem', color: '#AAA' };
const dividerStyle = { border: 'none', borderTop: '1px solid #222', margin: '20px 0' };
const checkoutBtnStyle = { width: '100%', backgroundColor: '#FF5722', color: 'white', border: 'none', padding: '18px', borderRadius: '15px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', marginTop: '20px', transition: '0.3s' };
const secureInfoStyle = { textAlign: 'center', color: '#444', fontSize: '0.75rem', marginTop: '15px' };

const emptyStateStyle = { textAlign: 'center', padding: '100px 0' };
const emptyIconStyle = { fontSize: '5rem', marginBottom: '20px', opacity: 0.2 };
const shopNowBtnStyle = { backgroundColor: 'white', color: 'black', padding: '15px 40px', borderRadius: '15px', textDecoration: 'none', fontWeight: 'bold', display: 'inline-block' };

export default Cart
