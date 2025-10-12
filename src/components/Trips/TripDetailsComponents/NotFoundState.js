// src/components/Trips/TripDetailsComponents/NotFoundState.js
import React from 'react';

const NotFoundState = ({ onGoBack }) => {
    return (
        <div className="trip-details-page">
            <div className="trip-details-container">
                <div className="not-found-state">
                    <div className="not-found-icon">🔍</div>
                    <h2>Trip Not Found</h2>
                    <p>The trip you're looking for doesn't exist or may have been removed.</p>
                    <button className="back-btn" onClick={onGoBack}>
                        ← Back to Trips
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotFoundState; 