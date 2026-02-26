// src/styles/design-system.ts

export const COLORS = {
    primary: {
        DEFAULT: '#1A237E', // deep navy
        light: '#E8EAF6',
    },
    accent: {
        DEFAULT: '#FF6F00', // amber
        light: '#FFF3E0',
    },
    success: {
        DEFAULT: '#2E7D32',
        light: '#E8F5E9',
    },
    warning: {
        DEFAULT: '#F57F17',
        light: '#FFFDE7',
    },
    error: {
        DEFAULT: '#C62828',
        light: '#FFEBEE',
    },
    grey: {
        50: '#FAFAFA',
        100: '#F5F5F5',
        200: '#EEEEEE',
        300: '#E0E0E0',
        400: '#BDBDBD',
        500: '#9E9E9E',
        600: '#757575',
        700: '#616161',
        800: '#424242',
        900: '#212121',
    },
    white: '#FFFFFF',
    black: '#000000',
};

export const TYPOGRAPHY = {
    fontFamily: '"Inter", sans-serif',
    sizes: {
        xs: '11px',
        sm: '13px',
        base: '15px',
        md: '17px',
        lg: '20px',
        xl: '24px',
        '2xl': '30px',
        '3xl': '36px',
    },
    weights: {
        regular: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
    },
    lineHeight: 1.5,
};

export const SPACING = {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
    '3xl': '64px',
};

export const BORDER_RADIUS = {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    full: '9999px', // pills
};

export const SHADOWS = {
    sm: '0 1px 3px rgba(0,0,0,0.08)',
    md: '0 4px 12px rgba(0,0,0,0.10)',
    lg: '0 8px 24px rgba(0,0,0,0.12)',
    xl: '0 16px 48px rgba(0,0,0,0.14)',
};
