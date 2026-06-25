import React, { useState, useEffect } from 'react'
import { db } from '../firebase'
import { collection, getDocs, addDoc, deleteDoc, doc, serverTimestamp, updateDoc } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'

const Admin = () => {
    // Data States
    const [products, setProducts] = useState([])
    const [categories, setCategories] = useState([])
    const [offers, setOffers] = useState([])
    const [brands, setBrands] = useState([])
    const [bikes, setBikes] = useState([])
    const [slides, setSlides] = useState([])
    const [orders, setOrders] = useState([])

    const [loading, setLoading] = useState(true)
    const [checkingAuth, setCheckingAuth] = useState(true)
    const [user, setUser] = useState(null)

    // Form States
    const [newProduct, setNewProduct] = useState({ name: '', price: '', image: '', badge: '', rating: 5, category: 'Helmets', targetBike: '', description: '', sizeChart: '', sizes: '' })
    const [newCategory, setNewCategory] = useState({ name: '', slug: '', image: '', count: '' })
    const [newOffer, setNewOffer] = useState({ title: '', image: '', link: '' })
    const [newBrand, setNewBrand] = useState({ name: '', logo: '' })
    const [newBike, setNewBike] = useState({ name: '', image: '', description: '' })
    const [newSlide, setNewSlide] = useState({ title: '', subtitle: '', description: '', image: '', color: '#FF5722' })

    // UI States
    const [activeTab, setActiveTab] = useState('products')
    const [isAdding, setIsAdding] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)
    const [editingItem, setEditingItem] = useState(null)  // item being edited
    const [editData, setEditData] = useState({})          // form data for edit
    const [viewingProof, setViewingProof] = useState(null) // for modal view of payment proof
    const [viewingOrder, setViewingOrder] = useState(null) // for full order details modal
    const [dateRange, setDateRange] = useState({ start: '', end: '' }) // for filtering orders

    const navigate = useNavigate()

    useEffect(() => {
        const session = localStorage.getItem('ng_admin_user')
        if (session) {
            const userData = JSON.parse(session)
            setUser(userData)
            fetchAllData()
        } else {
            navigate('/login')
        }
        setCheckingAuth(false)
    }, [navigate])

    const fetchAllData = async () => {
        setLoading(true)
        try {
            const [pSnap, cSnap, oSnap, brSnap, bkSnap, slSnap, ordSnap] = await Promise.all([
                getDocs(collection(db, "products")),
                getDocs(collection(db, "categories")),
                getDocs(collection(db, "offers")),
                getDocs(collection(db, "brands")),
                getDocs(collection(db, "bikes")),
                getDocs(collection(db, "slides")),
                getDocs(collection(db, "orders"))
            ]);

            setProducts(pSnap.docs.map(d => ({ id: d.id, ...d.data() })))
            setCategories(cSnap.docs.map(d => ({ id: d.id, ...d.data() })))
            setOffers(oSnap.docs.map(d => ({ id: d.id, ...d.data() })))
            setBrands(brSnap.docs.map(d => ({ id: d.id, ...d.data() })))
            setBikes(bkSnap.docs.map(d => ({ id: d.id, ...d.data() })))
            setSlides(slSnap.docs.map(d => ({ id: d.id, ...d.data() })))
            setOrders(ordSnap.docs.map(d => ({ id: d.id, ...d.data() })))
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    // Helper: Compress and Convert File to Base64
    const handleFileSelect = (file, callback) => {
        if (!file) return;

        setIsProcessing(true);
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
                setIsProcessing(false);
            };
        };
    };

    const handleAddItem = async (e, collectionName, itemData, resetFn) => {
        e.preventDefault()
        setIsProcessing(true)
        try {
            await addDoc(collection(db, collectionName), { ...itemData, createdAt: serverTimestamp() })
            resetFn()
            setIsAdding(false)
            fetchAllData()
        } catch (err) {
            console.error(err)
            alert("Failed to add item. Please try again.")
        } finally {
            setIsProcessing(false)
        }
    }

    const handleDelete = async (coll, id) => {
        if (window.confirm("Delete this item?")) {
            setIsProcessing(true)
            try {
                await deleteDoc(doc(db, coll, id))
                fetchAllData()
            } catch (err) {
                console.error(err)
                alert("Failed to delete item.")
            } finally {
                setIsProcessing(false)
            }
        }
    }

    const startEdit = (item) => {
        setEditingItem(item)
        setEditData({
            description: '',
            sizes: '',
            sizeChart: '',
            targetBike: '',
            badge: '',
            ...item
        })
    }

    const handleUpdateItem = async (e) => {
        e.preventDefault()
        if (!editingItem) return
        setIsProcessing(true)
        try {
            const { id, ...rest } = editData
            await updateDoc(doc(db, activeTab, editingItem.id), rest)
            setEditingItem(null)
            setEditData({})
            fetchAllData()
        } catch (err) {
            console.error(err)
        } finally {
            setIsProcessing(false)
        }
    }

    const handleUpdateOrderStatus = async (orderId, currentStatus) => {
        const nextStatus = currentStatus === 'Pending' ? 'Done' : 'Pending';
        try {
            await updateDoc(doc(db, "orders", orderId), { status: nextStatus });
            fetchAllData();
        } catch (err) {
            console.error(err);
        }
    }

    const renderForm = () => {
        switch (activeTab) {
            case 'products':
                return (
                    <form onSubmit={(e) => handleAddItem(e, "products", {
                        ...newProduct,
                        price: parseFloat(newProduct.price),
                        targetBike: newProduct.category === 'Accessories' ? newProduct.targetBike : '',
                        sizeChart: newProduct.category === 'Accessories' ? '' : newProduct.sizeChart,
                        sizes: newProduct.category === 'Accessories' ? '' : newProduct.sizes
                    }, () => setNewProduct({ name: '', price: '', image: '', badge: '', rating: 5, category: categories[0]?.name || 'Helmets', targetBike: '', description: '', sizeChart: '', sizes: '' }))}
                        style={formStyle}>
                        <input type="text" placeholder="Product Name" value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} required style={inputStyle} />
                        <input type="number" placeholder="Price" value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} required style={inputStyle} />
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={labelStyle}>{newProduct.image ? 'Image Ready ✓' : 'Pick Image from Device'}</label>
                            <input type="file" accept="image/*" onChange={e => handleFileSelect(e.target.files[0], base64 => setNewProduct({ ...newProduct, image: base64 }))} style={inputStyle} />
                        </div>

                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={labelStyle}>Product Category</label>
                            <select value={newProduct.category} onChange={e => setNewProduct({ ...newProduct, category: e.target.value })} style={inputStyle}>
                                {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                            </select>
                        </div>
                        {
                            newProduct.category === 'Accessories' && (
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <label style={labelStyle}>Link to Bike (Select Motorcycle)</label>
                                    <select value={newProduct.targetBike} onChange={e => setNewProduct({ ...newProduct, targetBike: e.target.value })} style={inputStyle}>
                                        <option value="">-- Multiple / Generic --</option>
                                        {bikes.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                                    </select>
                                </div>
                            )
                        }
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={labelStyle}>Product Description (Visible on Details Page)</label>
                            <textarea rows="3" value={newProduct.description} onChange={e => setNewProduct({ ...newProduct, description: e.target.value })} style={{ ...inputStyle, fontFamily: 'inherit' }} />
                        </div>
                        {
                            newProduct.category !== 'Accessories' && (
                                <>
                                    <div style={{ gridColumn: '1 / -1' }}>
                                        <label style={labelStyle}>Available Sizes (Comma separated, e.g. S, M, L, XL)</label>
                                        <input type="text" value={newProduct.sizes} onChange={e => setNewProduct({ ...newProduct, sizes: e.target.value })} placeholder="S, M, L, XL" style={inputStyle} />
                                    </div>
                                    <div style={{ gridColumn: '1 / -1' }}>
                                        <label style={labelStyle}>{newProduct.sizeChart ? 'Size Chart Ready ✓' : 'Upload Size Chart Image'}</label>
                                        <input type="file" accept="image/*" onChange={e => handleFileSelect(e.target.files[0], base64 => setNewProduct({ ...newProduct, sizeChart: base64 }))} style={inputStyle} />
                                    </div>
                                </>
                            )
                        }
                        <button type="submit" disabled={isProcessing || !newProduct.image} style={btnStyle}>{isProcessing ? 'Processing...' : 'Save Product'}</button>
                    </form >
                )
            case 'categories':
                return (
                    <form onSubmit={(e) => handleAddItem(e, "categories", { ...newCategory, slug: newCategory.name.toLowerCase().replace(/\s+/g, '-') }, () => setNewCategory({ name: '', slug: '', image: '', count: '' }))}
                        style={formStyle}>
                        <input type="text" placeholder="Category Name" value={newCategory.name} onChange={e => setNewCategory({ ...newCategory, name: e.target.value })} required style={inputStyle} />
                        <input type="text" placeholder="Item Count" value={newCategory.count} onChange={e => setNewCategory({ ...newCategory, count: e.target.value })} style={inputStyle} />
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={labelStyle}>{newCategory.image ? 'Image Ready ✓' : 'Pick Category Image'}</label>
                            <input type="file" accept="image/*" onChange={e => handleFileSelect(e.target.files[0], base64 => setNewCategory({ ...newCategory, image: base64 }))} style={inputStyle} />
                        </div>
                        <button type="submit" disabled={isProcessing || !newCategory.image} style={btnStyle}>{isProcessing ? 'Processing...' : 'Save Category'}</button>
                    </form>
                )
            case 'offers':
                return (
                    <form onSubmit={(e) => handleAddItem(e, "offers", newOffer, () => setNewOffer({ title: '', image: '', link: '' }))}
                        style={formStyle}>
                        <input type="text" placeholder="Offer Title" value={newOffer.title} onChange={e => setNewOffer({ ...newOffer, title: e.target.value })} required style={inputStyle} />
                        <input type="text" placeholder="Link (Optional)" value={newOffer.link} onChange={e => setNewOffer({ ...newOffer, link: e.target.value })} style={inputStyle} />
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={labelStyle}>{newOffer.image ? 'Image Ready ✓' : 'Pick Banner Image'}</label>
                            <input type="file" accept="image/*" onChange={e => handleFileSelect(e.target.files[0], base64 => setNewOffer({ ...newOffer, image: base64 }))} style={inputStyle} />
                        </div>
                        <button type="submit" disabled={isProcessing || !newOffer.image} style={btnStyle}>{isProcessing ? 'Processing...' : 'Save Offer'}</button>
                    </form>
                )
            case 'brands':
                return (
                    <form onSubmit={(e) => handleAddItem(e, "brands", newBrand, () => setNewBrand({ name: '', logo: '' }))}
                        style={formStyle}>
                        <input type="text" placeholder="Brand Name" value={newBrand.name} onChange={e => setNewBrand({ ...newBrand, name: e.target.value })} required style={inputStyle} />
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={labelStyle}>{newBrand.logo ? 'Logo Ready ✓' : 'Pick Brand Logo'}</label>
                            <input type="file" accept="image/*" onChange={e => handleFileSelect(e.target.files[0], base64 => setNewBrand({ ...newBrand, logo: base64 }))} style={inputStyle} />
                        </div>
                        <button type="submit" disabled={isProcessing || !newBrand.logo} style={btnStyle}>{isProcessing ? 'Processing...' : 'Save Brand'}</button>
                    </form>
                )
            case 'bikes':
                return (
                    <form onSubmit={(e) => handleAddItem(e, "bikes", newBike, () => setNewBike({ name: '', image: '', description: '' }))}
                        style={formStyle}>
                        <input type="text" placeholder="Bike Name" value={newBike.name} onChange={e => setNewBike({ ...newBike, name: e.target.value })} required style={inputStyle} />
                        <input type="text" placeholder="Description" value={newBike.description} onChange={e => setNewBike({ ...newBike, description: e.target.value })} style={inputStyle} />
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={labelStyle}>{newBike.image ? 'Image Ready ✓' : 'Pick Bike Image'}</label>
                            <input type="file" accept="image/*" onChange={e => handleFileSelect(e.target.files[0], base64 => setNewBike({ ...newBike, image: base64 }))} style={inputStyle} />
                        </div>
                        <button type="submit" disabled={isProcessing || !newBike.image} style={btnStyle}>{isProcessing ? 'Processing...' : 'Save Bike'}</button>
                    </form>
                )
            case 'slides':
                return (
                    <form onSubmit={(e) => handleAddItem(e, "slides", newSlide, () => setNewSlide({ title: '', subtitle: '', description: '', image: '', color: '#FF5722' }))}
                        style={formStyle}>
                        <input type="text" placeholder="Title (e.g. UP TO 30% OFF)" value={newSlide.title} onChange={e => setNewSlide({ ...newSlide, title: e.target.value })} required style={inputStyle} />
                        <input type="text" placeholder="Subtitle (e.g. ON ALL HELMETS)" value={newSlide.subtitle} onChange={e => setNewSlide({ ...newSlide, subtitle: e.target.value })} required style={inputStyle} />
                        <div style={{ gridColumn: '1 / -1' }}>
                            <input type="text" placeholder="Description text" value={newSlide.description} onChange={e => setNewSlide({ ...newSlide, description: e.target.value })} style={inputStyle} />
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={labelStyle}>{newSlide.image ? 'Image Ready ✓' : 'Pick Slide Background Image'}</label>
                            <input type="file" accept="image/*" onChange={e => handleFileSelect(e.target.files[0], base64 => setNewSlide({ ...newSlide, image: base64 }))} style={inputStyle} />
                        </div>
                        <div>
                            <label style={labelStyle}>Accent Color</label>
                            <input type="color" value={newSlide.color} onChange={e => setNewSlide({ ...newSlide, color: e.target.value })} style={{ ...inputStyle, height: '50px', cursor: 'pointer' }} />
                        </div>
                        <button type="submit" disabled={isProcessing || !newSlide.image} style={btnStyle}>{isProcessing ? 'Processing...' : 'Save Slide'}</button>
                    </form>
                )
            default: return null;
        }
    }

    const renderList = () => {
        const data = { products, categories, offers, brands, bikes, slides, orders }[activeTab];
        const coll = activeTab;

        if (activeTab === 'orders') {
            const filteredOrders = data.filter(order => {
                if (!order.createdAt) return true;
                const orderDate = new Date(order.createdAt.seconds * 1000).toISOString().split('T')[0];
                if (dateRange.start && orderDate < dateRange.start) return false;
                if (dateRange.end && orderDate > dateRange.end) return false;
                return true;
            });

            return (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center', backgroundColor: '#0A0A0A', padding: '20px 30px', borderRadius: '20px', border: '1px solid #111', marginBottom: '15px', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ fontSize: '0.75rem', color: '#666', fontWeight: 'bold', letterSpacing: '1px' }}>QUICK FILTERS:</span>
                            <button onClick={() => { const today = new Date().toISOString().split('T')[0]; setDateRange({ start: today, end: today }); }} style={{ background: dateRange.start === dateRange.end && dateRange.start === new Date().toISOString().split('T')[0] ? '#FF5722' : '#111', border: '1px solid #222', color: 'white', padding: '6px 15px', borderRadius: '20px', fontSize: '0.7rem', cursor: 'pointer' }}>Today</button>
                            <button onClick={() => { const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]; setDateRange({ start: yesterday, end: yesterday }); }} style={{ background: dateRange.start === dateRange.end && dateRange.start === new Date(Date.now() - 86400000).toISOString().split('T')[0] ? '#FF5722' : '#111', border: '1px solid #222', color: 'white', padding: '6px 15px', borderRadius: '20px', fontSize: '0.7rem', cursor: 'pointer' }}>Yesterday</button>
                        </div>

                        <div style={{ width: '1px', height: '20px', backgroundColor: '#222', margin: '0 10px' }} />

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ fontSize: '0.75rem', color: '#666', fontWeight: 'bold', letterSpacing: '1px' }}>PICK DATES:</span>
                            <div style={{ position: 'relative' }}>
                                <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', fontSize: '0.8rem' }}>📅</span>
                                <input
                                    type="date"
                                    value={dateRange.start}
                                    onChange={e => setDateRange({ ...dateRange, start: e.target.value })}
                                    style={{ ...inputStyle, width: '160px', padding: '10px 35px 10px 15px', border: '1px solid #FF5722', backgroundColor: '#000', cursor: 'pointer' }}
                                />
                            </div>
                            <span style={{ color: '#444', fontWeight: 'bold' }}>→</span>
                            <div style={{ position: 'relative' }}>
                                <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', fontSize: '0.8rem' }}>📅</span>
                                <input
                                    type="date"
                                    value={dateRange.end}
                                    onChange={e => setDateRange({ ...dateRange, end: e.target.value })}
                                    style={{ ...inputStyle, width: '160px', padding: '10px 35px 10px 15px', border: '1px solid #FF5722', backgroundColor: '#000', cursor: 'pointer' }}
                                />
                            </div>
                        </div>

                        {(dateRange.start || dateRange.end) && (
                            <button onClick={() => setDateRange({ start: '', end: '' })} style={{ background: 'rgba(255,87,34,0.1)', border: 'none', color: '#FF5722', padding: '8px 15px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer' }}>Reset Filter</button>
                        )}
                        <span style={{ marginLeft: 'auto', color: '#666', fontSize: '0.75rem', fontWeight: 'bold' }}>{filteredOrders.length} ORDERS FOUND</span>
                    </div>

                    {filteredOrders.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)).map(order => (
                        <div key={order.id} style={{ ...listItemStyle, flexDirection: 'row', textAlign: 'left', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                    <span style={{ color: '#FF5722', fontWeight: 'bold' }}>Order #{order.id.slice(-5).toUpperCase()}</span>
                                    <span style={{ color: order.status === 'Pending' ? '#FFC107' : '#4CAF50', backgroundColor: order.status === 'Pending' ? 'rgba(255,193,7,0.1)' : 'rgba(76,175,80,0.1)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem' }}>{order.status}</span>
                                </div>
                                <h3 style={{ fontSize: '1.1rem', marginBottom: '5px' }}>{order.customer?.fullName}</h3>
                                <p style={{ color: '#666', fontSize: '0.85rem' }}>📞 {order.customer?.phone}</p>
                                <p style={{ color: '#666', fontSize: '0.85rem', marginBottom: '15px' }}>📍 {order.customer?.address}</p>

                                <div style={{ backgroundColor: '#111', padding: '10px', borderRadius: '8px' }}>
                                    {order.items?.map((item, i) => (
                                        <div key={i} style={{ fontSize: '0.8rem', color: '#aaa', display: 'flex', justifyContent: 'space-between', marginBottom: '5px', padding: '5px 0', borderBottom: i < order.items.length - 1 ? '1px solid #1a1a1a' : 'none' }}>
                                            <span>
                                                <span style={{ color: 'white' }}>{item.name}</span>
                                                {(item.selectedSize || item.sizes) ? (
                                                    <span style={{ marginLeft: '8px', color: '#FF5722', fontWeight: 'bold' }}>
                                                        [{item.selectedSize || item.sizes}]
                                                    </span>
                                                ) : (
                                                    item.category !== 'Accessories' && <span style={{ marginLeft: '8px', color: '#ff0000', fontSize: '0.6rem' }}>[SIZE MISSING]</span>
                                                )}
                                                <span style={{ marginLeft: '5px', color: '#666' }}>x {item.quantity || 1}</span>
                                            </span>
                                            <span style={{ fontWeight: 'bold' }}>₹{item.price}</span>
                                        </div>
                                    ))}
                                    <div style={{ borderTop: '1px solid #222', marginTop: '8px', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                                        <span>Total</span>
                                        <span style={{ color: '#FF5722' }}>₹{order.total?.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            <div style={{ width: '150px', marginLeft: '20px', textAlign: 'center' }}>
                                <label style={{ ...labelStyle, marginBottom: '5px' }}>Payment Proof</label>
                                <div onClick={() => setViewingProof(order.paymentProof)} style={{ cursor: 'pointer', position: 'relative' }}>
                                    <img src={order.paymentProof} alt="Payment" style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #222' }} />
                                    <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: '0.3s' }} onMouseEnter={e => e.currentTarget.style.opacity = 1} onMouseLeave={e => e.currentTarget.style.opacity = 0}>
                                        <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>VIEW</span>
                                    </div>
                                </div>
                                <div style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <button onClick={() => setViewingOrder(order)} style={{ ...btnStyle, backgroundColor: '#333', color: 'white', border: '1px solid #444', padding: '8px', fontSize: '0.75rem' }}>
                                        View Full Order
                                    </button>
                                    <button onClick={() => handleUpdateOrderStatus(order.id, order.status)} disabled={isProcessing} style={{ ...btnStyle, backgroundColor: order.status === 'Pending' ? '#4CAF50' : '#666', padding: '8px', fontSize: '0.75rem', opacity: isProcessing ? 0.5 : 1 }}>
                                        {isProcessing ? 'Updating...' : `Mark as ${order.status === 'Pending' ? 'Done' : 'Pending'}`}
                                    </button>
                                    <button onClick={() => handleDelete('orders', order.id)} disabled={isProcessing} style={{ ...deleteBtnStyle, width: '100%', opacity: isProcessing ? 0.5 : 1 }}>Delete</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )
        }

        return (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                {data.map(item => (
                    <div key={item.id} style={listItemStyle}>
                        <img src={item.image || item.logo} alt="" style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }} />
                        <div style={{ flex: 1 }}>
                            <h3 style={{ fontSize: '1rem' }}>{item.name || item.title}</h3>
                            <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', marginTop: '4px' }}>
                                <p style={{ color: '#FF5722', fontWeight: 'bold', fontSize: '0.9rem' }}>{item.price ? `₹${item.price}` : item.slug || item.count || item.description}</p>
                                {item.category && <span style={{ fontSize: '0.6rem', color: '#666', border: '1px solid #333', padding: '1px 5px', borderRadius: '4px' }}>{item.category}</span>}
                                {item.targetBike && <span style={{ fontSize: '0.6rem', color: '#FF5722', background: 'rgba(255,87,34,0.1)', padding: '1px 5px', borderRadius: '4px' }}>{item.targetBike}</span>}
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={() => startEdit(item)} disabled={isProcessing} style={{ ...deleteBtnStyle, backgroundColor: 'rgba(33,150,243,0.15)', color: '#2196F3', border: '1px solid rgba(33,150,243,0.3)', opacity: isProcessing ? 0.5 : 1 }}>Edit</button>
                            <button onClick={() => handleDelete(coll, item.id)} disabled={isProcessing} style={{ ...deleteBtnStyle, opacity: isProcessing ? 0.5 : 1 }}>Delete</button>
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    if (checkingAuth) return null
    if (!user) return null
    if (loading) return <div style={{ background: '#050505', height: '100vh', color: 'white', padding: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>Loading NG Dashboard...</h2>
            <p style={{ color: '#666' }}>Securely retrieving your fleet data</p>
        </div>
    </div>

    return (
        <div style={{ backgroundColor: '#050505', minHeight: '100vh', color: 'white', fontFamily: 'Outfit, sans-serif' }}>
            <nav style={{ padding: '1.5rem 5%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #111' }}>
                <h1 style={{ fontSize: '1.2rem', fontWeight: '900' }}>NEXT GEAR <span style={{ color: '#FF5722' }}>ADMIN</span></h1>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                    <span style={{ color: '#666', fontSize: '0.8rem' }}>{user?.email}</span>
                    <button onClick={() => { localStorage.removeItem('ng_admin_user'); navigate('/login'); }} style={{ background: 'none', border: '1px solid #333', color: 'white', padding: '5px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>Logout</button>
                </div>
            </nav>

            <main style={{ padding: '2rem 5%' }}>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem', overflowX: 'auto', paddingBottom: '10px' }}>
                    {['products', 'categories', 'offers', 'brands', 'bikes', 'slides', 'orders'].map(t => (
                        <button key={t} onClick={() => { setActiveTab(t); setIsAdding(false); }}
                            style={{ ...tabBtnStyle, color: activeTab === t ? '#FF5722' : '#555', borderBottom: activeTab === t ? '2px solid #FF5722' : 'none' }}>
                            {t.toUpperCase()}
                        </button>
                    ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.5rem' }}>Dynamic {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h2>
                    {activeTab !== 'orders' && (
                        <button onClick={() => setIsAdding(!isAdding)} style={addBtnStyle}>{isAdding ? 'Cancel' : `+ Add ${activeTab.slice(0, -1)}`}</button>
                    )}
                </div>

                {isAdding && renderForm()}
                {renderList()}
            </main>

            {/* Edit Modal */}
            {editingItem && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <div style={{ backgroundColor: '#111', borderRadius: '24px', padding: '40px', width: '100%', maxWidth: '600px', border: '1px solid #222', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                            <h2 style={{ color: 'white', fontSize: '1.4rem', fontWeight: 'bold' }}>Edit {activeTab.slice(0, -1)}</h2>
                            <button onClick={() => setEditingItem(null)} style={{ background: 'none', border: 'none', color: '#666', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
                        </div>
                        <form onSubmit={handleUpdateItem} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                            {Object.keys(editData).filter(k => k !== 'id' && k !== 'createdAt').map(key => {
                                // Dynamic visibility control
                                if (key === 'sizeChart' && editData.category === 'Accessories') return null;
                                if (key === 'sizes' && editData.category === 'Accessories') return null;
                                if (key === 'targetBike' && editData.category !== 'Accessories') return null;

                                return (
                                    <div key={key} style={{ gridColumn: ['description', 'image', 'logo', 'title', 'subtitle', 'sizes', 'sizeChart'].includes(key) ? '1 / -1' : 'auto' }}>
                                        <label style={labelStyle}>{key === 'sizeChart' ? 'Size Chart (Image)' : key.charAt(0).toUpperCase() + key.slice(1)}</label>
                                        {['image', 'logo', 'sizeChart'].includes(key) ? (
                                            <div>
                                                {editData[key] && <img src={editData[key]} alt="" style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '8px', marginBottom: '8px', display: 'block' }} />}
                                                <input type="file" accept="image/*" onChange={e => handleFileSelect(e.target.files[0], base64 => setEditData({ ...editData, [key]: base64 }))} style={inputStyle} />
                                            </div>
                                        ) : key === 'color' ? (
                                            <input type="color" value={editData[key] || '#FF5722'} onChange={e => setEditData({ ...editData, [key]: e.target.value })} style={{ ...inputStyle, height: '50px', cursor: 'pointer' }} />
                                        ) : key === 'isAccessory' ? (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 0' }}>
                                                <input type="checkbox" checked={!!editData[key]} onChange={e => setEditData({ ...editData, isAccessory: e.target.checked })} style={{ width: '20px', height: '20px' }} />
                                                <span style={{ color: '#aaa', fontSize: '0.85rem' }}>Is Accessory</span>
                                            </div>
                                        ) : (
                                            <input type="text" value={editData[key] || ''} onChange={e => setEditData({ ...editData, [key]: e.target.value })} style={inputStyle} />
                                        )}
                                    </div>
                                );
                            })}
                            <button type="submit" disabled={isProcessing} style={{ ...btnStyle, gridColumn: '1 / -1', marginTop: '10px' }}>{isProcessing ? 'Saving...' : 'Save Changes'}</button>
                        </form>
                    </div>
                </div>
            )}
            {/* Payment Proof Preview Modal */}
            {viewingProof && (
                <div
                    onClick={() => setViewingProof(null)}
                    style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.95)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', cursor: 'zoom-out' }}
                >
                    <button
                        onClick={() => setViewingProof(null)}
                        style={{ position: 'absolute', top: '30px', right: '30px', background: 'none', border: 'none', color: 'white', fontSize: '2rem', cursor: 'pointer' }}
                    >✕</button>
                    <img
                        src={viewingProof}
                        alt="Payment Proof Full"
                        style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: '12px', boxShadow: '0 0 50px rgba(0,0,0,0.5)', cursor: 'default' }}
                        onClick={e => e.stopPropagation()}
                    />
                </div>
            )}

            {/* Full Order Details Modal */}
            {viewingOrder && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <div style={{ backgroundColor: '#050505', borderRadius: '32px', border: '1px solid #222', width: '100%', maxWidth: '900px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 50px 100px rgba(0,0,0,0.8)' }}>
                        <div style={{ padding: '30px 40px', borderBottom: '1px solid #111', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0A0A0A' }}>
                            <div>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: 'white', marginBottom: '5px' }}>ORDER DETAILS</h2>
                                <p style={{ color: '#FF5722', fontWeight: 'bold', fontSize: '0.9rem' }}>ID: {viewingOrder.id.toUpperCase()}</p>
                                <p style={{ color: '#666', fontSize: '0.8rem' }}>Placed on: {viewingOrder.createdAt ? new Date(viewingOrder.createdAt.seconds * 1000).toLocaleString() : 'N/A'}</p>
                            </div>
                            <button onClick={() => setViewingOrder(null)} style={{ background: '#111', border: '1px solid #222', color: '#666', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
                        </div>

                        <div style={{ flex: 1, overflowY: 'auto', padding: '40px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '40px' }}>
                                <div>
                                    <h4 style={{ color: '#666', fontSize: '0.8rem', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '20px' }}>ITEMS IN BAG</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                        {viewingOrder.items?.map((item, i) => (
                                            <div key={i} style={{ display: 'flex', gap: '20px', alignItems: 'center', backgroundColor: '#0A0A0A', padding: '15px', borderRadius: '16px', border: '1px solid #111' }}>
                                                <img src={item.image} alt="" style={{ width: '80px', height: '80px', objectFit: 'contain', borderRadius: '12px', backgroundColor: '#000' }} />
                                                <div style={{ flex: 1 }}>
                                                    <h5 style={{ color: 'white', fontSize: '0.95rem', fontWeight: '900' }}>{item.name}</h5>
                                                    <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                                                        <span style={{ color: '#666', fontSize: '0.75rem', border: '1px solid #222', padding: '2px 8px', borderRadius: '4px' }}>{item.category}</span>
                                                        {(item.selectedSize || item.sizes) ? (
                                                            <span style={{ color: 'white', backgroundColor: '#FF5722', fontSize: '0.75rem', fontWeight: 'bold', padding: '2px 8px', borderRadius: '4px' }}>
                                                                SIZE: {item.selectedSize || item.sizes}
                                                            </span>
                                                        ) : (
                                                            item.category !== 'Accessories' && <span style={{ color: 'white', backgroundColor: '#ff0000', fontSize: '0.75rem', fontWeight: 'bold', padding: '2px 8px', borderRadius: '4px' }}>NO SIZE FOUND</span>
                                                        )}
                                                    </div>
                                                    <p style={{ color: '#aaa', fontWeight: 'bold', marginTop: '8px', fontSize: '0.85rem' }}>₹{item.price} x {item.quantity || 1}</p>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <p style={{ color: 'white', fontWeight: '900' }}>₹{item.price * (item.quantity || 1)}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div style={{ marginTop: '30px', padding: '20px', borderRadius: '20px', backgroundColor: 'rgba(255,87,34,0.05)', border: '1px solid rgba(255,87,34,0.1)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                            <span style={{ color: '#666' }}>Subtotal</span>
                                            <span style={{ color: 'white' }}>₹{viewingOrder.total}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                            <span style={{ color: '#666' }}>Shipping</span>
                                            <span style={{ color: '#4CAF50' }}>FREE</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px', paddingTop: '15px', borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: '1.4rem', fontWeight: '900' }}>
                                            <span style={{ color: 'white' }}>Total Amount</span>
                                            <span style={{ color: '#FF5722' }}>₹{viewingOrder.total}</span>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <div style={{ marginBottom: '30px' }}>
                                        <h4 style={{ color: '#666', fontSize: '0.8rem', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '20px' }}>CUSTOMER INFO</h4>
                                        <div style={{ backgroundColor: '#0A0A0A', padding: '20px', borderRadius: '20px', border: '1px solid #111' }}>
                                            <p style={{ color: 'white', fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '10px' }}>{viewingOrder.customer?.fullName}</p>
                                            <p style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '5px' }}>📞 {viewingOrder.customer?.phone}</p>
                                            <p style={{ color: '#666', fontSize: '0.85rem', lineHeight: '1.6' }}>📍 {viewingOrder.customer?.address}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 style={{ color: '#666', fontSize: '0.8rem', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '20px' }}>PAYMENT PROOF</h4>
                                        <div
                                            onClick={() => setViewingProof(viewingOrder.paymentProof)}
                                            style={{ backgroundColor: '#0A0A0A', padding: '10px', borderRadius: '20px', border: '1px solid #111', cursor: 'zoom-in', position: 'relative' }}
                                        >
                                            <img src={viewingOrder.paymentProof} alt="Payment" style={{ width: '100%', borderRadius: '15px', border: '1px solid #222' }} />
                                            <div style={{ position: 'absolute', inset: '10px', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: '0.3s' }} onMouseEnter={e => e.currentTarget.style.opacity = 1} onMouseLeave={e => e.currentTarget.style.opacity = 0}>
                                                <span style={{ color: 'white', fontWeight: 'bold', fontSize: '0.8rem' }}>CLICK TO ENLARGE</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style={{ padding: '30px 40px', borderTop: '1px solid #111', backgroundColor: '#0A0A0A', display: 'flex', gap: '20px' }}>
                            <button
                                onClick={() => { handleUpdateOrderStatus(viewingOrder.id, viewingOrder.status); setViewingOrder(null); }}
                                disabled={isProcessing}
                                style={{ ...btnStyle, flex: 1, backgroundColor: viewingOrder.status === 'Pending' ? '#4CAF50' : '#666', height: '50px' }}
                            >
                                {isProcessing ? 'Updating...' : `Mark as ${viewingOrder.status === 'Pending' ? 'Delivered / Completed' : 'Pending Verification'}`}
                            </button>
                            <button
                                onClick={() => setViewingOrder(null)}
                                style={{ ...btnStyle, flex: 1, backgroundColor: '#111', border: '1px solid #222', color: '#666', height: '50px' }}
                            >Close Details</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

const formStyle = { backgroundColor: '#0A0A0A', padding: '2rem', borderRadius: '20px', marginBottom: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', border: '1px solid #111' };
const inputStyle = { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #222', backgroundColor: '#000', color: 'white', fontSize: '0.8rem' };
const labelStyle = { display: 'block', marginBottom: '8px', color: '#666', fontSize: '0.75rem' };
const btnStyle = { gridColumn: '1 / -1', background: '#FF5722', color: 'white', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' };
const tabBtnStyle = { background: 'none', border: 'none', padding: '10px 5px', fontWeight: 'bold', fontSize: '0.8rem', cursor: 'pointer', letterSpacing: '1px' };
const addBtnStyle = { background: '#FF5722', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: '800', cursor: 'pointer', fontSize: '0.8rem' };
const listItemStyle = { background: '#0A0A0A', padding: '1rem', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', border: '1px solid #111', textAlign: 'center' };
const deleteBtnStyle = { background: 'rgba(255,255,255,0.05)', border: '1px solid #222', color: '#444', padding: '5px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.7rem' };

export default Admin
