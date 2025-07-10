import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getTrips, createTripFromQuestionFlow } from '../../services/tripService';
import TripActions from './TripActions';
import { formatDate } from '../../utils/formatDate';
import QuestionFlow from '../Home/QuestionFlow';
import GeneratingTrip from './GeneratingTrip';
import SmartTripImage from '../Shared/SmartTripImage';
import './TripList.css';



const TripList = () => {
    const [trips, setTrips] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showQuestionFlow, setShowQuestionFlow] = useState(false);
    const [isCreatingTrip, setIsCreatingTrip] = useState(false);
    const [creationError, setCreationError] = useState(null);
    const [fetchError, setFetchError] = useState(null);
    const navigate = useNavigate();

    // Animated emojis for the floating icons
    const emojis = ['✈️', '🗺️', '🏛️', '🌍', '🎒', '📸', '🏖️', '🗽', '🎡', '🏰'];

    const fetchTrips = async () => {
        console.log('🔍 TripList: Starting to fetch trips...');
        try {
            setIsLoading(true);
            setFetchError(null);
            const data = await getTrips();
            console.log('✅ TripList: Trips fetched successfully:', data);
            console.log('📊 TripList: Number of trips:', data?.length || 0);

            // Log each trip for debugging
            if (data && Array.isArray(data)) {
                data.forEach((trip, index) => {
                    console.log(`Trip ${index + 1}:`, {
                        id: trip.id,
                        trip_name: trip.trip_name,
                        start_date: trip.start_date,
                        end_date: trip.end_date,
                        image_url: trip.image_url,
                        description: trip.description,
                        hasRecommendations: !!trip.recommendations
                    });
                });
            } else {
                console.warn('⚠️ TripList: Unexpected data format:', typeof data, data);
            }

            setTrips(data || []);
        } catch (error) {
            console.error('❌ TripList: Error fetching trips:', error);
            console.error('Error details:', {
                message: error.message,
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data
            });

            // Set error state and empty array
            setFetchError(error.response?.data?.error || error.message || 'Failed to load trips');
            setTrips([]);
        } finally {
            setIsLoading(false);
            console.log('🏁 TripList: Fetch operation completed');
        }
    };

    useEffect(() => {
        fetchTrips();
    }, []);

    const handleTripCreated = (newTrip) => {
        // Prepend the new trip to the list with animation
        setTrips([newTrip, ...trips]);
    };

    const handleTripDeleted = (deletedTripId) => {
        setTrips(trips.filter(trip => trip.id !== deletedTripId));
    };

    const handleQuestionFlowComplete = async (answers, destinationCoords) => {
        console.log('Question flow completed in TripList. Starting trip creation...');
        console.log('Answers received:', answers);
        console.log('Coordinates received:', destinationCoords);

        setIsCreatingTrip(true);
        setCreationError(null);

        try {
            // Debug: Check what dates we have
            console.log('Raw answers object:', answers);
            console.log('Start date from answers:', answers.startDate, typeof answers.startDate);
            console.log('End date from answers:', answers.endDate, typeof answers.endDate);

            // Handle flexible dates - convert to actual dates if needed
            let startDate = answers.startDate;
            let endDate = answers.endDate;

            // If we don't have specific dates (user chose flexible dates), create default dates
            if (!startDate || !endDate) {
                const today = new Date();
                const tomorrow = new Date(today);
                tomorrow.setDate(today.getDate() + 1);

                startDate = today.toISOString().split('T')[0]; // yyyy-MM-dd format
                endDate = tomorrow.toISOString().split('T')[0]; // yyyy-MM-dd format

                console.log('Using default dates - Start:', startDate, 'End:', endDate);
            }

            const questionFlowData = {
                destination: answers.destination,
                startDate: startDate,
                endDate: endDate,
                numberOfPeople: 1, // Default value
                preferences: answers,
                travelStyle: answers.travelStyle,
                budgetRange: answers.budget,
                interests: answers.interests,
                latitude: destinationCoords?.lat,
                longitude: destinationCoords?.lng
            };

            console.log('Preparing to create trip with data:', questionFlowData);
            console.log('Data being sent to backend:', JSON.stringify(questionFlowData, null, 2));

            // Create the trip and get the initial response
            const newTrip = await createTripFromQuestionFlow(questionFlowData);
            console.log('Trip created successfully:', newTrip);

            // Close the question flow modal
            setShowQuestionFlow(false);
            setIsCreatingTrip(false);

            // Add the new trip to the list
            handleTripCreated(newTrip);

            console.log('Navigating to trip details page...');
            // Navigate to the trip details page where the loading screen will be shown
            navigate(`/trips/${newTrip.id}`);
        } catch (error) {
            console.error('Error in trip creation:', error);
            setCreationError('Failed to create trip. Please try again.');
            setIsCreatingTrip(false);
            // Don't close the question flow on error, let user try again
        }
    };

    const handleQuestionFlowClose = () => {
        if (!isCreatingTrip) { // Only allow closing if not creating a trip
            setShowQuestionFlow(false);
            setCreationError(null);
        }
    };

    const startQuestionFlow = () => {
        setShowQuestionFlow(true);
    };

    // Show generating screen while creating trip
    if (isCreatingTrip) {
        return <GeneratingTrip />;
    }

    return (
        <div className="trips-page">
            {/* Floating decorative icons */}
            {emojis.map((emoji, index) => (
                <div
                    key={index}
                    className={`floating-emoji floating-emoji-${index + 1}`}
                    style={{ animationDelay: `${index * 0.5}s` }}
                >
                    <span>{emoji}</span>
                </div>
            ))}

            {/* Main content container */}
            <div className="trips-container">
                {/* Header Section */}
                <div className="trips-header">
                    <div className="header-content">
                        <div className="header-left">
                            <div className="header-logo">
                                <span className="logo-emoji">🗺️</span>
                                <h1 className="trips-title">Your Adventures</h1>
                            </div>
                            <p className="trips-subtitle">All your planned and completed journeys in one place</p>
                        </div>
                        <div className="header-actions">
                            <button
                                className="refresh-btn"
                                onClick={fetchTrips}
                                disabled={isLoading}
                                title="Refresh trips list"
                            >
                                {isLoading ? '⏳' : '🔄'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Create Trip Section */}
                <div className="create-trip-section">
                    <button
                        className="create-trip-btn"
                        onClick={startQuestionFlow}
                    >
                        <span className="btn-icon">+</span>
                        <span className="btn-text">Plan New Adventure</span>
                    </button>
                </div>

                {/* Trips Grid */}
                <div className="trips-content">
                    {isLoading ? (
                        <div className="loading-container">
                            <div className="loading-spinner">⏳</div>
                            <p>Loading your adventures...</p>
                        </div>
                    ) : fetchError ? (
                        <div className="error-state">
                            <div className="error-icon">⚠️</div>
                            <h3>Oops! Something went wrong</h3>
                            <p>{fetchError}</p>
                            <div className="error-actions">
                                <button
                                    className="retry-btn"
                                    onClick={fetchTrips}
                                >
                                    🔄 Try Again
                                </button>
                                <button
                                    className="create-trip-btn"
                                    onClick={startQuestionFlow}
                                >
                                    ➕ Create New Trip
                                </button>
                            </div>
                        </div>
                    ) : trips.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">🌍</div>
                            <h3>No Adventures Yet</h3>
                            <p>Start planning your first trip and create amazing memories!</p>
                            <button
                                className="empty-state-btn"
                                onClick={startQuestionFlow}
                            >
                                Create Your First Trip
                            </button>
                        </div>
                    ) : (
                        <div className="trips-grid">
                            {trips.map((trip, index) => (
                                <div
                                    key={trip.id}
                                    className="trip-card-wrapper"
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    <Link to={`/trips/${trip.id}`} className="trip-card">
                                        <div className="card-image-container">
                                            <SmartTripImage
                                                trip={trip}
                                                alt={trip.trip_name}
                                                className="trip-image"
                                            />
                                            <div className="card-overlay">
                                                <span className="view-details">View Details ➤</span>
                                            </div>
                                        </div>
                                        <div className="trip-details">
                                            <div className="trip-header">
                                                <h3 className="trip-title">{trip.trip_name}</h3>
                                                <span className="trip-status">Active</span>
                                            </div>
                                            <div className="trip-info">
                                                <div className="info-item">
                                                    <span className="info-icon">📅</span>
                                                    <span className="info-text">
                                                        {formatDate(trip.start_date)} - {formatDate(trip.end_date)}
                                                    </span>
                                                </div>
                                                <div className="info-item">
                                                    <span className="info-icon">📝</span>
                                                    <span className="info-text">{trip.description}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                    <TripActions trip={trip} onDeleted={handleTripDeleted} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Question Flow Component */}
            <QuestionFlow
                isVisible={showQuestionFlow}
                onComplete={handleQuestionFlowComplete}
                onClose={handleQuestionFlowClose}
                isCreatingTrip={isCreatingTrip}
                creationError={creationError}
            />
        </div>
    );
};

export default TripList;