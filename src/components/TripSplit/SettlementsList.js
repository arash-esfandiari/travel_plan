// src/components/TripSplit/SettlementsList.js
import React from 'react';
import { formatDate } from '../../utils/formatDate';

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

    // Pending first, then paid
    const pending = settlements.filter(s => !s.settled_at);
    const paid = settlements.filter(s => !!s.settled_at);

    const renderRow = (s) => (
        <div key={s.id} className={`settlement-item ${s.settled_at ? 'paid' : 'pending'}`}>
            <div className="settlement-arrow">💸</div>
            <div className="settlement-details">
                <div className="settlement-text">
                    <span className="name">{s.payer_first_name} {s.payer_last_name}</span>
                    <span className="arrow"> → </span>
                    <span className="name">{s.payee_first_name} {s.payee_last_name}</span>
                </div>
                <div className="settlement-row-bottom">
                    <div className="settlement-amount">${parseFloat(s.amount).toFixed(2)}</div>
                    <div className={`settlement-status ${s.settled_at ? 'paid' : 'pending'}`}>
                        {s.settled_at ? `Paid ${formatDate(s.settled_at)}` : 'Pending'}
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="settlements-list">
            {pending.map(renderRow)}
            {paid.length > 0 && (
                <div className="settlements-section-sep">Paid</div>
            )}
            {paid.map(renderRow)}
        </div>
    );
};

export default SettlementsList; 