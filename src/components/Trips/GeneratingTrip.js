import React from 'react';
import './GeneratingTrip.css';

const GeneratingTrip = () => {
    return (
        <div className="generating-container">
            <div className="background-animation">
                <div className="stars"></div>
                <div className="twinkling"></div>
                <div className="clouds"></div>
            </div>

            <div className="generating-content">
                <div className="globe-container">
                    <div className="globe">
                        <div className="plane"></div>
                    </div>
                </div>

                <h1 className="generating-title">Crafting Your Adventure...</h1>

                <div className="status-messages">
                    <p className="status-message">Analyzing your preferences</p>
                    <p className="status-message">Finding hidden gems</p>
                    <p className="status-message">Building your personalized itinerary</p>
                    <p className="status-message">Finalizing the details</p>
                </div>

                <div className="progress-bar-container">
                    <div className="progress-bar"></div>
                </div>

                <p className="loading-message">
                    The world is being mapped to your desires...
                </p>
            </div>
        </div>
    );
};

export default GeneratingTrip; 