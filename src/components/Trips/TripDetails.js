// src/components/Trips/TripDetails.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTripById } from '../../services/tripService';
import { createBulkDailyPlans } from '../../services/dailyPlanService';
import { getTripWeatherForecast } from '../../services/weatherApi'; // Use the new efficient function
import DailyPlanList from '../DailyPlan/DailyPlanList';
import DailyPlanForm from '../DailyPlan/DailyPlanForm';
import TripMap from './TripMap';
import TripRecommendations from './TripRecommendations';
import GeneratingTrip from './GeneratingTrip';
import SmartTripImage from '../Shared/SmartTripImage';
import { formatDate } from '../../utils/formatDate';

import './TripDetails.css';



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
    const [weatherData, setWeatherData] = useState(null); // Keep as null

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

                // Filter out any undefined/null plans and log the filtering process
                const rawPlans = data.trip.daily_plans || [];
                console.log('🔍 Raw plans from backend:', rawPlans);

                const validPlans = rawPlans.filter((plan, index) => {
                    const isValid = plan && typeof plan === 'object' && plan.plan_date;
                    if (!isValid) {
                        console.warn(`⚠️ Filtering out invalid plan at index ${index}:`, plan);
                    }
                    return isValid;
                });

                console.log('✅ Valid plans after filtering:', validPlans);
                setDailyPlans(validPlans);
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

    // Fetch weather for all visible dates
    useEffect(() => {
        const fetchTripWeather = async () => {
            setWeatherData(null);

            if (trip && trip.latitude && trip.longitude) {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const startDate = new Date(trip.start_date);
                const endDate = new Date(trip.end_date);

                const daysUntilTrip = Math.ceil((startDate - today) / (1000 * 60 * 60 * 24));

                if (daysUntilTrip < 0 || daysUntilTrip > 14) {
                    setWeatherData({});
                    return;
                }

                const requiredDates = [];
                for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
                    requiredDates.push(date.toISOString().split('T')[0]);
                }
                const duration = requiredDates.length;

                try {
                    const weatherMap = await getTripWeatherForecast(trip.latitude, trip.longitude, duration, requiredDates);
                    setWeatherData(weatherMap || {});
                } catch (error) {
                    console.error('❌ Error fetching trip weather data:', error);
                    setWeatherData({});
                }
            }
        };

        fetchTripWeather();
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

                // Filter out any undefined/null plans and log the filtering process
                const rawPlans = data.trip.daily_plans || [];
                console.log('🔍 Raw plans from backend (refresh):', rawPlans);

                const validPlans = rawPlans.filter((plan, index) => {
                    const isValid = plan && typeof plan === 'object' && plan.plan_date;
                    if (!isValid) {
                        console.warn(`⚠️ Filtering out invalid plan at index ${index} (refresh):`, plan);
                    }
                    return isValid;
                });

                console.log('✅ Valid plans after filtering (refresh):', validPlans);
                setDailyPlans(validPlans);
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
            const response = await fetch(`${process.env.REACT_APP_BACKEND_API_URL || 'http://localhost:5001'}/api/trips/${tripId}/daily-plans/${draggedPlan.id}`, {
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
            const validPlans = (data.trip.daily_plans || []).filter(plan =>
                plan && typeof plan === 'object' && plan.plan_date
            );
            setDailyPlans(validPlans);
        }

        setDraggedPlan(null);
        setIsDragging(false);
    };

    const handleParseToDailyPlans = async (parsedItems) => {
        try {
            console.log('🔄 handleParseToDailyPlans called with:', {
                itemsCount: parsedItems.length,
                tripId
            });

            if (!parsedItems || parsedItems.length === 0) {
                console.warn('⚠️ No parsed items to create');
                return [];
            }

            // De-duplicate against existing plans before creating new ones
            console.log('🔍 Filtering out plans that already exist in the state...');
            const existingPlans = new Set(
                dailyPlans.map(plan => {
                    const date = plan.plan_date.split('T')[0];
                    const title = plan.title.toLowerCase().trim();
                    return `${date}|${title}`;
                })
            );

            const newPlansToCreate = parsedItems.filter(item => {
                const date = item.plan_date.split('T')[0];
                const title = item.title.toLowerCase().trim();
                const key = `${date}|${title}`;
                return !existingPlans.has(key);
            });

            if (newPlansToCreate.length === 0) {
                console.log('✅ No new plans to add. All items are already in the daily plan.');
                alert('All recommended plans have already been added.');
                return [];
            }

            console.log(`✅ Found ${newPlansToCreate.length} truly new plans to create.`);

            // Prepare plans for bulk creation
            const plansToCreate = newPlansToCreate.map(item => ({
                plan_date: item.plan_date,
                category: item.category,
                title: item.title,
                description: item.description || ''
            }));

            // Create plans in bulk
            const newPlans = await createBulkDailyPlans(tripId, plansToCreate);

            if (!newPlans || newPlans.length === 0) {
                console.warn('⚠️ API returned empty result after bulk create.');
                return [];
            }

            // Update local state and refresh
            setDailyPlans(prev => [...prev, ...newPlans]);
            await handleRefresh();

            console.log('✅ handleParseToDailyPlans completed successfully');
            return newPlans;
        } catch (error) {
            console.error('❌ Error in handleParseToDailyPlans:', error);
            alert(`Failed to create daily plans: ${error.message || 'Unknown error'}`);
            throw error;
        }
    };

    const handleDeletePlan = async (planId) => {
        try {
            // Update local state immediately
            const updatedPlans = dailyPlans.filter(plan => plan.id !== planId);
            setDailyPlans(updatedPlans);

            // Delete from database
            const response = await fetch(`${process.env.REACT_APP_BACKEND_API_URL || 'http://localhost:5001'}/api/trips/${tripId}/daily-plans/${planId}`, {
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
            const validPlans = (data.trip.daily_plans || []).filter(plan =>
                plan && typeof plan === 'object' && plan.plan_date
            );
            setDailyPlans(validPlans);
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

    // Group plans by date with robust error handling
    const getGroupedPlans = () => {
        console.log('🔍 Processing dailyPlans for grouping:', dailyPlans);
        console.log('📊 DailyPlans array length:', dailyPlans?.length);

        if (!Array.isArray(dailyPlans)) {
            console.warn('⚠️ dailyPlans is not an array:', dailyPlans);
            return {};
        }

        return dailyPlans.reduce((acc, plan) => {
            console.log(`📋 Processing plan for grouping:`, plan);

            if (!plan || !plan.plan_date) {
                console.warn(`⚠️ Invalid plan or missing plan_date:`, plan);
                return acc;
            }

            // Normalize the date to 'YYYY-MM-DD' format to handle both date strings and timestamps
            const date = plan.plan_date.split('T')[0];

            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push(plan);
            return acc;
        }, {});
    };

    const groupedPlans = getGroupedPlans();

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
                title={plan.title} // Tooltip is useful for long, truncated titles
            >
                <div className="plan-content">
                    <div className="plan-main">
                        <div className="plan-category">
                            {categoryEmojis[plan.category] || '📋'}
                        </div>
                        <div className="plan-activity">{plan.title}</div>
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

    const renderDaySection = (date, dayNumber) => {
        const dateKey = date.split('T')[0];
        const dayWeather = weatherData ? weatherData[dateKey] : null;

        return (
            <div
                key={dateKey}
                className={`day-section ${isDragging ? 'drop-zone' : ''}`}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, dateKey)}
            >
                <div className="day-header">
                    <div className="day-title">
                        {dayWeather ? (
                            <div className="weather-display" title={`${dayWeather.weather}, ${dayWeather.temperature.min}°C - ${dayWeather.temperature.max}°C`}>
                                <img src={dayWeather.icon} alt={dayWeather.weather} className="weather-icon" />
                                <span className="weather-temp">{Math.round(dayWeather.temperature.avg)}°C</span>
                            </div>
                        ) : (
                            <div className="weather-display placeholder">
                                <span className="weather-icon">--</span>
                                <span className="weather-temp">--°C</span>
                            </div>
                        )}
                        <h3>Day {dayNumber}</h3>
                    </div>
                    <span className="day-date">{formatDate(dateKey)}</span>
                </div>
                <div className="day-plans">
                    {groupedPlans[dateKey]?.length > 0 ? (
                        groupedPlans[dateKey].map(renderPlanBubble)
                    ) : (
                        <div className="empty-day">
                            <span className="empty-icon">📅</span>
                            <span className="empty-text">Drop plans here or add new ones</span>
                        </div>
                    )}
                </div>
            </div>
        );
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
                        <div className="trip-image-container">
                            <SmartTripImage
                                trip={trip}
                                alt={trip.trip_name}
                                className="trip-image"
                            />
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
                                <TripRecommendations
                                    recommendations={trip.recommendations}
                                    trip={trip}
                                    onParseToDailyPlans={handleParseToDailyPlans}
                                />
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
                                    console.log('🎯 onPlanAdded called with:', newPlan);
                                    console.log('🔍 newPlan type:', typeof newPlan);
                                    console.log('🔍 newPlan has plan_date:', newPlan?.plan_date);

                                    if (!newPlan || typeof newPlan !== 'object') {
                                        console.error('❌ Invalid newPlan received:', newPlan);
                                        return;
                                    }

                                    if (!newPlan.plan_date) {
                                        console.error('❌ newPlan missing plan_date:', newPlan);
                                        return;
                                    }

                                    setDailyPlans(prev => {
                                        console.log('📋 Previous plans:', prev);
                                        const updated = [...prev, newPlan];
                                        console.log('📋 Updated plans:', updated);
                                        return updated;
                                    });
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