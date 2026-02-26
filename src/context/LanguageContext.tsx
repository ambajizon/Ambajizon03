'use client';

import React, { createContext, useContext, useState } from 'react';

type Language = 'en' | 'gu';

const dictionary = {
    en: {
        home: 'Home',
        search: 'Search',
        cart: 'Cart',
        orders: 'My Orders',
        liveDarshan: 'Live Darshan',
        newArrivals: 'New Arrivals',
        shopByCategory: 'Shop by Category',
        addToCart: 'Add to Cart',
        buyNow: 'Buy Now'
    },
    gu: {
        home: 'ઘર',
        search: 'શોધો',
        cart: 'થેલી',
        orders: 'ઓર્ડર',
        liveDarshan: 'જીવંત દર્શન',
        newArrivals: 'નવું આગમન',
        shopByCategory: 'શ્રેણી મુજબ ખરીદો',
        addToCart: 'થેલીમાં ઉમેરો',
        buyNow: 'હવે ખરીદો'
    }
};

type LanguageContextType = {
    lang: Language;
    setLang: (l: Language) => void;
    t: (key: keyof typeof dictionary.en) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [lang, setLang] = useState<Language>('en');

    const t = (key: keyof typeof dictionary.en) => {
        return dictionary[lang][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ lang, setLang, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
