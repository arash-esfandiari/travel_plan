// src/components/Trips/TripSplitComponents/ParticipantsSection.js
import React, { useState, useEffect } from 'react';
import { getParticipants, addParticipant, removeParticipant } from '../../../services/tripSplitService';

const ParticipantsSection = ({ tripId, refreshTrigger, onDataChange }) => {
    const [participants, setParticipants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [formData, setFormData] = useState({ identifier: '' });
    const [adding, setAdding] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchParticipants();
    }, [tripId, refreshTrigger]);

    const fetchParticipants = async () => {
        try {
            setLoading(true);
            const data = await getParticipants(tripId);
            setParticipants(data);
            setError(null);
        } catch (error) {
            console.error('Error fetching participants:', error);
            setError('Failed to load participants');
        } finally {
            setLoading(false);
        }
    };

    const handleAddParticipant = async (e) => {
        e.preventDefault();
        setAdding(true);
        setError(null);

        try {
            const value = (formData.identifier || '').trim();
            const isEmail = /.+@.+\..+/.test(value);
            const participantData = isEmail ? { email: value } : { username: value };

            await addParticipant(tripId, participantData);

            // Reset form
            setFormData({ identifier: '' });
            setShowAddForm(false);

            // Refresh data
            fetchParticipants();
            onDataChange();
        } catch (error) {
            console.error('Error adding participant:', error);
            setError(error.response?.data?.error || 'Failed to add participant');
        } finally {
            setAdding(false);
        }
    };

    const handleRemoveParticipant = async (userId) => {
        if (!window.confirm('Are you sure you want to remove this participant?')) {
            return;
        }

        try {
            await removeParticipant(tripId, userId);
            fetchParticipants();
            onDataChange();
        } catch (error) {
            console.error('Error removing participant:', error);
            setError(error.response?.data?.error || 'Failed to remove participant');
        }
    };

    const resetForm = () => {
        setFormData({ identifier: '' });
        setShowAddForm(false);
        setError(null);
    };

    if (loading) {
        return (
            <div className="participants-section">
                <div className="loading-state">
                    <div className="loading-spinner">⏳</div>
                    <p>Loading participants...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="participants-section">
            <div className="section-header">
                <h2>👥 Trip Participants</h2>
                <button
                    className="add-participant-btn"
                    onClick={() => setShowAddForm(true)}
                >
                    + Add Friend
                </button>
            </div>

            {error && (
                <div className="error-message">
                    <span className="error-icon">⚠️</span>
                    {error}
                </div>
            )}

            {/* Add Participant Form */}
            {showAddForm && (
                <div className="add-participant-modal">
                    <div className="modal-overlay" onClick={resetForm}></div>
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Add Friend to Trip</h3>
                            <button className="close-btn" onClick={resetForm}>×</button>
                        </div>

                        <form onSubmit={handleAddParticipant}>
                            <div className="form-group">
                                <input
                                    type="text"
                                    placeholder="Enter email or username"
                                    value={formData.identifier}
                                    onChange={(e) => setFormData({ identifier: e.target.value })}
                                    required
                                />
                                <small className="form-hint">We’ll detect whether it’s an email or a username.</small>
                            </div>

                            {/* No display name needed */}

                            <div className="modal-actions">
                                <button type="button" onClick={resetForm} className="cancel-btn">
                                    Cancel
                                </button>
                                <button type="submit" disabled={adding} className="add-btn">
                                    {adding ? 'Adding...' : 'Add Friend'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Participants List */}
            <div className="participants-list">
                {participants.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">👥</div>
                        <h3>No participants yet</h3>
                        <p>Add friends to start splitting expenses</p>
                        <button
                            className="empty-action-btn"
                            onClick={() => setShowAddForm(true)}
                        >
                            Add Your First Friend
                        </button>
                    </div>
                ) : (
                    participants.map(participant => (
                        <div key={participant.id} className="participant-card">
                            <div className="participant-info">
                                <div className="participant-avatar">
                                    {participant.is_owner ? '👑' : '👤'}
                                </div>
                                <div className="participant-details">
                                    <h4 className="participant-name">
                                        {participant.display_name}
                                        {participant.is_owner && <span className="owner-badge">Owner</span>}
                                    </h4>
                                    <p className="participant-contact">
                                        {participant.user_email || participant.email}
                                        {participant.username && (
                                            <span className="username">@{participant.username}</span>
                                        )}
                                    </p>
                                    <p className="participant-joined">
                                        Joined {new Date(participant.joined_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            {!participant.is_owner && (
                                <button
                                    className="remove-btn"
                                    onClick={() => handleRemoveParticipant(participant.user_id)}
                                    title="Remove participant"
                                >
                                    🗑️
                                </button>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ParticipantsSection; 