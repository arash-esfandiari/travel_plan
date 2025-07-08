// src/components/Trips/TripDetails.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getTripById } from '../../services/tripService';
import DailyPlanList from '../DailyPlan/DailyPlanList';
import DailyPlanForm from '../DailyPlan/DailyPlanForm';
import TripMap from './TripMap';
import TripRecommendations from './TripRecommendations';
import { formatDate } from '../../utils/formatDate';
import './TripDetails.css';

// A new component for the generating state
const GeneratingRecommendations = () => {
    const [currentEmoji, setCurrentEmoji] = useState(0);
    const emojis = ['✈️', '🗺️', '🌍', '🎒', '📸', '🏖️'];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentEmoji((prev) => (prev + 1) % emojis.length);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="generating-container">
            <div className="generating-content">
                <div className="generating-emoji-container">
                    <div className="generating-emoji rotating">
                        {emojis[currentEmoji]}
                    </div>
                </div>
                <h2 className="generating-title">Creating Your Dream Trip</h2>
                <div className="generating-steps">
                    <div className="generating-step">
                        <span className="step-emoji">🤖</span>
                        <span className="step-text">Analyzing your preferences...</span>
                    </div>
                    <div className="generating-step">
                        <span className="step-emoji">🎯</span>
                        <span className="step-text">Finding perfect matches...</span>
                    </div>
                    <div className="generating-step">
                        <span className="step-emoji">✨</span>
                        <span className="step-text">Crafting personalized recommendations...</span>
                    </div>
                </div>
                <div className="generating-progress">
                    <div className="progress-bar">
                        <div className="progress-bar-fill"></div>
                    </div>
                </div>
                <p className="generating-message">
                    Hold tight! We're using AI to create your perfect travel itinerary
                    <span className="generating-dots">
                        <span>.</span><span>.</span><span>.</span>
                    </span>
                </p>
            </div>
        </div>
    );
};

const TripDetails = () => {
    const { tripId } = useParams();
    const [trip, setTrip] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [mapCenter, setMapCenter] = useState(null);
    const [refreshPlans, setRefreshPlans] = useState(false);

    useEffect(() => {
        let pollingInterval;

        const fetchTripDetails = async () => {
            try {
                const data = await getTripById(tripId);
                setTrip(data.trip);
                setLoading(false);

                // If trip is in generating state, start polling
                if (data.trip.status === 'generating') {
                    pollingInterval = setInterval(async () => {
                        const updatedData = await getTripById(tripId);
                        setTrip(updatedData.trip);

                        // If status is no longer generating, stop polling
                        if (updatedData.trip.status !== 'generating') {
                            clearInterval(pollingInterval);
                        }
                    }, 3000); // Poll every 3 seconds
                }
            } catch (error) {
                console.error('Error fetching trip details:', error);
                setError('Failed to load trip details');
                setLoading(false);
            }
        };

        fetchTripDetails();

        // Cleanup polling interval
        return () => {
            if (pollingInterval) {
                clearInterval(pollingInterval);
            }
        };
    }, [tripId]);

    useEffect(() => {
        if (trip) {
            const lat = parseFloat(trip.latitude);
            const lng = parseFloat(trip.longitude);
            if (!isNaN(lat) && !isNaN(lng)) {
                setMapCenter({ lat, lng });
            } else {
                setMapCenter({ lat: 40.7128, lng: -74.0060 }); // Default to NYC if no coordinates
            }
        }
    }, [trip]);

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    if (!trip) {
        return <div className="not-found">Trip not found</div>;
    }

    // Show generating screen while trip is being generated
    if (trip.status === 'generating') {
        return <GeneratingRecommendations />;
    }

    if (!mapCenter) return <div>Loading map...</div>;

    const attractions = trip.attractions || [
        { key: 'attraction1', name: 'Attraction 1', location: { lat: mapCenter.lat + 0.01, lng: mapCenter.lng + 0.01 } },
        { key: 'attraction2', name: 'Attraction 2', location: { lat: mapCenter.lat - 0.01, lng: mapCenter.lng - 0.01 } },
    ];

    return (
        <div className="trip-details-wrapper">
            <div className="trip-details-left">
                <div className="trip-details-container">
                    <h2>{trip.trip_name}</h2>
                    {trip.image_url && (
                        <img
                            src={`${trip.image_url}`}
                            alt={trip.trip_name}
                            className="trip-image"
                        />
                    )}
                    <p>
                        <strong>Dates:</strong> {formatDate(trip.start_date)} - {formatDate(trip.end_date)}
                    </p>
                    <p>
                        <strong>Description:</strong> {trip.description}
                    </p>
                    <h3>Itinerary</h3>
                    {/* New Recommendations Section */}
                    {trip.recommendations && (
                        <TripRecommendations recommendations={trip.recommendations} />
                    )}
                    <DailyPlanList
                        tripId={tripId}
                        tripStartDate={trip.start_date}
                        tripEndDate={trip.end_date}
                        latitude={mapCenter.lat}
                        longitude={mapCenter.lng}
                        refresh={refreshPlans}
                    />
                    <DailyPlanForm
                        tripId={tripId}
                        tripStartDate={trip.start_date}
                        tripEndDate={trip.end_date}
                        onPlanAdded={() => setRefreshPlans(!refreshPlans)}
                    />
                </div>
            </div>
            <div className="trip-details-right">
                <TripMap center={mapCenter} attractions={attractions} />
            </div>
        </div>
    );
};

export default TripDetails;