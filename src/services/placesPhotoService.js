import api from './api';

/**
 * Search for a place using the backend API
 * @param {string} cityName - Name of the city to search for
 * @param {Object} coordinates - Optional coordinates for more accurate results
 * @returns {Promise<Object|null>} Place details or null if not found
 */
export const searchPlace = async (cityName, coordinates = null) => {
    try {
        console.log(`🔍 Frontend: Searching for place: ${cityName}`);

        const params = { city: cityName };
        if (coordinates && coordinates.lat && coordinates.lng) {
            params.lat = coordinates.lat;
            params.lng = coordinates.lng;
        }

        const response = await api.get('/api/places/search', { params });

        if (response.data.success) {
            console.log(`✅ Frontend: Found place: ${response.data.place.name}`);
            return response.data.place;
        } else {
            console.warn(`⚠️ Frontend: No place found for: ${cityName}`);
            return null;
        }
    } catch (error) {
        console.error('❌ Frontend: Error searching for place:', error);
        return null;
    }
};

/**
 * Get the best photo for a city from the backend API
 * @param {string} cityName - Name of the city
 * @param {Object} coordinates - Optional coordinates for more accurate results
 * @param {number} maxWidth - Maximum width of the photo (default: 800)
 * @returns {Promise<string|null>} Photo URL or null if not found
 */
export const getCityPhoto = async (cityName, coordinates = null, maxWidth = 800) => {
    try {
        console.log(`📸 Frontend: Getting photo for city: ${cityName}`);

        const params = { city: cityName, maxWidth };
        if (coordinates && coordinates.lat && coordinates.lng) {
            params.lat = coordinates.lat;
            params.lng = coordinates.lng;
        }

        const response = await api.get('/api/places/photo', { params });

        if (response.data.success) {
            console.log(`✅ Frontend: Photo URL received for ${cityName}: ${response.data.photoUrl}`);
            return response.data.photoUrl;
        } else {
            console.warn(`⚠️ Frontend: No photo found for: ${cityName}`);
            return null;
        }
    } catch (error) {
        console.error('❌ Frontend: Error getting city photo:', error);
        if (error.response?.status === 404) {
            console.warn(`⚠️ Frontend: No photo found for city: ${cityName}`);
        }
        return null;
    }
};

/**
 * Get multiple photos for a city from the backend API
 * @param {string} cityName - Name of the city
 * @param {Object} coordinates - Optional coordinates for more accurate results
 * @param {number} count - Number of photos to return (default: 3)
 * @param {number} maxWidth - Maximum width of the photos (default: 800)
 * @returns {Promise<Array>} Array of photo URLs
 */
export const getCityPhotos = async (cityName, coordinates = null, count = 3, maxWidth = 800) => {
    try {
        console.log(`📸 Frontend: Getting ${count} photos for city: ${cityName}`);

        const params = { city: cityName, count, maxWidth };
        if (coordinates && coordinates.lat && coordinates.lng) {
            params.lat = coordinates.lat;
            params.lng = coordinates.lng;
        }

        const response = await api.get('/api/places/photos', { params });

        if (response.data.success) {
            console.log(`✅ Frontend: Received ${response.data.photoUrls.length} photo URLs for ${cityName}`);
            return response.data.photoUrls;
        } else {
            console.warn(`⚠️ Frontend: No photos found for: ${cityName}`);
            return [];
        }
    } catch (error) {
        console.error('❌ Frontend: Error getting city photos:', error);
        return [];
    }
};

/**
 * Get comprehensive place information including photos from the backend API
 * @param {string} cityName - Name of the city
 * @param {Object} coordinates - Optional coordinates for more accurate results
 * @returns {Promise<Object|null>} Place information with photos
 */
export const getPlaceWithPhotos = async (cityName, coordinates = null) => {
    try {
        console.log(`🏙️ Frontend: Getting comprehensive place info for: ${cityName}`);

        const params = { city: cityName };
        if (coordinates && coordinates.lat && coordinates.lng) {
            params.lat = coordinates.lat;
            params.lng = coordinates.lng;
        }

        const response = await api.get('/api/places/details', { params });

        if (response.data.success) {
            console.log(`✅ Frontend: Complete place info received for ${cityName}`);
            return response.data.place;
        } else {
            console.warn(`⚠️ Frontend: No place info found for: ${cityName}`);
            return null;
        }
    } catch (error) {
        console.error('❌ Frontend: Error getting place with photos:', error);
        return null;
    }
};

/**
 * Validate if a photo URL is accessible
 * @param {string} photoUrl - Photo URL to validate
 * @returns {Promise<boolean>} True if photo is accessible
 */
export const validatePhotoUrl = async (photoUrl) => {
    if (!photoUrl) return false;

    try {
        const response = await fetch(photoUrl, { method: 'HEAD' });
        return response.ok;
    } catch (error) {
        console.error('❌ Error validating photo URL:', error);
        return false;
    }
};

export default {
    searchPlace,
    getCityPhoto,
    getCityPhotos,
    getPlaceWithPhotos,
    validatePhotoUrl
}; 