// src/components/TripSplit/SettlementsList.js
import React from 'react';

const SettlementsList = ({ settlements, tripId, onRefresh }) => {
    if (settlements.length === 0) {
        return (
            <div className="empty-list">
                <div className="empty-icon">🎯</div>
                <p>No settlements needed</p>
                <small>All expenses are settled up!</small>
            </div>
        );
    }

    return (
        <div className="settlements-list">
            {settlements.map((settlement) => (
                <div key={settlement.id} className="settlement-item">
                    <div className="settlement-arrow">💸</div>
                    <div className="settlement-details">
                        <div className="settlement-text">
                            <strong>{settlement.from_user_name}</strong> owes{' '}
                            <strong>{settlement.to_user_name}</strong>
                        </div>
                        <div className="settlement-amount">
                            ${parseFloat(settlement.amount).toFixed(2)}
                        </div>
                    </div>
                    <div className={`settlement-status ${settlement.status}`}>
                        {settlement.status === 'pending' && '⏳ Pending'}
                        {settlement.status === 'paid' && '✅ Paid'}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default SettlementsList; 