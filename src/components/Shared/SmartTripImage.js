import React, { useState, useEffect } from 'react';
import { getCityPhoto } from '../../services/placesPhotoService';
import PlaceholderImage from './PlaceholderImage';
import './SmartTripImage.css';

/**
 * Smart image component that automatically fetches Google Places photos for trips
 * @param {Object} trip - Trip object containing trip details
 * @param {string} alt - Alt text for the image
 * @param {string} className - CSS class name for styling
 * @param {string} fallbackImage - Fallback image URL if no image is found
 * @param {number} maxWidth - Maximum width for Google Places photo
 */
const SmartTripImage = ({
    trip,
    alt,
    className = '',
    fallbackImage = '/assets/images/placeholder.jpg',
    maxWidth = 800
}) => {
    const [imageUrl, setImageUrl] = useState(trip.image_url || null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(false);

    useEffect(() => {
        // If trip already has an image, use it
        if (trip.image_url) {
            setImageUrl(trip.image_url);
            return;
        }

        // If no image and we have a city name, try to fetch from Google Places
        if (trip.city_name || trip.trip_name) {
            fetchCityPhoto();
        }
    }, [trip.image_url, trip.city_name, trip.trip_name]);

    const fetchCityPhoto = async () => {
        setIsLoading(true);
        setError(false);

        try {
            console.log(`🖼️ SmartTripImage: Fetching photo for ${trip.city_name || trip.trip_name}`);

            // Prepare coordinates if available
            const coordinates = (trip.latitude && trip.longitude)
                ? { lat: parseFloat(trip.latitude), lng: parseFloat(trip.longitude) }
                : null;

            // Try to get city photo
            const photoUrl = await getCityPhoto(
                trip.city_name || trip.trip_name,
                coordinates,
                maxWidth
            );

            if (photoUrl) {
                setImageUrl(photoUrl);
                console.log(`✅ SmartTripImage: Photo fetched successfully for ${trip.city_name || trip.trip_name}`);
            } else {
                console.log(`⚠️ SmartTripImage: No photo found for ${trip.city_name || trip.trip_name}`);
                setError(true);
            }
        } catch (error) {
            console.error('❌ SmartTripImage: Error fetching city photo:', error);
            setError(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageError = () => {
        console.log(`❌ SmartTripImage: Image failed to load, using fallback`);
        setError(true);
    };

    const handleImageLoad = () => {
        console.log(`✅ SmartTripImage: Image loaded successfully`);
        setError(false);
    };

    // Show loading state
    if (isLoading) {
        return (
            <div className={`smart-image-loading ${className}`}>
                <div className="loading-placeholder">
                    <div className="loading-spinner">📸</div>
                    <span>Loading photo...</span>
                </div>
            </div>
        );
    }

    // Show placeholder if error or no image found
    if (error || !imageUrl) {
        return (
            <PlaceholderImage
                cityName={trip.city_name || trip.trip_name}
                className={className}
                alt={alt}
            />
        );
    }

    // Show image
    return (
        <img
            src={imageUrl}
            alt={alt}
            className={className}
            onError={handleImageError}
            onLoad={handleImageLoad}
            loading="lazy"
        />
    );
};

export default SmartTripImage; 