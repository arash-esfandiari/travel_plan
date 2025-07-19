// src/components/Trips/TripDetails.js
import React from 'react';
import { useParams } from 'react-router-dom';
import TripMap from './TripMap';
import { useTripDetails } from './TripDetailsComponents/useTripDetails';
import LoadingState from './TripDetailsComponents/LoadingState';
import ErrorState from './TripDetailsComponents/ErrorState';
import NotFoundState from './TripDetailsComponents/NotFoundState';
import TripHeader from './TripDetailsComponents/TripHeader';
import TripInfo from './TripDetailsComponents/TripInfo';
import DailyPlansSection from './TripDetailsComponents/DailyPlansSection';

import './TripDetails.css';

const TripDetails = () => {
    const { tripId } = useParams();

    // Animated emojis for floating background
    const floatingEmojis = ['✈️', '🗺️', '🏛️', '🌍', '🎒', '📸', '🏖️', '🗽', '🎡', '🏰'];

    const {
        // State
        trip,
        loading,
        error,
        mapCenter,
        dailyPlans,
        draggedPlan,
        isDragging,
        weatherData,
        weatherStatus,

        // Handlers
        handleGoBack,
        handleRefresh,
        handleDragStart,
        handleDragOver,
        handleDrop,
        handleParseToDailyPlans,
        handleDeletePlan,
        handlePlanAdded,

        // Utility functions
        getGroupedPlans,
        generateDateRange
    } = useTripDetails(tripId);

    // Loading state with beautiful design
    if (loading) {
        return <LoadingState floatingEmojis={floatingEmojis} />;
    }

    // Error state
    if (error) {
        return (
            <ErrorState
                error={error}
                onRetry={handleRefresh}
                onGoBack={handleGoBack}
                floatingEmojis={floatingEmojis}
            />
        );
    }

    // Trip not found state
    if (!trip) {
        return <NotFoundState onGoBack={handleGoBack} />;
    }

    // Prepare data for child components
    const attractions = trip.attractions || [
        { key: 'attraction1', name: 'Main Attraction', location: { lat: mapCenter?.lat + 0.01 || 40.7128, lng: mapCenter?.lng + 0.01 || -74.0060 } },
        { key: 'attraction2', name: 'Secondary Attraction', location: { lat: mapCenter?.lat - 0.01 || 40.7028, lng: mapCenter?.lng - 0.01 || -74.0160 } },
    ];

    const groupedPlans = getGroupedPlans();
    const allDates = trip ? generateDateRange(trip.start_date, trip.end_date) : [];

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
                    <TripHeader
                        trip={trip}
                        loading={loading}
                        onGoBack={handleGoBack}
                        onRefresh={handleRefresh}
                    />

                    {/* General Info Section */}
                    <TripInfo
                        trip={trip}
                        onParseToDailyPlans={handleParseToDailyPlans}
                    />

                    {/* Daily Plans Section */}
                    <DailyPlansSection
                        trip={trip}
                        tripId={tripId}
                        allDates={allDates}
                        groupedPlans={groupedPlans}
                        weatherData={weatherData}
                        weatherStatus={weatherStatus}
                        isDragging={isDragging}
                        draggedPlan={draggedPlan}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        onDragStart={handleDragStart}
                        onDeletePlan={handleDeletePlan}
                        onPlanAdded={handlePlanAdded}
                    />
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