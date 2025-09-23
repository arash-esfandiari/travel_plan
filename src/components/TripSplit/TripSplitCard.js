// src/components/TripSplit/TripSplitCard.js
import React, { useState, useContext } from 'react';
import { formatDate } from '../../utils/formatDate';
import { getParticipants, getExpenses, getSettlements, calculateSettlements } from '../../services/tripSplitService';
import { AuthContext } from '../../context/AuthContext';
import SmartTripImage from '../Shared/SmartTripImage';
import ExpensesList from './ExpensesList';
import ParticipantsList from './ParticipantsList';
import SettlementsList from './SettlementsList';

const TripSplitCard = ({ trip, onAddExpense, onAddParticipant, onRefresh, onClick, compact = false, expanded = false, showActions = false, disableExpand = false }) => {
    const { user } = useContext(AuthContext);
    const [isExpanded, setIsExpanded] = useState(expanded);
    const [activeTab, setActiveTab] = useState('expenses');
    const [participants, setParticipants] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [settlements, setSettlements] = useState([]);
    const [loading, setLoading] = useState(false);

    // Use prop-controlled expanded state if provided
    React.useEffect(() => {
        setIsExpanded(expanded);
        if (expanded) {
            fetchTripData();
        }
    }, [expanded]);

    // Fetch participants for compact cards on mount
    React.useEffect(() => {
        if (compact) {
            fetchParticipants();
        }
    }, [compact]);

    const fetchParticipants = async () => {
        try {
            const participantsData = await getParticipants(trip.id);
            setParticipants(participantsData || []);
        } catch (error) {
            console.error('Error fetching participants:', error);
            setParticipants([]);
        }
    };

    const toggleExpanded = () => {
        if (disableExpand) {
            return; // Do nothing if expand is disabled
        }
        if (compact && onClick) {
            onClick();
            return;
        }
        setIsExpanded(!isExpanded);
        if (!isExpanded) {
            fetchTripData();
        }
    };

    const fetchTripData = async () => {
        setLoading(true);
        try {
            const [participantsData, expensesData, settlementsData] = await Promise.all([
                getParticipants(trip.id),
                getExpenses(trip.id),
                getSettlements(trip.id)
            ]);

            // API responses return raw arrays; no nested keys
            setParticipants(participantsData || []);
            setExpenses(expensesData || []);
            let currentSettlements = settlementsData || [];
            // If no settlements exist yet, calculate and store them, then refetch
            if (currentSettlements.length === 0 && (expensesData || []).length > 0) {
                try {
                    const calc = await calculateSettlements(trip.id);
                    currentSettlements = (calc && calc.settlements) ? calc.settlements : await getSettlements(trip.id);
                } catch (e) {
                    // Fallback to empty if calculation fails
                    currentSettlements = [];
                }
            }
            setSettlements(currentSettlements || []);
        } catch (error) {
            console.error('Error fetching trip data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Refresh details when expanded card receives new aggregated counts/totals
    React.useEffect(() => {
        if (expanded) {
            fetchTripData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [expanded, trip.expense_count, trip.total_expenses, trip.participant_count]);

    // When user switches to Settlements tab, ensure calculation and refresh
    React.useEffect(() => {
        const ensureSettlements = async () => {
            if (!expanded || activeTab !== 'settlements') return;
            try {
                setLoading(true);
                const calc = await calculateSettlements(trip.id);
                if (calc && Array.isArray(calc.settlements)) {
                    setSettlements(calc.settlements);
                } else {
                    const s = await getSettlements(trip.id);
                    setSettlements(s || []);
                }
            } catch (e) {
                // ignore, UI will just show none
            } finally {
                setLoading(false);
            }
        };
        ensureSettlements();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab, expanded, trip.id]);

    // Calculate user's share
    const userShare = expenses.reduce((total, expense) => {
        const participants = expense.participants || [];
        const userParticipation = participants.find(participant => participant.user_id === user?.userId);
        return total + (userParticipation ? parseFloat(userParticipation.share_amount) : 0);
    }, 0);

    return (
        <div className={`list-trip-split-card ${isExpanded ? 'expanded' : ''} ${compact ? 'compact' : ''} ${disableExpand ? 'no-expand' : ''}`}>
            <div className="card-image-container" onClick={disableExpand ? undefined : toggleExpanded}>
                <SmartTripImage
                    trip={trip}
                    alt={trip.trip_name}
                    className="card-trip-image"
                />
            </div>

            <div className="card-header" onClick={disableExpand ? undefined : toggleExpanded}>
                <div className="trip-info">
                    <h3>{trip.trip_name}</h3>
                    <div className="info-item">
                        <span className="info-icon">📅</span>
                        <span className="info-text">
                            {formatDate(trip.start_date)} - {formatDate(trip.end_date)}
                        </span>
                    </div>
                    <div className="info-item">
                        <span className="info-icon">👥</span>
                        <span className="info-text">
                            {trip.participant_count || participants.length} {(trip.participant_count || participants.length) === 1 ? 'Person' : 'People'}
                        </span>
                    </div>
                    <div className="info-item">
                        <span className="info-icon">💰</span>
                        <span className="info-text">
                            ${(trip.total_expenses || 0).toFixed(2)} Total
                        </span>
                    </div>
                    {trip.user_role && (
                        <div className="info-item">
                            <span className="info-icon">{trip.user_role === 'owner' ? '👑' : '🤝'}</span>
                            <span className="info-text">
                                {trip.user_role === 'owner' ? 'Trip Owner' : 'Participant'}
                            </span>
                        </div>
                    )}
                </div>

                {!compact && (
                    <div className="trip-stats">
                        <div className="stat">
                            <span className="stat-value">{trip.participant_count}</span>
                            <span className="stat-label">People</span>
                        </div>
                        <div className="stat">
                            <span className="stat-value">{trip.expense_count}</span>
                            <span className="stat-label">Expenses</span>
                        </div>
                        <div className="stat">
                            <span className="stat-value">${(trip.total_expenses || 0).toFixed(2)}</span>
                            <span className="stat-label">Total</span>
                        </div>
                    </div>
                )}

                {!compact && !disableExpand && (
                    <div className="expand-icon">
                        {isExpanded ? '▲' : '▼'}
                    </div>
                )}
            </div>

            {(isExpanded || showActions) && (
                <div className="card-content">
                    {loading ? (
                        <div className="loading-details">
                            <span>Loading trip details...</span>
                        </div>
                    ) : (
                        <>
                            {/* Quick Actions */}
                            <div className="quick-actions">
                                <button
                                    className="action-btn expense-btn"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onAddExpense(trip);
                                    }}
                                >
                                    💰 Add Expense
                                </button>
                                <button
                                    className="action-btn participant-btn"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onAddParticipant(trip);
                                    }}
                                >
                                    👥 Add Friend
                                </button>
                                <div className="user-share">
                                    Your share: <strong>${userShare.toFixed(2)}</strong>
                                </div>
                            </div>

                            {/* Tabs */}
                            <div className="card-tabs">
                                <button
                                    className={`tab ${activeTab === 'expenses' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('expenses')}
                                >
                                    💳 Expenses ({expenses.length})
                                </button>
                                <button
                                    className={`tab ${activeTab === 'participants' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('participants')}
                                >
                                    👥 People ({participants.length})
                                </button>
                                <button
                                    className={`tab ${activeTab === 'settlements' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('settlements')}
                                >
                                    🎯 Settlements ({settlements.length})
                                </button>
                            </div>

                            {/* Tab Content */}
                            <div className="tab-content">
                                {activeTab === 'expenses' && (
                                    <ExpensesList
                                        expenses={expenses}
                                        tripId={trip.id}
                                        onRefresh={onRefresh}
                                    />
                                )}
                                {activeTab === 'participants' && (
                                    <ParticipantsList
                                        participants={participants}
                                        tripId={trip.id}
                                        tripOwner={trip.trip_owner_username}
                                        onRefresh={onRefresh}
                                    />
                                )}
                                {activeTab === 'settlements' && (
                                    <SettlementsList
                                        settlements={settlements}
                                        tripId={trip.id}
                                        onRefresh={onRefresh}
                                    />
                                )}
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default TripSplitCard; 