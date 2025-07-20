// src/components/Trips/TripSplitComponents/ParticipantsSection.js
import React, { useState, useEffect } from 'react';
import { getParticipants, addParticipant, removeParticipant } from '../../../services/tripSplitService';

const ParticipantsSection = ({ tripId, refreshTrigger, onDataChange }) => {
    const [participants, setParticipants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [addMethod, setAddMethod] = useState('email'); // 'email' or 'username'
    const [formData, setFormData] = useState({
        email: '',
        username: '',
        display_name: ''
    });
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
            const participantData = {
                display_name: formData.display_name
            };

            if (addMethod === 'email') {
                participantData.email = formData.email;
            } else {
                participantData.username = formData.username;
            }

            await addParticipant(tripId, participantData);

            // Reset form
            setFormData({ email: '', username: '', display_name: '' });
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

    const handleRemoveParticipant = async (participantId) => {
        if (!window.confirm('Are you sure you want to remove this participant?')) {
            return;
        }

        try {
            await removeParticipant(tripId, participantId);
            fetchParticipants();
            onDataChange();
        } catch (error) {
            console.error('Error removing participant:', error);
            setError(error.response?.data?.error || 'Failed to remove participant');
        }
    };

    const resetForm = () => {
        setFormData({ email: '', username: '', display_name: '' });
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
                            <div className="add-method-selector">
                                <label className={`method-option ${addMethod === 'email' ? 'active' : ''}`}>
                                    <input
                                        type="radio"
                                        name="addMethod"
                                        value="email"
                                        checked={addMethod === 'email'}
                                        onChange={(e) => setAddMethod(e.target.value)}
                                    />
                                    📧 Add by Email
                                </label>
                                <label className={`method-option ${addMethod === 'username' ? 'active' : ''}`}>
                                    <input
                                        type="radio"
                                        name="addMethod"
                                        value="username"
                                        checked={addMethod === 'username'}
                                        onChange={(e) => setAddMethod(e.target.value)}
                                    />
                                    👤 Add by Username
                                </label>
                            </div>

                            <div className="form-group">
                                {addMethod === 'email' ? (
                                    <input
                                        type="email"
                                        placeholder="friend@example.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                    />
                                ) : (
                                    <input
                                        type="text"
                                        placeholder="username"
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                        required
                                    />
                                )}
                            </div>

                            <div className="form-group">
                                <input
                                    type="text"
                                    placeholder="Display name (optional)"
                                    value={formData.display_name}
                                    onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                                />
                            </div>

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
                                    onClick={() => handleRemoveParticipant(participant.id)}
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