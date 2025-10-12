import React, { useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './MainPage.css';
import { AuthContext } from '../../context/AuthContext'; // Import AuthContext
import { createTripFromQuestionFlow } from '../../services/tripService';
import QuestionFlow from './QuestionFlow';

// Import local images from assets/images/places
import barcelona from '../../assets/images/places/barcelona.avif';
// import eiffel from '../../assets/images/places/eiffel.webp';
import sardinia from '../../assets/images/places/sardinia.webp';
// import munich from '../../assets/images/places/munich.webp';
// import isfahan from '../../assets/images/places/isfahan.jpg';
import egypt from '../../assets/images/places/egypt.avif';
// import vegas from '../../assets/images/places/vegas.webp';
// import allianz from '../../assets/images/places/allianz.avif';
import paris from '../../assets/images/places/paris.webp';


const MainPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useContext(AuthContext); // Access the user from AuthContext
    const [showQuestionFlow, setShowQuestionFlow] = useState(false);
    const [isCreatingTrip, setIsCreatingTrip] = useState(false);
    const [creationError, setCreationError] = useState(null);

    // Check if we should show question flow after login
    useEffect(() => {
        if (location.state?.showQuestionFlow && user) {
            setShowQuestionFlow(true);
            // Clear the state to prevent showing it again on refresh
            navigate(location.pathname, { replace: true });
        }
    }, [location.state, user, navigate, location.pathname]);

    const handleCreateTrip = () => {
        if (user) {
            navigate('/trips'); // Redirect to trips page if logged in
        } else {
            navigate('/login'); // Redirect to login page if not logged in
        }
    };

    const handleContinueClick = () => {
        if (user) {
            setShowQuestionFlow(true);
        } else {
            // Redirect to login page with a message to return to question flow
            navigate('/login', {
                state: {
                    returnTo: 'question-flow',
                    message: 'Please log in to start planning your trip'
                }
            });
        }
    };

    const handleQuestionFlowComplete = async (answers, destinationCoords) => {
        console.log('Question flow completed with answers:', answers);
        console.log('Destination coordinates:', destinationCoords);

        if (!user) {
            navigate('/login', { state: { answers, destinationCoords } });
            return;
        }

        setIsCreatingTrip(true);
        setCreationError(null);

        try {
            // Handle flexible dates - convert to actual dates if needed
            let startDate = answers.startDate;
            let endDate = answers.endDate;

            // If we don't have specific dates (user chose flexible dates), create appropriate dates
            if (!startDate || !endDate) {
                const today = new Date();
                const futureStartDate = new Date(today);
                futureStartDate.setDate(today.getDate() + 7); // Default to next week

                let duration = 3; // Default duration in days

                // Parse flexible date selection to determine duration
                if (answers.dates) {
                    if (answers.dates.includes('1-3 days')) {
                        duration = 3;
                    } else if (answers.dates.includes('4-7 days')) {
                        duration = 7;
                    } else if (answers.dates.includes('1-2 weeks')) {
                        duration = 10;
                    } else if (answers.dates.includes('2+ weeks')) {
                        duration = 14;
                    }
                }

                const futureEndDate = new Date(futureStartDate);
                futureEndDate.setDate(futureStartDate.getDate() + duration - 1);

                startDate = futureStartDate.toISOString().split('T')[0];
                endDate = futureEndDate.toISOString().split('T')[0];

                console.log('Using flexible dates - Start:', startDate, 'End:', endDate, 'Duration:', duration);
            }

            const questionFlowData = {
                destination: answers.destination,
                startDate: startDate,
                endDate: endDate,
                numberOfPeople: 1, // Default value
                preferences: answers,
                travelStyle: answers.travelStyle,
                budgetRange: answers.budget,
                interests: answers.interests,
                latitude: destinationCoords?.lat,
                longitude: destinationCoords?.lng
            };

            // Create the trip and get the initial response
            const newTrip = await createTripFromQuestionFlow(questionFlowData);

            // Close the question flow modal
            setShowQuestionFlow(false);
            setIsCreatingTrip(false);

            // Navigate to the trip details page where the loading screen will be shown
            navigate(`/trips/${newTrip.id}`);
        } catch (error) {
            console.error('Error in trip creation:', error);
            setCreationError('Failed to create trip. Please try again.');
            setIsCreatingTrip(false);
            // Don't close the question flow on error, let user try again
        }
    };

    const handleQuestionFlowClose = () => {
        if (!isCreatingTrip) { // Only allow closing if not creating a trip
            setShowQuestionFlow(false);
            setCreationError(null);
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
                        <button
                            className={`forward-continue-btn ${showQuestionFlow ? 'question-flow-active' : ''}`}
                            onClick={handleContinueClick}
                        >
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

            {/* Feature Section 3: Expense Tracking & Splitting */}
            <section className="feature-section">
                <div className="feature-content">
                    <h2 className="feature-title">Split Expenses, Stay Friends</h2>
                    {/* <h2 className="feature-title">Add Friends, Split Expenses</h2> */}
                    <p className="feature-description">
                        Track all group expenses and let AI calculate who owes what. No more awkward money conversations!
                    </p>
                    <div className="feature-highlights">
                        <div className="highlight-item">
                            <span className="highlight-icon">💰</span>
                            <span>Expense Tracking</span>
                        </div>
                        <div className="highlight-item">
                            <span className="highlight-icon">🧮</span>
                            <span>Smart Calculations</span>
                        </div>
                        <div className="highlight-item">
                            <span className="highlight-icon">🤝</span>
                            <span>Fair Splitting</span>
                        </div>
                    </div>
                </div>
                <div className="feature-visual">
                    <img src={egypt} alt="Expense Tracking" className="feature-image" />
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

            {/* Question Flow Component */}
            <QuestionFlow
                isVisible={showQuestionFlow}
                onComplete={handleQuestionFlowComplete}
                onClose={handleQuestionFlowClose}
                isCreatingTrip={isCreatingTrip}
                creationError={creationError}
            />
        </div>
    );
};

export default MainPage;