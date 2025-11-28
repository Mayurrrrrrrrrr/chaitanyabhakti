// Re-export from services to maintain compatibility across the app
import apiService from '../services/api';

// Determine API URL based on environment
let API_URL = process.env.REACT_APP_API_URL;

if (!API_URL) {
    // Check if we are running on an IP address or localhost
    const hostname = window.location.hostname;
    const isIpOrLocal = /^(localhost|127\.0\.0\.1|192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+)$/.test(hostname);

    if (isIpOrLocal) {
        API_URL = window.location.origin; // Use current origin (e.g., http://140.245.9.30)
    } else {
        API_URL = 'https://haribol.yuktaa.com'; // Fallback to domain
    }
}

// Sanitize API_URL (remove trailing slash and /api suffix if present)
// This prevents duplicate /api/api paths since our endpoint methods already include /api
API_URL = API_URL.replace(/\/$/, '').replace(/\/api$/, '');

console.log('Using API URL:', API_URL);

export default apiService;