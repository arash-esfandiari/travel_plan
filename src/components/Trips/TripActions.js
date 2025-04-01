import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { deleteTrip } from '../../services/tripService';
import './TripActions.css';

const TripActions = ({ trip, onDeleted }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const navigate = useNavigate();

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    const handleUpdate = () => {
        navigate(`/trips/${trip.id}/edit`);
    };

    const handleDelete = () => {
        setConfirmDelete(true);
    };

    const confirmDeletion = async () => {
        try {
            await deleteTrip(trip.id);
            setConfirmDelete(false);
            setMenuOpen(false);
            if (onDeleted) onDeleted(trip.id);
        } catch (error) {
            console.error('Error deleting trip:', error);
            alert('Failed to delete trip.');
        }
    };

    const cancelDeletion = () => {
        setConfirmDelete(false);
    };

    return (
        <div className="trip-actions">
            <button className="burger-btn" onClick={toggleMenu}>⋮</button>
            {menuOpen && (
                <div className="menu-dropdown">
                    <button onClick={handleUpdate}>Edit Trip</button>
                    <button onClick={handleDelete}>Delete Trip</button>
                </div>
            )}
            {confirmDelete && (
                <div className="confirm-modal">
                    <div className="modal-content">
                        <p>Are you sure you want to delete your <strong>{trip.trip_name}</strong> trip?</p>
                        <div className="modal-actions">
                            <button onClick={cancelDeletion}>Cancel</button>
                            <button onClick={confirmDeletion} className="delete-btn">Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TripActions;