'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type CartItem = {
    productId: string;
    title: string;
    price: number;
    image?: string;
    quantity: number;
    category?: string;
};

type CartContextType = {
    items: CartItem[];
    addToCart: (product: any) => void;
    removeFromCart: (productId: string) => void;
    updateQuantity: (id: string, delta: number) => void;
    clearCart: () => void;
    totalItems: number;
    subtotal: number;
    discountAmount: number;
    total: number;
    applyCoupon: (code: string) => boolean;
    couponCode: string;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [discount, setDiscount] = useState(0);
    const [couponCode, setCouponCode] = useState('');
    const [isInitialized, setIsInitialized] = useState(false);

    // Load from LocalStorage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            try {
                const parsed = JSON.parse(savedCart);
                // Handle legacy format (array only) vs new format (object)
                if (Array.isArray(parsed)) {
                    setItems(parsed);
                } else {
                    setItems(parsed.items || []);
                    setDiscount(parsed.discount || 0);
                    setCouponCode(parsed.couponCode || '');
                }
            } catch (e) {
                console.error('Failed to parse cart', e);
            }
        }
        setIsInitialized(true);
    }, []);

    // Save to LocalStorage on change
    useEffect(() => {
        if (isInitialized) {
            localStorage.setItem('cart', JSON.stringify({ items, discount, couponCode }));
        }
    }, [items, discount, couponCode, isInitialized]);

    const addToCart = (product: any) => {
        setItems((prev) => {
            const existing = prev.find((item) => item.productId === product._id);
            if (existing) {
                return prev.map((item) =>
                    item.productId === product._id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [
                ...prev,
                {
                    productId: product._id,
                    title: product.title,
                    price: product.price,
                    image: product.image || product.images?.[0], // Handle various structures
                    quantity: 1,
                    category: product.category,
                },
            ];
        });
    };

    const removeFromCart = (productId: string) => {
        setItems((prev) => prev.filter((item) => item.productId !== productId));
    };

    const updateQuantity = (productId: string, delta: number) => {
        setItems((prev) =>
            prev.map((item) => {
                if (item.productId === productId) {
                    const newQty = Math.max(1, item.quantity + delta);
                    return { ...item, quantity: newQty };
                }
                return item;
            })
        );
    };

    const clearCart = () => {
        setItems([]);
        setDiscount(0);
        setCouponCode('');
    };

    const applyCoupon = (code: string) => {
        if (code.toUpperCase() === 'JAIAMBE10') {
            setDiscount(0.10); // 10%
            setCouponCode('JAIAMBE10');
            return true;
        }
        // If coupon is invalid or removed, reset discount
        setDiscount(0);
        setCouponCode('');
        return false;
    };

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discountAmount = Math.round(subtotal * discount);
    const total = subtotal - discountAmount;

    return (
        <CartContext.Provider
            value={{
                items,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                totalItems,
                subtotal,
                discountAmount,
                total,
                applyCoupon,
                couponCode,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
