// src/components/TripSplit/ParticipantModal.js
import React, { useState } from 'react';
import { addParticipant } from '../../services/tripSplitService';

const ParticipantModal = ({ trip, onClose }) => {
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        name: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.email || !formData.name) {
            alert('Please fill in all required fields');
            return;
        }

        setSubmitting(true);
        try {
            await addParticipant(trip.id, formData);
            onClose(); // This will trigger refresh in parent
        } catch (error) {
            console.error('Error adding participant:', error);
            if (error.response?.data?.error) {
                alert(error.response.data.error);
            } else {
                alert('Failed to add participant. Please try again.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content participant-modal">
                <div className="modal-header">
                    <h3>👥 Add Friend</h3>
                    <h4>{trip.trip_name}</h4>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <form onSubmit={handleSubmit} className="participant-form">
                    <div className="form-info">
                        <p>Add a friend to share expenses for this trip. They'll be able to add expenses and view settlements.</p>
                    </div>

                    <div className="form-group">
                        <label>Friend's Name *</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="Enter their name"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Friend's Email *</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="Enter their email address"
                            required
                        />
                        <small className="form-hint">
                            If they don't have an account, they'll be invited to create one.
                        </small>
                    </div>

                    <div className="modal-actions">
                        <button
                            type="button"
                            className="cancel-btn"
                            onClick={onClose}
                            disabled={submitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="submit-btn"
                            disabled={submitting}
                        >
                            {submitting ? 'Adding...' : 'Add Friend'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ParticipantModal; 