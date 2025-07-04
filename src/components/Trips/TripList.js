import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getTrips } from '../../services/tripService';
import TripActions from './TripActions';
import TripCreateModal from './TripCreateModal';
import { formatDate } from '../../utils/formatDate';
import './TripList.css';



const TripList = () => {
    const [trips, setTrips] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Animated emojis for the floating icons
    const emojis = ['✈️', '🗺️', '🏛️', '🌍', '🎒', '📸', '🏖️', '🗽', '🎡', '🏰'];

    useEffect(() => {
        const fetchTrips = async () => {
            try {
                setIsLoading(true);
                const data = await getTrips();
                setTrips(data);
            } catch (error) {
                console.error('Error fetching trips:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchTrips();
    }, []);

    const handleTripCreated = (newTrip) => {
        // Prepend the new trip to the list with animation
        setTrips([newTrip, ...trips]);
    };

    const handleTripDeleted = (deletedTripId) => {
        setTrips(trips.filter(trip => trip.id !== deletedTripId));
    };

    return (
        <div className="trips-page">

            {/* Floating decorative icons */}
            {emojis.map((emoji, index) => (
                <div
                    key={index}
                    className={`floating-emoji floating-emoji-${index + 1}`}
                    style={{ animationDelay: `${index * 0.5}s` }}
                >
                    <span>{emoji}</span>
                </div>
            ))}

            {/* Main content container */}
            <div className="trips-container">
                {/* Header Section */}
                <div className="trips-header">
                    <div className="header-content">
                        <div className="header-logo">
                            <span className="logo-emoji">🗺️</span>
                            <h1 className="trips-title">Your Adventures</h1>
                        </div>
                        <p className="trips-subtitle">All your planned and completed journeys in one place</p>
                    </div>
                </div>

                {/* Create Trip Section */}
                <div className="create-trip-section">
                    <button
                        className="create-trip-btn"
                        onClick={() => setShowCreateModal(true)}
                    >
                        <span className="btn-icon">➕</span>
                        <span className="btn-text">Plan New Adventure</span>
                        <span className="btn-arrow">➤</span>
                    </button>
                </div>

                {/* Trips Grid */}
                <div className="trips-content">
                    {isLoading ? (
                        <div className="loading-container">
                            <div className="loading-spinner">⏳</div>
                            <p>Loading your adventures...</p>
                        </div>
                    ) : trips.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">🌍</div>
                            <h3>No Adventures Yet</h3>
                            <p>Start planning your first trip and create amazing memories!</p>
                            <button
                                className="empty-state-btn"
                                onClick={() => setShowCreateModal(true)}
                            >
                                Create Your First Trip
                            </button>
                        </div>
                    ) : (
                        <div className="trips-grid">
                            {trips.map((trip, index) => (
                                <div
                                    key={trip.id}
                                    className="trip-card-wrapper"
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    <Link to={`/trips/${trip.id}`} className="trip-card">
                                        <div className="card-image-container">
                                            <img
                                                src={trip.image_url ? `${trip.image_url}` : '../assets/images/placeholder.jpg'}
                                                alt={trip.trip_name}
                                                className="trip-image"
                                            />
                                            <div className="card-overlay">
                                                <span className="view-details">View Details ➤</span>
                                            </div>
                                        </div>
                                        <div className="trip-details">
                                            <div className="trip-header">
                                                <h3 className="trip-title">{trip.trip_name}</h3>
                                                <span className="trip-status">Active</span>
                                            </div>
                                            <div className="trip-info">
                                                <div className="info-item">
                                                    <span className="info-icon">📅</span>
                                                    <span className="info-text">
                                                        {formatDate(trip.start_date)} - {formatDate(trip.end_date)}
                                                    </span>
                                                </div>
                                                <div className="info-item">
                                                    <span className="info-icon">📝</span>
                                                    <span className="info-text">{trip.description}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                    <TripActions trip={trip} onDeleted={handleTripDeleted} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Create Trip Modal */}
            {showCreateModal && (
                <TripCreateModal
                    onClose={() => setShowCreateModal(false)}
                    onTripCreated={handleTripCreated}
                />
            )}
        </div>
    );
};

export default TripList;