// src/components/TripSplit/ParticipantsList.js
import React from 'react';

const ParticipantsList = ({ participants, tripId, tripOwner, onRefresh }) => {
    if (participants.length === 0) {
        return (
            <div className="empty-list">
                <div className="empty-icon">👥</div>
                <p>Just you for now</p>
                <small>Add friends to share expenses!</small>
            </div>
        );
    }

    return (
        <div className="participants-list">
            {/* Trip Owner */}
            <div className="participant-item owner">
                <div className="participant-avatar">👑</div>
                <div className="participant-details">
                    <div className="participant-name">{tripOwner}</div>
                    <div className="participant-role">Trip Owner</div>
                </div>
                <div className="participant-status">Owner</div>
            </div>

            {/* Other Participants */}
            {participants.map((participant) => (
                <div key={participant.id} className="participant-item">
                    <div className="participant-avatar">🤝</div>
                    <div className="participant-details">
                        <div className="participant-name">
                            {participant.user_name || participant.invited_name || 'Unknown'}
                        </div>
                        <div className="participant-email">
                            {participant.user_email || participant.invited_email}
                        </div>
                    </div>
                    <div className={`participant-status ${participant.status}`}>
                        {participant.status === 'accepted' && '✅ Joined'}
                        {participant.status === 'pending' && '⏳ Invited'}
                        {participant.status === 'declined' && '❌ Declined'}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ParticipantsList; 