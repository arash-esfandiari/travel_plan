// src/components/Trips/TripDetailsComponents/TripHeader.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

const TripHeader = ({ trip, loading, onGoBack, onRefresh }) => {
    const navigate = useNavigate();

    const handleTripSplit = () => {
        navigate(`/trips/${trip.id}/split`);
    };

    return (
        <div className="trip-header">
            <div className="header-nav">
                <button onClick={onGoBack} className="back-button">
                    ← Back
                </button>
                <div className="header-actions">
                    <button onClick={handleTripSplit} className="trip-split-btn">
                        💰 Trip Split
                    </button>
                    <button
                        onClick={onRefresh}
                        className="refresh-button"
                        disabled={loading}
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
    );
};

export default TripHeader; 