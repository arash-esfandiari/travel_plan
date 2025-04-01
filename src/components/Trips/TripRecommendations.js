// src/components/Trips/TripRecommendations.js
import React from 'react';
import './TripRecommendations.css';

const TripRecommendations = ({ recommendations }) => {
    let recObj = {};

    // If recommendations is a string, try to parse it.
    try {
        recObj = typeof recommendations === 'string'
            ? JSON.parse(recommendations)
            : recommendations;
    } catch (error) {
        console.error("Error parsing recommendations:", error);
        return <div>Error loading recommendations</div>;
    }

    // Separate general recommendations and day-specific recommendations.
    const generalKeys = [];
    const dayKeys = [];

    Object.keys(recObj).forEach(key => {
        if (key.toLowerCase().startsWith("day")) {
            dayKeys.push(key);
        } else {
            generalKeys.push(key);
        }
    });

    return (
        <div className="trip-recommendations">
            <h3>Trip Recommendations</h3>

            {generalKeys.length > 0 && (
                <div className="general-recommendations">
                    <h4>General Recommendations</h4>
                    {generalKeys.map(key => (
                        <div key={key} className="recommendation-detail">
                            <strong>{key}:</strong> <span>{recObj[key]}</span>
                        </div>
                    ))}
                </div>
            )}

            {dayKeys.length > 0 && (
                <div className="day-recommendations">
                    <h4>Day-by-Day Itinerary</h4>
                    {dayKeys.map(day => (
                        <div key={day} className="recommendation-item">
                            <h5>{day}</h5>
                            {typeof recObj[day] === 'object' &&
                                Object.entries(recObj[day]).map(([subKey, content]) => (
                                    <div key={subKey} className="recommendation-detail">
                                        <strong>{subKey}:</strong> <span>{content}</span>
                                    </div>
                                ))
                            }
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TripRecommendations;