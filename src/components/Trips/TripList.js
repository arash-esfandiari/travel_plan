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

    useEffect(() => {
        const fetchTrips = async () => {
            try {
                const data = await getTrips();
                setTrips(data);
            } catch (error) {
                console.error('Error fetching trips:', error);
            }
        };
        fetchTrips();
    }, []);

    const handleTripCreated = (newTrip) => {
        // Prepend the new trip to the list
        setTrips([newTrip, ...trips]);
    };

    const handleTripDeleted = (deletedTripId) => {
        setTrips(trips.filter(trip => trip.id !== deletedTripId));
    };

    return (
        <div className="trip-list-container">
            <h2>Your Trips</h2>
            <div className="create-trip-section">
                <button
                    className="create-trip-btn"
                    onClick={() => setShowCreateModal(true)}
                >
                    ➕ Create a Trip
                </button>
            </div>
            {showCreateModal && (
                <TripCreateModal
                    onClose={() => setShowCreateModal(false)}
                    onTripCreated={handleTripCreated}
                />
            )}
            <div className="trip-list">
                {trips.map(trip => (
                    <div key={trip.id} className="trip-card-wrapper">
                        <Link to={`/trips/${trip.id}`} className="trip-card">
                            <img
                                src={trip.image_url ? `${trip.image_url}` : '../assets/images/placeholder.jpg'}
                                alt={trip.trip_name}
                                className="trip-image"
                            />
                            <div className="trip-details">
                                <h3>{trip.trip_name}</h3>
                                <p>{formatDate(trip.start_date)} - {formatDate(trip.end_date)}</p>
                                <p>{trip.description}</p>
                            </div>
                        </Link>
                        <TripActions trip={trip} onDeleted={handleTripDeleted} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TripList;