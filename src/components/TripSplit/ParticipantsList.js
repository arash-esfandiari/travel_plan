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

    // Sort by owner first, then name
    const others = participants
        .filter(p => p.username !== tripOwner)
        .slice()
        .sort((a, b) => {
            const an = `${a.first_name || ''} ${a.last_name || ''}`.trim().toLowerCase();
            const bn = `${b.first_name || ''} ${b.last_name || ''}`.trim().toLowerCase();
            return an.localeCompare(bn);
        });

    return (
        <div className="participants-list">
            <div className="list-header">
                <div className="list-title">People</div>
                <div className="list-total">{participants.length} total</div>
            </div>

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
            {others.map((participant) => (
                <div key={participant.user_id || participant.id} className="participant-item">
                    <div className="participant-avatar">🤝</div>
                    <div className="participant-details">
                        <div className="participant-name">
                            {participant.first_name && participant.last_name
                                ? `${participant.first_name} ${participant.last_name}`
                                : (participant.username || 'Unknown')}
                        </div>
                        {participant.email && (
                            <div className="participant-email">{participant.email}</div>
                        )}
                        {participant.joined_at && (
                            <div className="participant-joined">
                                Joined {new Date(participant.joined_at).toLocaleDateString()}
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ParticipantsList; 