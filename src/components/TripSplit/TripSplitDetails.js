// src/components/TripSplit/TripSplitDetails.js
import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { getTripSplitDetails } from '../../services/tripSplitService';
import ExpenseModal from './ExpenseModal';
import ParticipantModal from './ParticipantModal';
import TripSplitDetailsCard from './TripSplitDetailsCard';
import './TripSplitDetails.css';

const TripSplitDetails = () => {
    const { tripId } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [trip, setTrip] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showExpenseModal, setShowExpenseModal] = useState(false);
    const [showParticipantModal, setShowParticipantModal] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Floating emojis for visual appeal
    const emojis = ['💰', '🧾', '💳', '🤝', '✈️', '🎯', '📊', '💸', '🏦', '📱'];

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        if (tripId) {
            fetchTripDetails();
        }
    }, [user, navigate, tripId, refreshTrigger]);

    const fetchTripDetails = async () => {
        try {
            setLoading(true);
            setError(null);
            console.log('🔍 Fetching trip split details for trip:', tripId);

            const data = await getTripSplitDetails(tripId);
            console.log('📋 Received trip details:', data);

            setTrip(data.trip || null);
        } catch (error) {
            console.error('❌ Error fetching trip details:', error);
            setError('Failed to load trip details. Please try again.');
            setTrip(null);
        } finally {
            setLoading(false);
        }
    };

    const handleAddExpense = () => {
        setShowExpenseModal(true);
    };

    const handleAddParticipant = () => {
        setShowParticipantModal(true);
    };

    const handleModalClose = () => {
        setShowExpenseModal(false);
        setShowParticipantModal(false);
        setRefreshTrigger(prev => prev + 1); // Refresh data after modal actions
    };

    const handleGoBack = () => {
        navigate('/trip-split');
    };

    if (!user) {
        return (
            <div className="trip-split-details-page">
                <div className="login-required">
                    <h2>Login Required</h2>
                    <p>Please log in to access trip expense details.</p>
                    <button onClick={() => navigate('/login')}>
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="trip-split-details-page">
                <div className="loading-container">
                    <div className="loading-spinner">💰</div>
                    <h2>Loading Trip Details...</h2>
                    <p>Gathering financial information for this trip</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="trip-split-details-page">
                <div className="error-container">
                    <div className="error-icon">⚠️</div>
                    <h2>Something went wrong</h2>
                    <p>{error}</p>
                    <button onClick={fetchTripDetails} className="retry-btn">
                        🔄 Try Again
                    </button>
                    <button onClick={handleGoBack} className="back-btn">
                        ← Back to Trip Split
                    </button>
                </div>
            </div>
        );
    }

    if (!trip) {
        return (
            <div className="trip-split-details-page">
                <div className="not-found-container">
                    <div className="not-found-icon">🔍</div>
                    <h2>Trip Not Found</h2>
                    <p>The trip you're looking for doesn't exist or you don't have access to it.</p>
                    <button onClick={handleGoBack} className="back-btn">
                        ← Back to Trip Split
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="trip-split-details-page">
            {/* Floating Emojis */}
            {emojis.map((emoji, index) => (
                <div
                    key={index}
                    className={`floating-emoji floating-emoji-${index + 1}`}
                    style={{
                        animationDelay: `${index * 0.5}s`
                    }}
                >
                    <span>{emoji}</span>
                </div>
            ))}

            <div className="trip-split-details-container">
                {/* Header */}
                <div className="details-header">
                    <button onClick={handleGoBack} className="back-button">
                        ← Back to Trip Split
                    </button>
                    <div className="header-content">
                        <h1>💰 {trip.trip_name}</h1>
                        <p>Detailed expense breakdown and financial summary</p>
                    </div>
                </div>

                {/* Trip Details Card */}
                <div className="trip-details-container">
                    <TripSplitDetailsCard
                        trip={trip}
                        onAddExpense={handleAddExpense}
                        onAddParticipant={handleAddParticipant}
                        onRefresh={() => setRefreshTrigger(prev => prev + 1)}
                    />
                </div>
            </div>

            {/* Modals */}
            {showExpenseModal && (
                <ExpenseModal
                    trip={trip}
                    onClose={handleModalClose}
                />
            )}

            {showParticipantModal && (
                <ParticipantModal
                    trip={trip}
                    onClose={handleModalClose}
                />
            )}
        </div>
    );
};

export default TripSplitDetails;
