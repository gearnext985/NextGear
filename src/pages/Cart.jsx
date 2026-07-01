import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { db } from '../firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import GooglePayButton from '@google-pay/button-react'

const Cart = () => {
    const { cart, removeFromCart, clearCart } = useCart();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);

    // Form State
    const [customerInfo, setCustomerInfo] = useState({
        fullName: '',
        email: '',
        phone: '',
        houseApartment: '',
        streetRoad: '',
        areaLocality: '',
        cityState: '',
        pinCode: '',
        country: ''
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

    const handlePlaceOrder = async (e, isGPay = false) => {
        if (e && e.preventDefault) e.preventDefault();
        if (cart.length === 0) return;

        if (!isGPay && !paymentScreenshot) {
            alert("Please upload your payment screenshot to continue.");
            return;
        }

        setIsProcessing(true);
        try {
            const addressString = `${customerInfo.houseApartment}, ${customerInfo.streetRoad}, ${customerInfo.areaLocality}, ${customerInfo.cityState} - ${customerInfo.pinCode}, ${customerInfo.country}`;
            const orderData = {
                customer: {
                    fullName: customerInfo.fullName,
                    email: customerInfo.email,
                    phone: customerInfo.phone,
                    houseApartment: customerInfo.houseApartment,
                    streetRoad: customerInfo.streetRoad,
                    areaLocality: customerInfo.areaLocality,
                    cityState: customerInfo.cityState,
                    pinCode: customerInfo.pinCode,
                    country: customerInfo.country,
                    address: addressString
                },
                items: cart,
                total: total,
                paymentProof: isGPay ? 'GPay Verified' : paymentScreenshot,
                paymentMethod: isGPay ? 'Google Pay' : 'Manual Transfer',
                status: 'Pending',
                createdAt: serverTimestamp()
            };

            const docRef = await addDoc(collection(db, "orders"), orderData);

            // Send Email Receipts via Netlify Serverless Function
            try {
                const emailPayload = {
                    customerInfo: {
                        fullName: customerInfo.fullName,
                        email: customerInfo.email,
                        phone: customerInfo.phone
                    },
                    items: cart.map(item => ({
                        name: item.name,
                        price: item.price,
                        quantity: item.quantity || 1,
                        selectedSize: item.selectedSize || ''
                    })),
                    total: total,
                    orderId: docRef.id,
                    address: addressString,
                    paymentMethod: isGPay ? 'Google Pay' : 'Manual Transfer'
                };

                const response = await fetch('/api/send-email', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(emailPayload)
                });

                if (response.ok) {
                    console.log('Order receipts queued and sent successfully.');
                } else {
                    const errorText = await response.text();
                    console.warn('Backend returned email error:', errorText);
                }
            } catch (emailErr) {
                console.error('Failed to dispatch receipt request:', emailErr);
            }

            alert(isGPay ? "GPay Verified! Order placed successfully." : "Order placed successfully! Our team will verify and contact you soon.");
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
        <div className="Cart responsive-section" style={{ backgroundColor: '#050505', minHeight: '100vh', paddingTop: '120px', paddingBottom: '60px', color: 'white', fontFamily: 'Outfit, sans-serif' }}>
            <header style={headerStyle}>
                <Link to="/" style={backLinkStyle}>← Continue Shopping</Link>
                <h1 style={{ ...titleStyle, fontSize: 'clamp(2rem, 5vw, 3rem)' }}>Your Riding Bag</h1>
                <p style={subtitleStyle}>{cart.length} Items Selected</p>
            </header>

            {cart.length > 0 ? (
                <div className="grid-responsive" style={{ alignItems: 'start' }}>
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
                                    type="email"
                                    placeholder="Email Address"
                                    required
                                    value={customerInfo.email}
                                    onChange={e => setCustomerInfo({ ...customerInfo, email: e.target.value })}
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
                                <input
                                    type="text"
                                    placeholder="House/Flat/Apartment No., Building Name"
                                    required
                                    value={customerInfo.houseApartment}
                                    onChange={e => setCustomerInfo({ ...customerInfo, houseApartment: e.target.value })}
                                    style={{ ...inputStyle, gridColumn: '1 / -1' }}
                                />
                                <input
                                    type="text"
                                    placeholder="Street/Road Name"
                                    required
                                    value={customerInfo.streetRoad}
                                    onChange={e => setCustomerInfo({ ...customerInfo, streetRoad: e.target.value })}
                                    style={{ ...inputStyle, gridColumn: '1 / -1' }}
                                />
                                <input
                                    type="text"
                                    placeholder="Area/Locality"
                                    required
                                    value={customerInfo.areaLocality}
                                    onChange={e => setCustomerInfo({ ...customerInfo, areaLocality: e.target.value })}
                                    style={inputStyle}
                                />
                                <input
                                    type="text"
                                    placeholder="City, State"
                                    required
                                    value={customerInfo.cityState}
                                    onChange={e => setCustomerInfo({ ...customerInfo, cityState: e.target.value })}
                                    style={inputStyle}
                                />
                                <input
                                    type="text"
                                    placeholder="PIN Code"
                                    required
                                    value={customerInfo.pinCode}
                                    onChange={e => setCustomerInfo({ ...customerInfo, pinCode: e.target.value })}
                                    style={inputStyle}
                                />
                                <input
                                    type="text"
                                    placeholder="Country"
                                    required
                                    value={customerInfo.country}
                                    onChange={e => setCustomerInfo({ ...customerInfo, country: e.target.value })}
                                    style={inputStyle}
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

                        <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <hr style={{ flex: 1, border: 'none', borderTop: '1px solid #222' }} />
                                <span style={{ color: '#444', fontSize: '0.8rem', fontWeight: 'bold' }}>OR EXPRESS CHECKOUT</span>
                                <hr style={{ flex: 1, border: 'none', borderTop: '1px solid #222' }} />
                            </div>

                            {/* <GooglePayButton
                                environment="TEST"
                                paymentRequest={{
                                    apiVersion: 2,
                                    apiVersionMinor: 0,
                                    allowedPaymentMethods: [
                                        {
                                            type: 'CARD',
                                            parameters: {
                                                allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
                                                allowedCardNetworks: ['MASTERCARD', 'VISA'],
                                            },
                                            tokenizationSpecification: {
                                                type: 'PAYMENT_GATEWAY',
                                                parameters: {
                                                    gateway: 'example',
                                                    gatewayMerchantId: 'exampleGatewayMerchantId',
                                                },
                                            },
                                        },
                                    ],
                                    merchantInfo: {
                                        merchantId: '12345678901234567890',
                                        merchantName: 'Next Gear Automotive',
                                    },
                                    transactionInfo: {
                                        totalPriceStatus: 'FINAL',
                                        totalPriceLabel: 'Total',
                                        totalPrice: total.toFixed(2),
                                        currencyCode: 'INR',
                                        countryCode: 'IN',
                                    },
                                }}
                                onLoadPaymentData={paymentRequest => {
                                    console.log('load payment data', paymentRequest);
                                    // Auto-submit order with mock payment info
                                    handlePlaceOrder(null, true);
                                }}
                                style={{ width: '100%', height: '50' }}
                                buttonColor="white"
                                buttonType="checkout"
                            /> */}
                        </div>
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
const itemCardStyle = { display: 'flex', flexWrap: 'wrap', backgroundColor: '#0A0A0A', borderRadius: '24px', padding: '15px', gap: '15px', border: '1px solid #111' };
const itemImageContainer = { width: '100px', height: '100px', backgroundColor: '#111', borderRadius: '15px', overflow: 'hidden' };
const itemImageStyle = { width: '100%', height: '100%', objectFit: 'cover' };
const itemDetailsStyle = { flex: '1 1 200px', display: 'flex', flexDirection: 'column', justifyContent: 'center' };
const itemNameStyle = { fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '5px' };
const itemCategoryStyle = { color: '#666', fontSize: '0.8rem', marginBottom: '10px' };
const itemActionsStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' };
const itemPriceStyle = { fontSize: '1rem', fontWeight: 'bold', color: '#FF5722' };
const removeBtnStyle = { background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '0.8rem', textDecoration: 'underline' };
const clearBtnStyle = { alignSelf: 'flex-start', background: 'none', border: 'none', color: '#666', cursor: 'pointer', marginTop: '10px' };

const formSectionStyle = { marginTop: '30px', backgroundColor: '#0A0A0A', padding: '20px', borderRadius: '24px', border: '1px solid #111' };
const formStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' };
const inputStyle = { width: '100%', padding: '15px', borderRadius: '12px', background: '#111', border: '1px solid #222', color: 'white', fontSize: '0.9rem' };
const labelStyle = { display: 'block', color: '#666', fontSize: '0.8rem', marginBottom: '10px' };

const summaryCardStyle = { backgroundColor: '#0A0A0A', borderRadius: '30px', padding: '30px', border: '1px solid #111' };
const summaryTitleStyle = { fontSize: '1.6rem', fontWeight: 'bold', marginBottom: '30px' };
const summaryRowStyle = { display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '1rem', color: '#AAA' };
const dividerStyle = { border: 'none', borderTop: '1px solid #222', margin: '20px 0' };
const checkoutBtnStyle = { width: '100%', backgroundColor: '#FF5722', color: 'white', border: 'none', padding: '18px', borderRadius: '15px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', marginTop: '20px', transition: '0.3s' };
const secureInfoStyle = { textAlign: 'center', color: '#444', fontSize: '0.75rem', marginTop: '15px' };

const emptyStateStyle = { textAlign: 'center', padding: '100px 0' };
const emptyIconStyle = { fontSize: '5rem', marginBottom: '20px', opacity: 0.2 };
const shopNowBtnStyle = { backgroundColor: 'white', color: 'black', padding: '15px 40px', borderRadius: '15px', textDecoration: 'none', fontWeight: 'bold', display: 'inline-block' };

export default Cart
