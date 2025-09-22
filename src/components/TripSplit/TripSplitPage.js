// src/components/TripSplit/TripSplitPage.js
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { getUserParticipatingTrips } from '../../services/tripSplitService';
import TripSplitCard from './TripSplitCard';
import ExpenseModal from './ExpenseModal';
import ParticipantModal from './ParticipantModal';
import './TripSplitPage.css';

const TripSplitPage = () => {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedTrip, setSelectedTrip] = useState(null);
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
        fetchTrips();
    }, [user, navigate, refreshTrigger]);

    const fetchTrips = async () => {
        try {
            setLoading(true);
            setError(null);
            console.log('🔍 Fetching user participating trips...');

            const data = await getUserParticipatingTrips();
            console.log('📋 Received trips:', data);

            setTrips(data.trips || []);
        } catch (error) {
            console.error('❌ Error fetching trips:', error);
            setError('Failed to load trips. Please try again.');
            setTrips([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAddExpense = (trip) => {
        setSelectedTrip(trip);
        setShowExpenseModal(true);
    };

    const handleAddParticipant = (trip) => {
        setSelectedTrip(trip);
        setShowParticipantModal(true);
    };

    const handleRefresh = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    const handleModalClose = () => {
        setShowExpenseModal(false);
        setShowParticipantModal(false);
        setSelectedTrip(null);
        handleRefresh(); // Refresh data after modal actions
    };

    if (!user) {
        return (
            <div className="trip-split-page">
                <div className="login-required">
                    <h2>Login Required</h2>
                    <p>Please log in to access trip expense sharing.</p>
                    <button onClick={() => navigate('/login')}>
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="trip-split-page">
                <div className="loading-container">
                    <div className="loading-spinner">💰</div>
                    <h2>Loading Your Trips...</h2>
                    <p>Gathering expense data from all your adventures</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="trip-split-page">
                <div className="error-container">
                    <div className="error-icon">⚠️</div>
                    <h2>Something went wrong</h2>
                    <p>{error}</p>
                    <button onClick={handleRefresh} className="retry-btn">
                        🔄 Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="trip-split-page">
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

            <div className="trip-split-container">
                {/* Header */}
                <div className="trip-split-header">
                    <div className="header-content">
                        <h1>💰 Trip Split</h1>
                        <p>Manage expenses across all your trips</p>
                    </div>
                    <div className="header-stats">
                        <div className="stat-item">
                            <span className="stat-number">{trips.length}</span>
                            <span className="stat-label">Trips</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-number">
                                {trips.reduce((sum, trip) => sum + trip.expense_count, 0)}
                            </span>
                            <span className="stat-label">Expenses</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-number">
                                ${trips.reduce((sum, trip) => sum + trip.total_expenses, 0).toFixed(2)}
                            </span>
                            <span className="stat-label">Total</span>
                        </div>
                    </div>
                </div>

                {/* Trip Cards */}
                <div className="trips-section">
                    {trips.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">🏖️</div>
                            <h3>No Trips Yet</h3>
                            <p>Create a trip or get invited by friends to start sharing expenses!</p>
                            <button
                                onClick={() => navigate('/trips')}
                                className="create-trip-btn"
                            >
                                ➕ Browse Trips
                            </button>
                        </div>
                    ) : (
                        <div className="trips-grid">
                            {trips.map((trip) => (
                                <TripSplitCard
                                    key={trip.id}
                                    trip={trip}
                                    onAddExpense={handleAddExpense}
                                    onAddParticipant={handleAddParticipant}
                                    onRefresh={handleRefresh}
                                    onClick={() => navigate(`/trip-split/${trip.id}`)}
                                    compact={true}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            {showExpenseModal && selectedTrip && (
                <ExpenseModal
                    trip={selectedTrip}
                    onClose={handleModalClose}
                />
            )}

            {showParticipantModal && selectedTrip && (
                <ParticipantModal
                    trip={selectedTrip}
                    onClose={handleModalClose}
                />
            )}
        </div>
    );
};

export default TripSplitPage; 