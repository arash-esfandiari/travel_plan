import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import './MainPage.css';
import { AuthContext } from '../../context/AuthContext'; // Import AuthContext

// Import local images from assets/images/cities
import city1 from '../../assets/images/cities/barca.jpg';
import city2 from '../../assets/images/cities/santiago.webp';
import city3 from '../../assets/images/cities/eiffel.jpg';
import city4 from '../../assets/images/cities/lisbon.webp';
import city5 from '../../assets/images/cities/munich.webp';
import city6 from '../../assets/images/cities/isfahan.jpg';
import city7 from '../../assets/images/cities/egypt.avif';
import city8 from '../../assets/images/cities/vegas.webp';

const imageUrls = [city1, city2, city3, city4, city5, city6, city7, city8];

const MainPage = () => {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext); // Access the user from AuthContext

    const handleCreateTrip = () => {
        if (user) {
            navigate('/trips'); // Redirect to trips page if logged in
        } else {
            navigate('/login'); // Redirect to login page if not logged in
        }
    };

    return (
        <div className="main-page">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content">
                    <h1 className="hero-title">Let's plan your trip together</h1>
                    <p className="hero-subtitle">Discover the world with AI-powered travel planning</p>
                    <button className="hero-cta" onClick={handleCreateTrip}>
                        Start Planning
                    </button>
                </div>
                <div className="hero-visual">
                    <img src={city1} alt="Travel Destination" className="hero-image" />
                </div>
            </section>

            {/* Feature Section 1: AI Planning */}
            <section className="feature-section">
                <div className="feature-content">
                    <h2 className="feature-title">AI-Powered Planning</h2>
                    <p className="feature-description">
                        Our intelligent AI creates personalized itineraries based on your preferences,
                        budget, and travel style. Get recommendations that match your unique taste.
                    </p>
                    <div className="feature-highlights">
                        <div className="highlight-item">
                            <span className="highlight-icon">🤖</span>
                            <span>Smart Recommendations</span>
                        </div>
                        <div className="highlight-item">
                            <span className="highlight-icon">⚡</span>
                            <span>Instant Planning</span>
                        </div>
                        <div className="highlight-item">
                            <span className="highlight-icon">🎯</span>
                            <span>Personalized</span>
                        </div>
                    </div>
                </div>
                <div className="feature-visual">
                    <img src={city2} alt="AI Planning" className="feature-image" />
                </div>
            </section>

            {/* Feature Section 2: Daily Plans */}
            <section className="feature-section reverse">
                <div className="feature-content">
                    <h2 className="feature-title">Daily Itineraries</h2>
                    <p className="feature-description">
                        Break down your trip into detailed daily plans. From morning coffee spots
                        to evening entertainment, every moment is thoughtfully planned.
                    </p>
                    <div className="feature-highlights">
                        <div className="highlight-item">
                            <span className="highlight-icon">📅</span>
                            <span>Day-by-Day Plans</span>
                        </div>
                        <div className="highlight-item">
                            <span className="highlight-icon">📍</span>
                            <span>Location Mapping</span>
                        </div>
                        <div className="highlight-item">
                            <span className="highlight-icon">⏰</span>
                            <span>Time Management</span>
                        </div>
                    </div>
                </div>
                <div className="feature-visual">
                    <img src={city3} alt="Daily Plans" className="feature-image" />
                </div>
            </section>

            {/* Feature Section 3: Interactive Maps */}
            <section className="feature-section">
                <div className="feature-content">
                    <h2 className="feature-title">Interactive Maps</h2>
                    <p className="feature-description">
                        Visualize your journey with interactive maps. See all your destinations,
                        routes, and points of interest in one beautiful interface.
                    </p>
                    <div className="feature-highlights">
                        <div className="highlight-item">
                            <span className="highlight-icon">🗺️</span>
                            <span>Visual Planning</span>
                        </div>
                        <div className="highlight-item">
                            <span className="highlight-icon">🔍</span>
                            <span>Explore Areas</span>
                        </div>
                        <div className="highlight-item">
                            <span className="highlight-icon">🎯</span>
                            <span>Pin Locations</span>
                        </div>
                    </div>
                </div>
                <div className="feature-visual">
                    <img src={city4} alt="Interactive Maps" className="feature-image" />
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="cta-content">
                    <h2 className="cta-title">Ready to Start Your Journey?</h2>
                    <p className="cta-description">
                        Join thousands of travelers who trust our AI to plan their perfect trips.
                    </p>
                    <button className="cta-button" onClick={handleCreateTrip}>
                        Create Your First Trip
                    </button>
                </div>
            </section>
        </div>
    );
};

export default MainPage;