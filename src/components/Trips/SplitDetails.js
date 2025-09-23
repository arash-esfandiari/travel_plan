// src/components/Trips/SplitDetails.js
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { getTripById } from '../../services/tripService';
import { getTripSplitDetails } from '../../services/tripSplitService';
import ParticipantsSection from './TripSplitComponents/ParticipantsSection';
import ExpensesSection from './TripSplitComponents/ExpensesSection';
import SettlementsSection from './TripSplitComponents/SettlementsSection';
import ExpenseModal from '../TripSplit/ExpenseModal';
import ParticipantModal from '../TripSplit/ParticipantModal';
import SmartTripImage from '../Shared/SmartTripImage';
import './SplitDetails.css';

const SplitDetails = () => {
    const { tripId } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [trip, setTrip] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('expenses');
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [showExpenseModal, setShowExpenseModal] = useState(false);
    const [showParticipantModal, setShowParticipantModal] = useState(false);
    const [editingExpense, setEditingExpense] = useState(null);
    const [calculatedTotal, setCalculatedTotal] = useState(0);

    // Floating emojis for visual appeal
    const emojis = ['💰', '🧾', '💳', '🤝', '✈️', '🎯', '📊', '💸', '🏦', '📱'];

    const fetchTripDetails = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            console.log('🔍 Fetching trip split details for trip:', tripId);

            // Try to get detailed trip split data first, fallback to basic trip data
            let data;
            try {
                data = await getTripSplitDetails(tripId);
                console.log('📋 Received trip split details:', data);
            } catch (splitError) {
                console.log('Using fallback to basic trip data');
                const basicData = await getTripById(tripId);
                data = { trip: basicData.trip };
            }

            setTrip(data.trip || null);

            // Initialize calculated total from trip data if available
            if (data.trip && data.trip.total_expenses) {
                setCalculatedTotal(data.trip.total_expenses);
            }
        } catch (error) {
            console.error('❌ Error fetching trip details:', error);
            setError('Failed to load trip details. Please try again.');
            setTrip(null);
        } finally {
            setLoading(false);
        }
    }, [tripId]);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        if (tripId) {
            fetchTripDetails();
        }
    }, [user, navigate, tripId, refreshTrigger, fetchTripDetails]);

    // Cleanup: Remove modal-open class when component unmounts
    useEffect(() => {
        return () => {
            document.body.classList.remove('modal-open');
        };
    }, []);

    const handleGoBack = () => {
        navigate(`/trips/${tripId}`);
    };

    const handleRefresh = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    const handleTotalUpdate = (total) => {
        setCalculatedTotal(total);
    };

    const handleAddExpense = () => {
        setEditingExpense(null); // Clear any existing editing state
        setShowExpenseModal(true);
        document.body.classList.add('modal-open'); // Hide navbar
    };

    const handleEditExpense = (expense) => {
        setEditingExpense(expense);
        setShowExpenseModal(true);
        document.body.classList.add('modal-open'); // Hide navbar
    };

    const handleAddParticipant = () => {
        setShowParticipantModal(true);
        document.body.classList.add('modal-open'); // Hide navbar
    };

    const handleModalClose = () => {
        setShowExpenseModal(false);
        setShowParticipantModal(false);
        setEditingExpense(null); // Clear editing state
        document.body.classList.remove('modal-open'); // Show navbar
        setRefreshTrigger(prev => prev + 1); // Refresh data after modal actions
    };

    if (!user) {
        return (
            <div className="split-details-container">
                <div className="error-state">
                    <div className="error-icon">🔐</div>
                    <h3>Login Required</h3>
                    <p>Please log in to access trip expense details.</p>
                    <button onClick={() => navigate('/login')} className="back-btn">
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="split-details-container">
                {/* Floating Emojis */}
                {emojis.map((emoji, index) => (
                    <div
                        key={index}
                        className={`details-floating-emoji details-floating-emoji-${index + 1}`}
                        style={{
                            animationDelay: `${index * 0.5}s`
                        }}
                    >
                        <span>{emoji}</span>
                    </div>
                ))}
                <div className="loading-state">
                    <div className="loading-spinner">💰</div>
                    <h2>Loading Trip Details...</h2>
                    <p>Gathering financial information for this trip</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="split-details-container">
                <div className="error-state">
                    <div className="error-icon">⚠️</div>
                    <h3>Something went wrong</h3>
                    <p>{error}</p>
                    <button onClick={fetchTripDetails} className="back-btn">
                        🔄 Try Again
                    </button>
                    <button onClick={handleGoBack} className="back-btn">
                        ← Back to Trip
                    </button>
                </div>
            </div>
        );
    }

    if (!trip) {
        return (
            <div className="split-details-container">
                <div className="error-state">
                    <div className="error-icon">🔍</div>
                    <h3>Trip not found</h3>
                    <p>The trip you're looking for doesn't exist.</p>
                    <button onClick={handleGoBack} className="back-btn">
                        ← Back to Trips
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="split-details-container">
            {/* Floating Emojis */}
            {emojis.map((emoji, index) => (
                <div
                    key={index}
                    className={`details-floating-emoji details-floating-emoji-${index + 1}`}
                    style={{
                        animationDelay: `${index * 0.5}s`
                    }}
                >
                    <span>{emoji}</span>
                </div>
            ))}

            {/* Header */}
            <div className="details-trip-split-header">
                <div className="header-nav">
                    <button onClick={handleGoBack} className="back-button">
                        ← Back to Trip
                    </button>
                    <button onClick={handleRefresh} className="refresh-button">
                        🔄
                    </button>
                </div>
                <div className="header-content">
                    <h1 className="split-title">💰 Trip Split</h1>
                    <p className="trip-name">{trip.trip_name}</p>
                    <p className="trip-dates">
                        {new Date(trip.start_date).toLocaleDateString()} - {new Date(trip.end_date).toLocaleDateString()}
                    </p>
                </div>
            </div>

            {/* Trip Details Card */}
            <div className="trip-details-container">
                <div className="trip-details-card">
                    {/* Trip Header */}
                    <div className="details-card-header">
                        <div className="details-card-image">
                            <SmartTripImage
                                trip={trip}
                                alt={trip.trip_name}
                                className="details-trip-image"
                            />
                        </div>

                        <div className="details-card-info">
                            <h2 className="details-trip-title">{trip.trip_name}</h2>
                            <div className="details-trip-meta">
                                <div className="meta-item">
                                    <span className="meta-icon">📅</span>
                                    <span className="meta-text">
                                        {new Date(trip.start_date).toLocaleDateString()} - {new Date(trip.end_date).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="meta-item">
                                    <span className="meta-icon">📍</span>
                                    <span className="meta-text">{trip.city_name}</span>
                                </div>
                                <div className="meta-item">
                                    <span className="meta-icon">👥</span>
                                    <span className="meta-text">
                                        {trip.participant_count || 0} {(trip.participant_count || 0) === 1 ? 'Person' : 'People'}
                                    </span>
                                </div>
                                <div className="meta-item total-expenses">
                                    <span className="meta-icon">💰</span>
                                    <span className="meta-text">
                                        <span className="total-amount">{calculatedTotal.toFixed(2)}</span>
                                        <span className="total-label">Total</span>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="details-actions">
                        <button
                            className="details-action-btn expense-btn"
                            onClick={handleAddExpense}
                        >
                            💰 Add Expense
                        </button>
                        <button
                            className="details-action-btn participant-btn"
                            onClick={handleAddParticipant}
                        >
                            👥 Add Friend
                        </button>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="tab-navigation">
                <button
                    className={`tab-btn ${activeTab === 'expenses' ? 'active' : ''}`}
                    onClick={() => setActiveTab('expenses')}
                >
                    💳 Expenses
                </button>
                <button
                    className={`tab-btn ${activeTab === 'participants' ? 'active' : ''}`}
                    onClick={() => setActiveTab('participants')}
                >
                    👥 Participants
                </button>
                <button
                    className={`tab-btn ${activeTab === 'settlements' ? 'active' : ''}`}
                    onClick={() => setActiveTab('settlements')}
                >
                    🧮 Settlements
                </button>
            </div>

            {/* Tab Content */}
            <div className="tab-content">
                {activeTab === 'expenses' && (
                    <ExpensesSection
                        tripId={tripId}
                        refreshTrigger={refreshTrigger}
                        onDataChange={handleRefresh}
                        onAddExpense={handleAddExpense}
                        onEditExpense={handleEditExpense}
                        onTotalUpdate={handleTotalUpdate}
                    />
                )}
                {activeTab === 'participants' && (
                    <ParticipantsSection
                        tripId={tripId}
                        refreshTrigger={refreshTrigger}
                        onDataChange={handleRefresh}
                        onAddParticipant={handleAddParticipant}
                    />
                )}
                {activeTab === 'settlements' && (
                    <SettlementsSection
                        tripId={tripId}
                        refreshTrigger={refreshTrigger}
                        onDataChange={handleRefresh}
                    />
                )}
            </div>

            {/* Modals */}
            {showExpenseModal && (
                <ExpenseModal
                    trip={trip}
                    editingExpense={editingExpense}
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

export default SplitDetails; 