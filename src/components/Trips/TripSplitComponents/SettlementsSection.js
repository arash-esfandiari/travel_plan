// src/components/Trips/TripSplitComponents/SettlementsSection.js
import React, { useState, useEffect } from 'react';
import { calculateSettlements, getSettlements, markSettlementPaid } from '../../../services/tripSplitService';

const SettlementsSection = ({ tripId, refreshTrigger, onDataChange }) => {
    const [settlements, setSettlements] = useState([]);
    const [balances, setBalances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [calculating, setCalculating] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchSettlements();
    }, [tripId, refreshTrigger]);

    const fetchSettlements = async () => {
        try {
            setLoading(true);
            const data = await getSettlements(tripId);
            setSettlements(data);
            setError(null);
        } catch (error) {
            console.error('Error fetching settlements:', error);
            setError('Failed to load settlements');
        } finally {
            setLoading(false);
        }
    };

    const handleCalculateSettlements = async () => {
        try {
            setCalculating(true);
            const data = await calculateSettlements(tripId);
            setBalances(data.balances || []);
            setSettlements(data.settlements || []);
            onDataChange();
        } catch (error) {
            console.error('Error calculating settlements:', error);
            setError(error.response?.data?.error || 'Failed to calculate settlements');
        } finally {
            setCalculating(false);
        }
    };

    const handleMarkPaid = async (settlementId) => {
        if (!window.confirm('Mark this settlement as paid?')) {
            return;
        }

        try {
            await markSettlementPaid(settlementId);
            fetchSettlements();
            onDataChange();
        } catch (error) {
            console.error('Error marking settlement as paid:', error);
            setError(error.response?.data?.error || 'Failed to mark settlement as paid');
        }
    };

    const getTotalOwed = () => {
        return settlements
            .filter(s => !s.is_settled)
            .reduce((total, settlement) => total + parseFloat(settlement.amount), 0)
            .toFixed(2);
    };

    const getPersonalBalance = (participantName) => {
        const balance = balances.find(b => b.display_name === participantName);
        return balance ? parseFloat(balance.balance) : 0;
    };

    const formatBalance = (amount) => {
        const value = parseFloat(amount);
        if (value > 0) {
            return { text: `+$${value.toFixed(2)}`, class: 'positive' };
        } else if (value < 0) {
            return { text: `-$${Math.abs(value).toFixed(2)}`, class: 'negative' };
        }
        return { text: '$0.00', class: 'neutral' };
    };

    if (loading) {
        return (
            <div className="settlements-section">
                <div className="loading-state">
                    <div className="loading-spinner">⏳</div>
                    <p>Loading settlements...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="settlements-section">
            <div className="section-header">
                <h2>🧮 Trip Settlements</h2>
                <button
                    className="calculate-btn"
                    onClick={handleCalculateSettlements}
                    disabled={calculating}
                >
                    {calculating ? '⏳ Calculating...' : '🔄 Calculate Settlements'}
                </button>
            </div>

            {error && (
                <div className="error-message">
                    <span className="error-icon">⚠️</span>
                    {error}
                </div>
            )}

            {/* Balances Summary */}
            {balances.length > 0 && (
                <div className="balances-summary">
                    <h3>💰 Individual Balances</h3>
                    <div className="balances-grid">
                        {balances.map(balance => {
                            const formattedBalance = formatBalance(balance.balance);
                            return (
                                <div key={balance.participant_id} className="balance-card">
                                    <div className="balance-participant">
                                        <div className="participant-avatar">
                                            {parseFloat(balance.balance) > 0 ? '💰' :
                                                parseFloat(balance.balance) < 0 ? '💸' : '⚖️'}
                                        </div>
                                        <div className="participant-info">
                                            <h4>{balance.display_name}</h4>
                                            <p>{balance.email}</p>
                                        </div>
                                    </div>
                                    <div className={`balance-amount ${formattedBalance.class}`}>
                                        {formattedBalance.text}
                                    </div>
                                    <div className="balance-details">
                                        <div className="balance-detail">
                                            <span>Paid:</span>
                                            <span>${parseFloat(balance.total_paid).toFixed(2)}</span>
                                        </div>
                                        <div className="balance-detail">
                                            <span>Owes:</span>
                                            <span>${parseFloat(balance.total_owed).toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Settlements List */}
            <div className="settlements-list">
                {settlements.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">🧮</div>
                        <h3>No settlements calculated</h3>
                        <p>Add some expenses first, then calculate settlements to see who owes what</p>
                        <button
                            className="empty-action-btn"
                            onClick={handleCalculateSettlements}
                            disabled={calculating}
                        >
                            {calculating ? 'Calculating...' : 'Calculate Settlements'}
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="settlements-header">
                            <h3>📊 Who Owes What</h3>
                            <div className="settlements-summary">
                                <span className="total-amount">
                                    Total Outstanding: ${getTotalOwed()}
                                </span>
                            </div>
                        </div>

                        <div className="settlements-cards">
                            {settlements.map(settlement => (
                                <div
                                    key={settlement.id}
                                    className={`settlement-card ${settlement.is_settled ? 'settled' : 'pending'}`}
                                >
                                    <div className="settlement-participants">
                                        <div className="participant from-participant">
                                            <div className="participant-avatar">💸</div>
                                            <div className="participant-info">
                                                <h4>{settlement.from_name}</h4>
                                                <p>{settlement.from_email}</p>
                                            </div>
                                        </div>

                                        <div className="settlement-arrow">
                                            <div className="arrow-line"></div>
                                            <div className="arrow-head">→</div>
                                            <div className="settlement-amount">
                                                ${parseFloat(settlement.amount).toFixed(2)}
                                            </div>
                                        </div>

                                        <div className="participant to-participant">
                                            <div className="participant-avatar">💰</div>
                                            <div className="participant-info">
                                                <h4>{settlement.to_name}</h4>
                                                <p>{settlement.to_email}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="settlement-status">
                                        {settlement.is_settled ? (
                                            <div className="status-settled">
                                                <span className="status-icon">✅</span>
                                                <span>Paid on {new Date(settlement.settled_at).toLocaleDateString()}</span>
                                            </div>
                                        ) : (
                                            <div className="settlement-actions">
                                                <button
                                                    className="mark-paid-btn"
                                                    onClick={() => handleMarkPaid(settlement.id)}
                                                >
                                                    ✅ Mark as Paid
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {settlements.filter(s => !s.is_settled).length === 0 && settlements.length > 0 && (
                            <div className="all-settled">
                                <div className="celebration-icon">🎉</div>
                                <h3>All Settled!</h3>
                                <p>Everyone has paid their share. The trip expenses are fully settled.</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default SettlementsSection; 