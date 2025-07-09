// Frontend Environment Configuration
const environment = {
    // Environment Detection
    REACT_APP_ENV: process.env.REACT_APP_ENV || 'development',
    NODE_ENV: process.env.NODE_ENV || 'development',

    // API Configuration
    api: {
        baseUrl: getApiBaseUrl(),
        backendUrl: getBackendApiUrl()
    },

    // API Keys
    apiKeys: {
        googleMaps: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || null,
        weather: process.env.REACT_APP_WEATHER_API_KEY || null
    }
};

// Helper functions for environment-specific values
function getApiBaseUrl() {
    // Always prefer the explicit backend URL env var first
    if (process.env.REACT_APP_BACKEND_API_URL) {
        return process.env.REACT_APP_BACKEND_API_URL;
    }

    // Alternative env var name
    if (process.env.REACT_APP_API_URL) {
        return process.env.REACT_APP_API_URL;
    }

    const env = process.env.REACT_APP_ENV || process.env.NODE_ENV;

    switch (env) {
        case 'local':
        case 'development':
            return 'http://localhost:5001';
        case 'production':
            // In production, we should always have REACT_APP_BACKEND_API_URL set
            // This is a fallback that should trigger a warning
            console.warn('⚠️ REACT_APP_BACKEND_API_URL not set in production environment');
            return 'http://localhost:5001';
        default:
            return 'http://localhost:5001';
    }
}

function getBackendApiUrl() {
    // Use explicit env var first, then fall back to computed value
    return process.env.REACT_APP_BACKEND_API_URL ||
        process.env.REACT_APP_API_URL ||
        getApiBaseUrl();
}

// Validation
function validateEnvironment() {
    const warnings = [];
    const errors = [];

    // Check for API keys
    if (!environment.apiKeys.googleMaps) {
        warnings.push('Google Maps API key (REACT_APP_GOOGLE_MAPS_API_KEY) is not configured');
    }

    if (!environment.apiKeys.weather) {
        warnings.push('Weather API key (REACT_APP_WEATHER_API_KEY) is not configured');
    }

    // Check for backend URL in production
    const isProduction = environment.NODE_ENV === 'production' || environment.REACT_APP_ENV === 'production';
    if (isProduction && !process.env.REACT_APP_BACKEND_API_URL && !process.env.REACT_APP_API_URL) {
        errors.push('Backend API URL (REACT_APP_BACKEND_API_URL) must be set in production');
    }

    // Log warnings
    if (warnings.length > 0) {
        console.warn('Environment configuration warnings:');
        warnings.forEach(warning => console.warn(`⚠️  ${warning}`));
    }

    // Log errors
    if (errors.length > 0) {
        console.error('Environment configuration errors:');
        errors.forEach(error => console.error(`❌ ${error}`));
        // Don't throw in production build, just warn
        if (isProduction) {
            console.error('Please set the required environment variables in your deployment platform');
        }
    }

    console.log(`🌍 Frontend Environment: ${environment.REACT_APP_ENV}`);
    console.log(`🔗 API Base URL: ${environment.api.baseUrl}`);
    console.log(`🔧 Backend API URL: ${environment.api.backendUrl}`);
}

validateEnvironment();

export default environment; 