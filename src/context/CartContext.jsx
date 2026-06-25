import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(() => {
        const savedCart = localStorage.getItem('ng_cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });

    useEffect(() => {
        localStorage.setItem('ng_cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = (product) => {
        setCart(prevCart => {
            const exists = prevCart.find(item => item.id === product.id && item.selectedSize === product.selectedSize);
            if (exists) {
                return prevCart.map(item =>
                    (item.id === product.id && item.selectedSize === product.selectedSize)
                        ? { ...item, quantity: (item.quantity || 1) + 1 }
                        : item
                );
            }
            return [...prevCart, { ...product, quantity: 1 }];
        });
        alert(`${product.name} ${product.selectedSize ? `(${product.selectedSize})` : ''} added to cart!`);
    };

    const removeFromCart = (productId, selectedSize) => {
        setCart(prevCart => prevCart.filter(item => !(item.id === productId && item.selectedSize === selectedSize)));
    };

    const clearCart = () => {
        setCart([]);
    };

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
