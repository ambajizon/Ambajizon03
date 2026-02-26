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
                    DEFAULT: 'var(--primary-color, #1A237E)', // deep navy fallback
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
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "gradient-conic":
                    "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
            },
        },
    },
    plugins: [],
};
export default config;
