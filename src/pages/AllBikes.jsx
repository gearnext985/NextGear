import { useSelector } from 'react-redux'

const AllBikes = () => {
    const bikes = useSelector(state => state.data.bikes) || []
    const loading = useSelector(state => state.data.loading)
    const isInitialized = useSelector(state => state.data.isInitialized)

    if (!isInitialized && loading) {
        return <div style={statusStyle}>Loading motorcycles...</div>
    }

    return (
        <div style={containerStyle}>
            <header style={headerStyle}>
                <Link to="/" style={backLinkStyle}>← Back to Home</Link>
                <h1 style={titleStyle}>The Full Fleet</h1>
                <p style={subtitleStyle}>{bikes.length} Models Available</p>
            </header>

            <div style={bikeGridStyle}>
                {bikes.map(bike => (
                    <Link
                        to={`/list/bike/${bike.name}`}
                        key={bike.id}
                        style={cardStyle}
                    >
                        <div style={imageContainerStyle}>
                            <img src={bike.image} alt={bike.name} style={imageStyle} />
                        </div>
                        <div style={infoStyle}>
                            <h3 style={nameStyle}>{bike.name}</h3>
                            <p style={descStyle}>{bike.description}</p>
                            <button style={viewBtnStyle}>VIEW ACCESSORIES</button>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}

const containerStyle = { backgroundColor: '#050505', minHeight: '100vh', padding: '120px 10% 60px 10%', color: 'white', fontFamily: 'Outfit, sans-serif' };
const headerStyle = { marginBottom: '60px', textAlign: 'center' };
const backLinkStyle = { color: '#666', textDecoration: 'none', fontSize: '0.9rem', marginBottom: '20px', display: 'inline-block' };
const titleStyle = { fontSize: '3rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '10px' };
const subtitleStyle = { color: '#FF5722', fontWeight: 'bold' };
const statusStyle = { textAlign: 'center', padding: '100px', color: '#666' };

const bikeGridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2.5rem' };
const cardStyle = { borderRadius: '30px', overflow: 'hidden', backgroundColor: '#0A0A0A', border: '1px solid #111', transition: '0.4s', textDecoration: 'none', display: 'block' };
const imageContainerStyle = { height: '300px', overflow: 'hidden' };
const imageStyle = { width: '100%', height: '100%', objectFit: 'cover' };
const infoStyle = { padding: '2rem' };
const nameStyle = { fontSize: '1.5rem', color: 'white', marginBottom: '1rem' };
const descStyle = { color: '#888', lineHeight: '1.6', marginBottom: '1.5rem' };
const viewBtnStyle = { background: 'transparent', border: '1px solid #FF5722', color: '#FF5722', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' };

export default AllBikes
