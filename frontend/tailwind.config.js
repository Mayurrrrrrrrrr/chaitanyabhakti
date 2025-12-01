/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Divine Yellow - Saffron/Gold Theme
                saffron: {
                    50: '#FFFBF0',
                    100: '#FFF8E1',
                    200: '#FFECB3',
                    300: '#FFE082',
                    400: '#FFD54F',
                    500: '#FFD700', // Main Divine Yellow
                    600: '#FFC107',
                    700: '#FFB300',
                    800: '#FFA000',
                    900: '#FF8F00',
                },
                // Divine Green - Tulsi Theme
                tulsi: {
                    50: '#F1F8F4',
                    100: '#E8F5E9',
                    200: '#C8E6C9',
                    300: '#A5D6A7',
                    400: '#81C784',
                    500: '#2E8B57', // Main Divine Green
                    600: '#66BB6A',
                    700: '#4CAF50',
                    800: '#43A047',
                    900: '#388E3C',
                },
                // Divine Blue - Krishna Theme
                krishna: {
                    50: '#E3F2FD',
                    100: '#BBDEFB',
                    200: '#90CAF9',
                    300: '#64B5F6',
                    400: '#42A5F5',
                    500: '#4169E1', // Main Divine Blue
                    600: '#2196F3',
                    700: '#1976D2',
                    800: '#1565C0',
                    900: '#0D47A1',
                },
                // Lotus Pink - Accent
                lotus: {
                    50: '#FCE4EC',
                    100: '#F8BBD0',
                    200: '#F48FB1',
                    300: '#F06292',
                    400: '#EC407A',
                    500: '#FFB6C1',
                    600: '#E91E63',
                    700: '#D81B60',
                    800: '#C2185B',
                    900: '#AD1457',
                },
            },
            fontFamily: {
                sans: ['Poppins', 'system-ui', 'sans-serif'],
                heading: ['Playfair Display', 'serif'],
                body: ['Poppins', 'sans-serif'],
            },
            animation: {
                'float': 'float 6s ease-in-out infinite',
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-20px)' },
                },
            },
            backdropBlur: {
                xs: '2px',
            },
        },
    },
    plugins: [],
}