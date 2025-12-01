/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Radha Krishna Theme Colors
                saffron: {
                    50: '#FFF8E1',
                    100: '#FFECB3',
                    200: '#FFE082',
                    300: '#FFD54F',
                    400: '#FFCA28',
                    500: '#FF9933', // Primary Saffron
                    600: '#FF8C00',
                    700: '#FF7F00',
                    800: '#FF6F00',
                    900: '#E65100',
                },
                krishna: {
                    50: '#E0F7FA',
                    100: '#B2EBF2',
                    200: '#80DEEA',
                    300: '#4DD0E1',
                    400: '#26C6DA',
                    500: '#00BFFF', // Sky Blue
                    600: '#00ACC1',
                    700: '#0097A7',
                    800: '#00838F',
                    900: '#006064',
                },
                tulsi: {
                    50: '#E8F5E9',
                    100: '#C8E6C9',
                    200: '#A5D6A7',
                    300: '#81C784',
                    400: '#66BB6A',
                    500: '#2E8B57', // Tulsi Green
                    600: '#43A047',
                    700: '#388E3C',
                    800: '#2E7D32',
                    900: '#1B5E20',
                },
                lotus: {
                    50: '#FCE4EC',
                    100: '#F8BBD0',
                    200: '#F48FB1',
                    300: '#F06292',
                    400: '#EC407A',
                    500: '#FFB6C1', // Lotus Pink
                    600: '#D81B60',
                    700: '#C2185B',
                    800: '#AD1457',
                    900: '#880E4F',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                heading: ['Playfair Display', 'serif'],
                sanskrit: ['Noto Sans Devanagari', 'sans-serif'],
            },
            animation: {
                'breathe-in': 'breatheIn 4s ease-in-out',
                'breathe-out': 'breatheOut 4s ease-in-out',
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'float': 'float 6s ease-in-out infinite',
                'ripple': 'ripple 0.6s ease-out',
                'glow': 'glow 2s ease-in-out infinite alternate',
            },
            keyframes: {
                breatheIn: {
                    '0%': { transform: 'scale(1)' },
                    '100%': { transform: 'scale(1.3)' },
                },
                breatheOut: {
                    '0%': { transform: 'scale(1.3)' },
                    '100%': { transform: 'scale(1)' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-20px)' },
                },
                ripple: {
                    '0%': { transform: 'scale(0)', opacity: '1' },
                    '100%': { transform: 'scale(4)', opacity: '0' },
                },
                glow: {
                    '0%': { boxShadow: '0 0 5px rgba(255, 153, 51, 0.5), 0 0 10px rgba(255, 153, 51, 0.3)' },
                    '100%': { boxShadow: '0 0 20px rgba(255, 153, 51, 0.8), 0 0 30px rgba(255, 153, 51, 0.5)' },
                },
            },
            backdropBlur: {
                xs: '2px',
            },
            backgroundImage: {
                'vrindavan': "url('https://images.unsplash.com/photo-1561361513-2d000a50f0dc?q=80&w=2070&auto=format&fit=crop')",
                'peacock': "url('https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?q=80&w=2069&auto=format&fit=crop')",
                'lotus': "url('https://images.unsplash.com/photo-1523678802081-8e30347f35e7?q=80&w=2010&auto=format&fit=crop')",
            },
        },
    },
    plugins: [],
}
