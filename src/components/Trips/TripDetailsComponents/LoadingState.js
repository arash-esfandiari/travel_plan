// src/components/Trips/TripDetailsComponents/LoadingState.js
import React from 'react';

const LoadingState = ({ floatingEmojis }) => {
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
};

export default LoadingState; 