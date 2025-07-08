// src/components/Trips/TripDetails.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTripById } from '../../services/tripService';
import DailyPlanList from '../DailyPlan/DailyPlanList';
import DailyPlanForm from '../DailyPlan/DailyPlanForm';
import TripMap from './TripMap';
import TripRecommendations from './TripRecommendations';
import { formatDate } from '../../utils/formatDate';
import './TripDetails.css';

// Component for the trip creation loading state
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
    const navigate = useNavigate();
    const [trip, setTrip] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [mapCenter, setMapCenter] = useState(null);
    const [refreshPlans, setRefreshPlans] = useState(false);
    const [activeSection, setActiveSection] = useState('overview');
    const [showMap, setShowMap] = useState(false);

    // Animated emojis for floating background
    const floatingEmojis = ['✈️', '🗺️', '🏛️', '🌍', '🎒', '📸', '🏖️', '🗽', '🎡', '🏰'];

    useEffect(() => {
        console.log('🔍 TripDetails: Fetching trip details for ID:', tripId);
        const fetchTripDetails = async () => {
            try {
                setLoading(true);
                const data = await getTripById(tripId);
                console.log('✅ TripDetails: Trip data received:', data);
                setTrip(data.trip);
                setError(null);
            } catch (error) {
                console.error('❌ TripDetails: Error fetching trip details:', error);
                setError('Failed to load trip details. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        if (tripId) {
            fetchTripDetails();
        }
    }, [tripId]);

    useEffect(() => {
        if (trip) {
            const lat = parseFloat(trip.latitude);
            const lng = parseFloat(trip.longitude);
            if (!isNaN(lat) && !isNaN(lng)) {
                setMapCenter({ lat, lng });
                console.log('📍 TripDetails: Map center set to:', { lat, lng });
            } else {
                setMapCenter({ lat: 40.7128, lng: -74.0060 }); // Default to NYC
                console.log('📍 TripDetails: Using default coordinates (NYC)');
            }
        }
    }, [trip]);

    const handleGoBack = () => {
        navigate('/trips');
    };

    const handleRefresh = async () => {
        console.log('🔄 TripDetails: Refreshing trip data...');
        const fetchTripDetails = async () => {
            try {
                setLoading(true);
                const data = await getTripById(tripId);
                setTrip(data.trip);
                setError(null);
                console.log('✅ TripDetails: Trip refreshed successfully');
            } catch (error) {
                console.error('❌ TripDetails: Error refreshing trip:', error);
                setError('Failed to refresh trip details.');
            } finally {
                setLoading(false);
            }
        };
        await fetchTripDetails();
    };

    const sectionTabs = [
        { id: 'overview', label: 'Overview', icon: '🏠' },
        { id: 'recommendations', label: 'AI Recommendations', icon: '🤖' },
        { id: 'plans', label: 'Daily Plans', icon: '📅' },
        { id: 'map', label: 'Map View', icon: '🗺️' }
    ];

    // Loading state with beautiful design
    if (loading) {
        return (
            <div className="trip-details-page">
                {/* Floating decorative icons */}
                {floatingEmojis.map((emoji, index) => (
                    <div
                        key={index}
                        className={`floating-emoji floating-emoji-${index + 1}`}
                        style={{ animationDelay: `${index * 0.5}s` }}
                    >
                        <span>{emoji}</span>
                    </div>
                ))}

                <div className="trip-details-container">
                    <div className="loading-state">
                        <div className="loading-emoji-container">
                            <div className="loading-emoji">🧳</div>
                        </div>
                        <h2>Loading Your Adventure</h2>
                        <p>Preparing your trip details...</p>
                        <div className="loading-progress">
                            <div className="progress-bar">
                                <div className="progress-fill"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="trip-details-page">
                {floatingEmojis.map((emoji, index) => (
                    <div
                        key={index}
                        className={`floating-emoji floating-emoji-${index + 1}`}
                        style={{ animationDelay: `${index * 0.5}s` }}
                    >
                        <span>{emoji}</span>
                    </div>
                ))}

                <div className="trip-details-container">
                    <div className="error-state">
                        <div className="error-icon">⚠️</div>
                        <h2>Oops! Something went wrong</h2>
                        <p>{error}</p>
                        <div className="error-actions">
                            <button className="retry-btn" onClick={handleRefresh}>
                                🔄 Try Again
                            </button>
                            <button className="back-btn" onClick={handleGoBack}>
                                ← Back to Trips
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!trip) {
        return (
            <div className="trip-details-page">
                <div className="trip-details-container">
                    <div className="not-found-state">
                        <div className="not-found-icon">🔍</div>
                        <h2>Trip Not Found</h2>
                        <p>The trip you're looking for doesn't exist or may have been removed.</p>
                        <button className="back-btn" onClick={handleGoBack}>
                            ← Back to Trips
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const attractions = trip.attractions || [
        { key: 'attraction1', name: 'Main Attraction', location: { lat: mapCenter?.lat + 0.01 || 40.7128, lng: mapCenter?.lng + 0.01 || -74.0060 } },
        { key: 'attraction2', name: 'Secondary Attraction', location: { lat: mapCenter?.lat - 0.01 || 40.7028, lng: mapCenter?.lng - 0.01 || -74.0160 } },
    ];

    const renderSectionContent = () => {
        switch (activeSection) {
            case 'overview':
                return (
                    <div className="section-content overview-content">
                        <div className="trip-header-card">
                            {trip.image_url && (
                                <div className="trip-image-container">
                                    <img
                                        src={`${trip.image_url}`}
                                        alt={trip.trip_name}
                                        className="trip-image"
                                    />
                                    <div className="image-overlay">
                                        <div className="trip-title-overlay">
                                            <h1>{trip.trip_name}</h1>
                                            <div className="trip-dates">
                                                📅 {formatDate(trip.start_date)} - {formatDate(trip.end_date)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="trip-info-grid">
                            <div className="info-card">
                                <div className="info-icon">📍</div>
                                <div className="info-content">
                                    <h3>Destination</h3>
                                    <p>{trip.city_name || trip.trip_name}</p>
                                </div>
                            </div>

                            <div className="info-card">
                                <div className="info-icon">👥</div>
                                <div className="info-content">
                                    <h3>Travelers</h3>
                                    <p>{trip.number_of_people} {trip.number_of_people === 1 ? 'Person' : 'People'}</p>
                                </div>
                            </div>

                            <div className="info-card">
                                <div className="info-icon">🎭</div>
                                <div className="info-content">
                                    <h3>Travel Style</h3>
                                    <p>{trip.travel_style || 'Not specified'}</p>
                                </div>
                            </div>

                            <div className="info-card">
                                <div className="info-icon">💰</div>
                                <div className="info-content">
                                    <h3>Budget Range</h3>
                                    <p>{trip.budget_range || 'Not specified'}</p>
                                </div>
                            </div>
                        </div>

                        {trip.description && (
                            <div className="description-card">
                                <h3>✨ About This Trip</h3>
                                <p>{trip.description}</p>
                            </div>
                        )}

                        {trip.interests && (
                            <div className="interests-card">
                                <h3>🎯 Your Interests</h3>
                                <div className="interests-tags">
                                    {typeof trip.interests === 'string' ?
                                        <span className="interest-tag">{trip.interests}</span> :
                                        Array.isArray(trip.interests) ?
                                            trip.interests.map((interest, index) => (
                                                <span key={index} className="interest-tag">{interest}</span>
                                            )) :
                                            <span className="interest-tag">Adventure & Exploration</span>
                                    }
                                </div>
                            </div>
                        )}
                    </div>
                );

            case 'recommendations':
                return (
                    <div className="section-content recommendations-content">
                        {trip.recommendations ? (
                            <TripRecommendations recommendations={trip.recommendations} />
                        ) : (
                            <div className="no-recommendations">
                                <div className="no-rec-icon">🤖</div>
                                <h3>No AI Recommendations Yet</h3>
                                <p>AI recommendations will appear here once they're generated for your trip.</p>
                            </div>
                        )}
                    </div>
                );

            case 'plans':
                return (
                    <div className="section-content plans-content">
                        <DailyPlanList
                            tripId={tripId}
                            tripStartDate={trip.start_date}
                            tripEndDate={trip.end_date}
                            latitude={mapCenter?.lat}
                            longitude={mapCenter?.lng}
                            refresh={refreshPlans}
                        />
                        <DailyPlanForm
                            tripId={tripId}
                            tripStartDate={trip.start_date}
                            tripEndDate={trip.end_date}
                            onPlanAdded={() => setRefreshPlans(!refreshPlans)}
                        />
                    </div>
                );

            case 'map':
                return (
                    <div className="section-content map-content">
                        {mapCenter ? (
                            <div className="map-container">
                                <TripMap center={mapCenter} attractions={attractions} />
                            </div>
                        ) : (
                            <div className="no-map">
                                <div className="no-map-icon">🗺️</div>
                                <h3>Map Unavailable</h3>
                                <p>Location coordinates are not available for this trip.</p>
                            </div>
                        )}
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="trip-details-page">
            {/* Floating decorative icons */}
            {floatingEmojis.map((emoji, index) => (
                <div
                    key={index}
                    className={`floating-emoji floating-emoji-${index + 1}`}
                    style={{ animationDelay: `${index * 0.5}s` }}
                >
                    <span>{emoji}</span>
                </div>
            ))}

            <div className="trip-details-container">
                {/* Header with navigation */}
                <div className="trip-header">
                    <div className="header-navigation">
                        <button className="back-button" onClick={handleGoBack}>
                            <span className="back-icon">←</span>
                            <span className="back-text">Back to Trips</span>
                        </button>

                        <div className="header-actions">
                            <button
                                className="refresh-button"
                                onClick={handleRefresh}
                                disabled={loading}
                                title="Refresh trip data"
                            >
                                {loading ? '⏳' : '🔄'}
                            </button>
                        </div>
                    </div>

                    <div className="trip-title-section">
                        <h1 className="trip-main-title">{trip.trip_name}</h1>
                        <div className="trip-subtitle">
                            Your personalized travel experience
                        </div>
                    </div>
                </div>

                {/* Section Navigation Tabs */}
                <div className="section-tabs">
                    {sectionTabs.map((tab, index) => (
                        <button
                            key={tab.id}
                            className={`section-tab ${activeSection === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveSection(tab.id)}
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            <span className="tab-icon">{tab.icon}</span>
                            <span className="tab-label">{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Main Content Area */}
                <div className="main-content">
                    {renderSectionContent()}
                </div>
            </div>
        </div>
    );
};

export default TripDetails;