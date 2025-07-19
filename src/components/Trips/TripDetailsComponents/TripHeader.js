// src/components/Trips/TripDetailsComponents/TripHeader.js
import React from 'react';

const TripHeader = ({ trip, loading, onGoBack, onRefresh }) => {
    return (
        <div className="trip-header">
            <div className="header-navigation">
                <button className="back-button" onClick={onGoBack}>
                    <span className="back-icon">←</span>
                    <span className="back-text">Back to Trips</span>
                </button>

                <button
                    className="refresh-button"
                    onClick={onRefresh}
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
    );
};

export default TripHeader; 