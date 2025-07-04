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
            <button className="actions-btn" onClick={toggleMenu}>
                <span className="actions-icon">⚙️</span>
            </button>
            {menuOpen && (
                <div className="actions-dropdown">
                    <button className="action-item edit-action" onClick={handleUpdate}>
                        <span className="action-icon">✏️</span>
                        <span className="action-text">Edit Trip</span>
                    </button>
                    <button className="action-item delete-action" onClick={handleDelete}>
                        <span className="action-icon">🗑️</span>
                        <span className="action-text">Delete Trip</span>
                    </button>
                </div>
            )}
            {confirmDelete && (
                <div className="confirm-overlay">
                    <div className="confirm-modal">
                        <div className="confirm-header">
                            <span className="confirm-icon">⚠️</span>
                            <h3>Delete Trip</h3>
                        </div>
                        <p>Are you sure you want to delete <strong>"{trip.trip_name}"</strong>?</p>
                        <p className="confirm-warning">This action cannot be undone.</p>
                        <div className="confirm-actions">
                            <button className="cancel-btn" onClick={cancelDeletion}>
                                <span className="btn-icon">❌</span>
                                Cancel
                            </button>
                            <button className="delete-btn" onClick={confirmDeletion}>
                                <span className="btn-icon">🗑️</span>
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TripActions;