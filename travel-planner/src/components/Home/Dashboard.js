import React from 'react';
import './Dashboard.css';

const Dashboard = () => {
    return (
        <div className="dashboard-container">
            <h1>Welcome to Travel Planner</h1>
            <p className="intro">
                Your all‑in‑one travel planning solution! Whether you are planning a quick weekend getaway or an extended global adventure, Travel Planner helps you create, manage, and share your travel itineraries effortlessly.
            </p>

            <div className="features">
                <div className="feature">
                    <h2>Create Trips</h2>
                    <p>
                        Easily start a new trip by clicking the plus sign on the Trips page. Add details like dates, images, and descriptions to get your adventure started.
                    </p>
                </div>
                <div className="feature">
                    <h2>Manage Itineraries</h2>
                    <p>
                        Organize your travel plans by adding flights, hotels, and activities to your itinerary. Everything is at your fingertips.
                    </p>
                </div>
                <div className="feature">
                    <h2>Daily Plans</h2>
                    <p>
                        For each day of your trip, add specific plans – from hotel check‑ins and restaurants to must‑visit attractions and personal notes.
                    </p>
                </div>
                <div className="feature">
                    <h2>Edit & Share</h2>
                    <p>
                        Update your trip details anytime and share your plans with friends or family effortlessly.
                    </p>
                </div>
            </div>

            <p className="guide">
                To get started, head over to the Trips page and click on the plus sign labeled "Create New Trip". Follow the prompts to fill in your trip details and start planning your journey!
            </p>
        </div>
    );
};

export default Dashboard;