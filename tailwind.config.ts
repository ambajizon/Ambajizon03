import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: {
                    light: '#f6f6f8',
                    dark: '#101622',
                },
                primary: {
                    DEFAULT: 'var(--primary-color, #1A237E)',
                    light: '#E8EAF6',
                },
                accent: {
                    DEFAULT: '#FF6F00',
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
                // Storefront design tokens
                sf: {
                    bg:      '#FAFAF8',
                    surface: '#FFFFFF',
                    dark:    '#111111',
                    accent:  '#E63A2E',
                    amber:   '#F5A623',
                    text:    '#1A1A1A',
                    muted:   '#6B6560',
                    border:  'rgba(0,0,0,0.07)',
                },
                // Rupa Toys v2 design tokens
                rt: {
                    primary:       '#E8400C',
                    'primary-dark':'#B52E08',
                    accent:        '#1D6FE8',
                    bg:            '#FFFFFF',
                    surface:       '#F7F8FA',
                    text:          '#111827',
                    muted:         '#6B7280',
                    success:       '#0F9B6E',
                    sale:          '#DC2626',
                    border:        '#E5E7EB',
                    dark:          '#111827',
                },
                // Admin Dashboard design tokens (Adminty-inspired)
                dash: {
                    bg:            '#F4F6FC',
                    card:          '#FFFFFF',
                    surface:       '#F8F9FD',
                    border:        '#EAECF4',
                    primary:       '#4B44D6',
                    'primary-light':'#F0EFFF',
                    'primary-dark': '#3730A3',
                    text:          '#1E2A4A',
                    muted:         '#6B7A99',
                    icon:          '#A3AAC2',
                    success:       '#0F9B6E',
                    warning:       '#F59E0B',
                    danger:        '#EF4444',
                    info:          '#3B82F6',
                },
            },
            fontFamily: {
                sans:    ['Inter', 'sans-serif'],
                display: ['Playfair Display', 'serif'],
                body:    ['DM Sans', 'sans-serif'],
            },
            borderRadius: {
                '2xl': '16px',
                '3xl': '24px',
            },
            boxShadow: {
                card:           '0 4px 24px rgba(0,0,0,0.07)',
                'card-hover':   '0 16px 48px rgba(0,0,0,0.13)',
                'rt-card':      '0 2px 8px rgba(0,0,0,0.07)',
                'rt-card-hover':'0 8px 24px rgba(0,0,0,0.12)',
                'dash-card':    '0 2px 10px rgba(74,68,214,0.07)',
                'dash-hover':   '0 6px 20px rgba(74,68,214,0.13)',
                'dash-topbar':  '0 1px 4px rgba(0,0,0,0.06)',
                'dash-sidebar': '2px 0 8px rgba(0,0,0,0.04)',
            },
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "gradient-conic":  "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
            },
        },
    },
    plugins: [],
};
export default config;
