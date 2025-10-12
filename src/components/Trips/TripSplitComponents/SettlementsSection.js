// src/components/Trips/TripSplitComponents/SettlementsSection.js
import React, { useState, useEffect, useCallback } from 'react';
import { calculateSettlements, getSettlements, markSettlementPaid } from '../../../services/tripSplitService';

const SettlementsSection = ({ tripId, refreshTrigger, onDataChange }) => {
    const [settlements, setSettlements] = useState([]);
    const [balances, setBalances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [calculating, setCalculating] = useState(false);
    const [error, setError] = useState(null);

    const fetchSettlements = useCallback(async () => {
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
    }, [tripId]);

    useEffect(() => {
        fetchSettlements();
    }, [fetchSettlements, refreshTrigger]);

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
            .filter(s => !s.settled_at) // Check if settled_at is null
            .reduce((total, settlement) => total + parseFloat(settlement.amount), 0)
            .toFixed(2);
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
                                <div key={balance.user_id} className={`balance-card ${formattedBalance.class}`}>
                                    {/* Card Header */}
                                    <div className="balance-card-header">
                                        <div className="balance-status-badge">
                                            <span className="status-icon">
                                                {parseFloat(balance.balance) > 0 ? '💰' :
                                                    parseFloat(balance.balance) < 0 ? '💸' : '⚖️'}
                                            </span>
                                            <span className="status-label">
                                                {parseFloat(balance.balance) > 0 ? 'Gets Money' :
                                                    parseFloat(balance.balance) < 0 ? 'Owes Money' : 'Even'}
                                            </span>
                                        </div>
                                        <div className={`balance-amount-display ${formattedBalance.class}`}>
                                            <span className="balance-amount-text">
                                                {Math.abs(parseFloat(balance.balance)).toFixed(2)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Main Content */}
                                    <div className="balance-main-content">
                                        <div className="balance-avatar-large">
                                            {parseFloat(balance.balance) > 0 ? '💰' :
                                                parseFloat(balance.balance) < 0 ? '💸' : '⚖️'}
                                        </div>
                                        <div className="balance-participant-info">
                                            <h3 className="participant-name">
                                                {balance.first_name} {balance.last_name}
                                            </h3>
                                            <p className="participant-email">{balance.email}</p>
                                        </div>
                                    </div>

                                    {/* Footer with Details */}
                                    <div className="balance-footer">
                                        <div className="balance-breakdown">
                                            <div className="breakdown-item">
                                                <span className="breakdown-icon">💳</span>
                                                <span className="breakdown-label">Paid</span>
                                                <span className="breakdown-value">{parseFloat(balance.total_paid).toFixed(2)}</span>
                                            </div>
                                            <div className="breakdown-item">
                                                <span className="breakdown-icon">📊</span>
                                                <span className="breakdown-label">Share</span>
                                                <span className="breakdown-value">{parseFloat(balance.total_owed).toFixed(2)}</span>
                                            </div>
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
                                    className={`settlement-card ${settlement.settled_at ? 'settled' : 'pending'}`}
                                >
                                    {/* Card Header */}
                                    <div className="settlement-card-header">
                                        <div className="settlement-status-badge">
                                            <span className="status-icon">
                                                {settlement.settled_at ? '✅' : '⏳'}
                                            </span>
                                            <span className="status-label">
                                                {settlement.settled_at ? 'Settled' : 'Pending'}
                                            </span>
                                        </div>
                                        <div className="settlement-amount-display">
                                            <span className="settlement-amount-text">
                                                {parseFloat(settlement.amount).toFixed(2)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Main Content - Payment Flow */}
                                    <div className="settlement-main-content">
                                        <div className="payment-flow">
                                            <div className="payer-section">
                                                <div className="participant-avatar payer">💸</div>
                                                <div className="participant-details">
                                                    <h4 className="participant-name">
                                                        {settlement.payer_first_name} {settlement.payer_last_name}
                                                    </h4>
                                                    <p className="participant-email">{settlement.payer_email}</p>
                                                    <span className="participant-role">Owes</span>
                                                </div>
                                            </div>

                                            <div className="payment-arrow">
                                                <div className="arrow-container">
                                                    <div className="arrow-line"></div>
                                                    <div className="arrow-head">→</div>
                                                </div>
                                                <div className="payment-label">pays</div>
                                            </div>

                                            <div className="payee-section">
                                                <div className="participant-avatar payee">💰</div>
                                                <div className="participant-details">
                                                    <h4 className="participant-name">
                                                        {settlement.payee_first_name} {settlement.payee_last_name}
                                                    </h4>
                                                    <p className="participant-email">{settlement.payee_email}</p>
                                                    <span className="participant-role">Receives</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="settlement-footer">
                                        {settlement.settled_at ? (
                                            <div className="settlement-completed">
                                                <span className="completion-icon">✅</span>
                                                <span className="completion-text">
                                                    Paid on {new Date(settlement.settled_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                        ) : (
                                            <div className="settlement-actions">
                                                <button
                                                    className="action-btn mark-paid-btn"
                                                    onClick={() => handleMarkPaid(settlement.id)}
                                                >
                                                    <span className="btn-icon">✅</span>
                                                    <span className="btn-text">Mark as Paid</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {settlements.filter(s => !s.settled_at).length === 0 && settlements.length > 0 && (
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