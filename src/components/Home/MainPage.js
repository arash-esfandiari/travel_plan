import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import './MainPage.css';
import { AuthContext } from '../../context/AuthContext'; // Import AuthContext

// Import local images from assets/images/cities
import barcelona from '../../assets/images/places/barcelona.avif';
// import eifell from '../../assets/images/places/eiffel.webp';
import sardinia from '../../assets/images/places/sardinia.webp';
// import munich from '../../assets/images/places/munich.webp';
// import isfahan from '../../assets/images/places/isfahan.jpg';
import egypt from '../../assets/images/places/egypt.avif';
// import vegas from '../../assets/images/places/vegas.webp';
// import allianz from '../../assets/images/places/allianz.avif';
import paris from '../../assets/images/places/paris.webp';


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
                {/* Background image */}
                <div className="hero-background">
                    <img src={sardinia} alt="Travel Destination" className="hero-bg-image" />
                    <div className="hero-overlay"></div>
                </div>

                {/* Floating decorative icons */}
                <div className="floating-icon floating-icon-1">
                    <span>✈️</span>
                </div>
                <div className="floating-icon floating-icon-2">
                    <span>🗺️</span>
                </div>
                <div className="floating-icon floating-icon-3">
                    <span>🏛️</span>
                </div>
                <div className="floating-icon floating-icon-4">
                    <span>🌍</span>
                </div>
                <div className="floating-icon floating-icon-5">
                    <span>🎒</span>
                </div>
                <div className="floating-icon floating-icon-6">
                    <span>📸</span>
                </div>

                <div className="hero-content">
                    <h1 className="hero-title">Let's plan your trip together</h1>
                    <p className="hero-subtitle">You're in control. AI helps optimize.</p>
                    <div className="hero-buttons">
                        <button className="forward-continue-btn">
                            <span className="continue-text">Continue</span>
                            <span className="arrow">➤</span>
                        </button>
                    </div>
                </div>
            </section>

            {/* Feature Section 1: AI Planning */}
            <section className="feature-section">
                <div className="feature-content">
                    <h2 className="feature-title">Your Vision, AI Optimization</h2>
                    <p className="feature-description">
                        Start with your ideas. AI suggests optimizations to make your trip better.
                    </p>
                    <div className="feature-highlights">
                        <div className="highlight-item">
                            <span className="highlight-icon">🎯</span>
                            <span>Your Preferences</span>
                        </div>
                        <div className="highlight-item">
                            <span className="highlight-icon">⚡</span>
                            <span>Smart Optimization</span>
                        </div>
                        <div className="highlight-item">
                            <span className="highlight-icon">💡</span>
                            <span>AI Suggestions</span>
                        </div>
                    </div>
                </div>
                <div className="feature-visual">
                    <img src={barcelona} alt="AI Planning" className="feature-image" />
                </div>
            </section>

            {/* Feature Section 2: Daily Plans */}
            <section className="feature-section reverse">
                <div className="feature-content">
                    <h2 className="feature-title">Your Schedule, Enhanced</h2>
                    <p className="feature-description">
                        Build your daily plans. AI optimizes timing and routes.
                    </p>
                    <div className="feature-highlights">
                        <div className="highlight-item">
                            <span className="highlight-icon">📅</span>
                            <span>Your Plans</span>
                        </div>
                        <div className="highlight-item">
                            <span className="highlight-icon">📍</span>
                            <span>Route Optimization</span>
                        </div>
                        <div className="highlight-item">
                            <span className="highlight-icon">⏰</span>
                            <span>Time Management</span>
                        </div>
                    </div>
                </div>
                <div className="feature-visual">
                    <img src={paris} alt="Daily Plans" className="feature-image" />
                </div>
            </section>

            {/* Feature Section 3: Interactive Maps */}
            <section className="feature-section">
                <div className="feature-content">
                    <h2 className="feature-title">Your Journey, Visualized</h2>
                    <p className="feature-description">
                        Add your locations. AI suggests nearby attractions and optimal routes.
                    </p>
                    <div className="feature-highlights">
                        <div className="highlight-item">
                            <span className="highlight-icon">🗺️</span>
                            <span>Your Locations</span>
                        </div>
                        <div className="highlight-item">
                            <span className="highlight-icon">🔍</span>
                            <span>AI Discoveries</span>
                        </div>
                        <div className="highlight-item">
                            <span className="highlight-icon">🎯</span>
                            <span>Smart Routes</span>
                        </div>
                    </div>
                </div>
                <div className="feature-visual">
                    <img src={egypt} alt="Interactive Maps" className="feature-image" />
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="cta-content">
                    <h2 className="cta-title">Ready to Take Control?</h2>
                    <p className="cta-description">
                        Start planning your way, with AI assistance.
                    </p>
                    <button className="cta-button" onClick={handleCreateTrip}>
                        Start Your Journey
                    </button>
                </div>
            </section>

            {/* Spacer to ensure proper document height calculation */}
            <div style={{ height: '100px', width: '100%' }}></div>
        </div>
    );
};

export default MainPage;