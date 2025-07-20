// src/components/Trips/TripSplit.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTripById } from '../../services/tripService';
import ParticipantsSection from './TripSplitComponents/ParticipantsSection';
import ExpensesSection from './TripSplitComponents/ExpensesSection';
import SettlementsSection from './TripSplitComponents/SettlementsSection';
import './TripSplit.css';

const TripSplit = () => {
    const { tripId } = useParams();
    const navigate = useNavigate();
    const [trip, setTrip] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('participants');
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    useEffect(() => {
        const fetchTrip = async () => {
            try {
                setLoading(true);
                const data = await getTripById(tripId);
                setTrip(data.trip);
                setError(null);
            } catch (error) {
                console.error('Error fetching trip:', error);
                setError('Failed to load trip details');
            } finally {
                setLoading(false);
            }
        };

        if (tripId) {
            fetchTrip();
        }
    }, [tripId]);

    const handleGoBack = () => {
        navigate(`/trips/${tripId}`);
    };

    const handleRefresh = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    if (loading) {
        return (
            <div className="trip-split-container">
                <div className="loading-state">
                    <div className="loading-spinner">⏳</div>
                    <p>Loading trip details...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="trip-split-container">
                <div className="error-state">
                    <div className="error-icon">⚠️</div>
                    <h3>Something went wrong</h3>
                    <p>{error}</p>
                    <button onClick={handleGoBack} className="back-btn">
                        ← Back to Trip
                    </button>
                </div>
            </div>
        );
    }

    if (!trip) {
        return (
            <div className="trip-split-container">
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
        <div className="trip-split-container">
            {/* Header */}
            <div className="trip-split-header">
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

            {/* Tab Navigation */}
            <div className="tab-navigation">
                <button
                    className={`tab-btn ${activeTab === 'participants' ? 'active' : ''}`}
                    onClick={() => setActiveTab('participants')}
                >
                    👥 Participants
                </button>
                <button
                    className={`tab-btn ${activeTab === 'expenses' ? 'active' : ''}`}
                    onClick={() => setActiveTab('expenses')}
                >
                    💳 Expenses
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
                {activeTab === 'participants' && (
                    <ParticipantsSection
                        tripId={tripId}
                        refreshTrigger={refreshTrigger}
                        onDataChange={handleRefresh}
                    />
                )}
                {activeTab === 'expenses' && (
                    <ExpensesSection
                        tripId={tripId}
                        refreshTrigger={refreshTrigger}
                        onDataChange={handleRefresh}
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
        </div>
    );
};

export default TripSplit; 