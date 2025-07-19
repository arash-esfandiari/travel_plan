// src/components/Trips/TripDetailsComponents/ErrorState.js
import React from 'react';

const ErrorState = ({ error, onRetry, onGoBack, floatingEmojis }) => {
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
                        <button className="retry-btn" onClick={onRetry}>
                            🔄 Try Again
                        </button>
                        <button className="back-btn" onClick={onGoBack}>
                            ← Back to Trips
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ErrorState; 