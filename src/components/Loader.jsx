import React from 'react';

const Loader = () => {
    return (
        <div style={containerStyle}>
            <div style={contentStyle}>
                <div style={logoContainerStyle}>
                    <div style={gearOuterStyle}></div>
                    <div style={gearInnerStyle}></div>
                    <div style={dotStyle}></div>
                </div>
                <h2 style={textStyle}>Next Gear</h2>
                <div style={progressContainerStyle}>
                    <div style={progressBarStyle}></div>
                </div>
            </div>
        </div>
    );
};

const containerStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100vh',
    backgroundColor: '#050505',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    overflow: 'hidden'
};

const contentStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px'
};

const logoContainerStyle = {
    position: 'relative',
    width: '80px',
    height: '80px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
};

const gearOuterStyle = {
    position: 'absolute',
    width: '100%',
    height: '100%',
    border: '4px solid #FF5722',
    borderRadius: '50%',
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    animation: 'spin 2s linear infinite'
};

const gearInnerStyle = {
    position: 'absolute',
    width: '60%',
    height: '60%',
    border: '4px solid #FF5722',
    borderRadius: '50%',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    animation: 'spin-reverse 1.5s linear infinite'
};

const dotStyle = {
    width: '10px',
    height: '10px',
    backgroundColor: '#FF5722',
    borderRadius: '50%',
    boxShadow: '0 0 15px #FF5722'
};

const textStyle = {
    color: '#FF5722',
    fontSize: '1.5rem',
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: '4px',
    margin: 0,
    marginTop: '10px',
    textAlign: 'center'
};

const progressContainerStyle = {
    width: '150px',
    height: '2px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '10px',
    overflow: 'hidden',
    marginTop: '10px'
};

const progressBarStyle = {
    width: '100%',
    height: '100%',
    backgroundColor: '#FF5722',
    animation: 'loading 2s ease-in-out infinite',
    transformOrigin: 'left'
};

export default Loader;
