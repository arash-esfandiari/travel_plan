// src/components/TripSplit/ParticipantModal.js
import React, { useState } from 'react';
import { addParticipant } from '../../services/tripSplitService';

const ParticipantModal = ({ trip, onClose }) => {
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({ identifier: '' });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.identifier) {
            alert("Provide an email or a username");
            return;
        }

        setSubmitting(true);
        try {
            const value = (formData.identifier || '').trim();
            const isEmail = /.+@.+\..+/.test(value);
            const payload = isEmail ? { email: value } : { username: value };
            await addParticipant(trip.id, payload);
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
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content participant-modal" onClick={(e) => e.stopPropagation()}>
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
                        <label>Email or Username</label>
                        <input
                            type="text"
                            name="identifier"
                            value={formData.identifier}
                            onChange={handleInputChange}
                            placeholder="Enter email or username"
                            required
                        />
                        <small className="form-hint">We’ll detect whether it’s an email or a username.</small>
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