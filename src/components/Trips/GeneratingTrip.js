import React, { useState, useEffect } from 'react';
import './TripDetails.css'; // Reuse the TripDetails CSS for styling

const GeneratingTrip = () => {
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

export default GeneratingTrip; 