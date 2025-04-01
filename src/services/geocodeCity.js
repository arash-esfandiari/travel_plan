// src/services/geocodeCity.js

/**
 * geocodeCity converts a city name into geographic coordinates using the Google Maps Geocoder.
 * It returns a Promise that resolves with an object containing { lat, lng }.
 */
export const geocodeCity = (cityName) => {
    return new Promise((resolve, reject) => {
        if (!window.google || !window.google.maps || typeof window.google.maps.Geocoder !== 'function') {
            reject('Google Maps API or Geocoder not loaded');
            return;
        }
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ address: cityName }, (results, status) => {
            if (status === 'OK' && results[0]) {
                const location = results[0].geometry.location;
                const coords = {
                    lat: location.lat(),
                    lng: location.lng(),
                };
                resolve(coords);
            } else {
                reject(`Geocode was not successful for ${cityName}: ${status}`);
            }
        });
    });
};