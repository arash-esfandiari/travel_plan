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
    const [dailyPlans, setDailyPlans] = useState([]);
    const [draggedPlan, setDraggedPlan] = useState(null);
    const [isDragging, setIsDragging] = useState(false);

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
                setDailyPlans(data.trip.daily_plans || []);
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
                setDailyPlans(data.trip.daily_plans || []);
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

    // Drag and drop handlers
    const handleDragStart = (e, plan) => {
        setDraggedPlan(plan);
        setIsDragging(true);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = async (e, targetDay) => {
        e.preventDefault();
        if (!draggedPlan) return;

        try {
            // Update local state immediately for smooth UX
            const updatedPlans = dailyPlans.map(plan => {
                if (plan.id === draggedPlan.id) {
                    return { ...plan, plan_date: targetDay };
                }
                return plan;
            });
            setDailyPlans(updatedPlans);

            // Save to database using the correct backend schema
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/trips/${tripId}/daily-plans/${draggedPlan.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    plan_date: targetDay,
                    category: draggedPlan.category,
                    title: draggedPlan.title,
                    description: draggedPlan.description || ''
                })
            });

            if (!response.ok) {
                throw new Error('Failed to update plan');
            }

            console.log('✅ Plan updated successfully');
        } catch (error) {
            console.error('❌ Error updating plan:', error);
            // Revert local state on error
            const data = await getTripById(tripId);
            setDailyPlans(data.trip.daily_plans || []);
        }

        setDraggedPlan(null);
        setIsDragging(false);
    };

    const handleDeletePlan = async (planId) => {
        try {
            // Update local state immediately
            const updatedPlans = dailyPlans.filter(plan => plan.id !== planId);
            setDailyPlans(updatedPlans);

            // Delete from database
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/trips/${tripId}/daily-plans/${planId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete plan');
            }

            console.log('✅ Plan deleted successfully');
        } catch (error) {
            console.error('❌ Error deleting plan:', error);
            // Revert local state on error
            const data = await getTripById(tripId);
            setDailyPlans(data.trip.daily_plans || []);
        }
    };

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

    // Group plans by date
    const groupedPlans = dailyPlans.reduce((acc, plan) => {
        const date = plan.plan_date;
        if (!acc[date]) {
            acc[date] = [];
        }
        acc[date].push(plan);
        return acc;
    }, {});

    // Generate all dates between start and end
    const generateDateRange = (startDate, endDate) => {
        const dates = [];
        const start = new Date(startDate);
        const end = new Date(endDate);

        for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
            dates.push(new Date(date).toISOString().split('T')[0]);
        }
        return dates;
    };

    const allDates = trip ? generateDateRange(trip.start_date, trip.end_date) : [];

    const renderPlanBubble = (plan) => {
        // Map category to appropriate emoji
        const categoryEmojis = {
            'Hotel': '🏨',
            'Restaurant': '🍽️',
            'Attraction': '🎯',
            'Comment': '💬',
            'Activity': '🎭',
            'Transportation': '🚗'
        };

        return (
            <div
                key={plan.id}
                className={`plan-bubble ${isDragging && draggedPlan?.id === plan.id ? 'dragging' : ''}`}
                draggable
                onDragStart={(e) => handleDragStart(e, plan)}
            >
                <div className="plan-content">
                    <div className="plan-main">
                        <div className="plan-category">
                            {categoryEmojis[plan.category] || '📋'} {plan.category}
                        </div>
                        <div className="plan-activity">{plan.title}</div>
                        {plan.description && <div className="plan-description">📝 {plan.description}</div>}
                    </div>
                    <button
                        className="plan-delete-btn"
                        onClick={() => handleDeletePlan(plan.id)}
                        title="Remove this plan"
                    >
                        ×
                    </button>
                </div>
            </div>
        );
    };

    const renderDaySection = (date, dayNumber) => (
        <div
            key={date}
            className={`day-section ${isDragging ? 'drop-zone' : ''}`}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, date)}
        >
            <div className="day-header">
                <h3>Day {dayNumber}</h3>
                <span className="day-date">{formatDate(date)}</span>
            </div>
            <div className="day-plans">
                {groupedPlans[date]?.length > 0 ? (
                    groupedPlans[date].map(renderPlanBubble)
                ) : (
                    <div className="empty-day">
                        <span className="empty-icon">📅</span>
                        <span className="empty-text">Drop plans here or add new ones</span>
                    </div>
                )}
            </div>
        </div>
    );

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

            <div className="trip-details-wrapper">
                {/* Left Column - Trip Info and Plans */}
                <div className="trip-details-left">
                    {/* Header with navigation */}
                    <div className="trip-header">
                        <div className="header-navigation">
                            <button className="back-button" onClick={handleGoBack}>
                                <span className="back-icon">←</span>
                                <span className="back-text">Back to Trips</span>
                            </button>

                            <button
                                className="refresh-button"
                                onClick={handleRefresh}
                                disabled={loading}
                                title="Refresh trip data"
                            >
                                {loading ? '⏳' : '🔄'}
                            </button>
                        </div>

                        <div className="trip-title-section">
                            <h1 className="trip-main-title">{trip.trip_name}</h1>
                            <div className="trip-subtitle">
                                Your personalized travel experience
                            </div>
                        </div>
                    </div>

                    {/* General Info Section */}
                    <div className="general-info-section">
                        {trip.image_url && (
                            <div className="trip-image-container">
                                <img
                                    src={`${trip.image_url}`}
                                    alt={trip.trip_name}
                                    className="trip-image"
                                />
                            </div>
                        )}

                        <div className="trip-info-grid">
                            <div className="info-card">
                                <div className="info-icon">📍</div>
                                <div className="info-content">
                                    <h3>Destination</h3>
                                    <p>{trip.city_name || trip.trip_name}</p>
                                </div>
                            </div>

                            <div className="info-card">
                                <div className="info-icon">📅</div>
                                <div className="info-content">
                                    <h3>Dates</h3>
                                    <p>{formatDate(trip.start_date)} - {formatDate(trip.end_date)}</p>
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
                                <div className="info-icon">💰</div>
                                <div className="info-content">
                                    <h3>Budget</h3>
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

                        {trip.recommendations && (
                            <div className="recommendations-section">
                                <h3>🤖 AI Recommendations</h3>
                                <TripRecommendations recommendations={trip.recommendations} />
                            </div>
                        )}
                    </div>

                    {/* Daily Plans Section */}
                    <div className="daily-plans-section">
                        <div className="section-header">
                            <h2>📅 Daily Plans</h2>
                            <p className="drag-hint">Drag plans between days or click × to remove</p>
                        </div>

                        <div className="days-container">
                            {allDates.map((date, index) => renderDaySection(date, index + 1))}
                        </div>

                        <div className="add-plan-section">
                            <DailyPlanForm
                                tripId={tripId}
                                tripStartDate={trip.start_date}
                                tripEndDate={trip.end_date}
                                onPlanAdded={(newPlan) => {
                                    setDailyPlans(prev => [...prev, newPlan]);
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Right Column - Map */}
                <div className="trip-details-right">
                    <div className="map-section">
                        <div className="map-header">
                            <h3>🗺️ Trip Map</h3>
                        </div>
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
                </div>
            </div>
        </div>
    );
};

export default TripDetails;