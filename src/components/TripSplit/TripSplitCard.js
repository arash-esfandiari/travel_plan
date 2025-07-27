// src/components/TripSplit/TripSplitCard.js
import React, { useState, useEffect, useContext } from 'react';
import { formatDate } from '../../utils/formatDate';
import { getParticipants, getExpenses, getSettlements } from '../../services/tripSplitService';
import { AuthContext } from '../../context/AuthContext';
import SmartTripImage from '../Shared/SmartTripImage';
import ExpensesList from './ExpensesList';
import ParticipantsList from './ParticipantsList';
import SettlementsList from './SettlementsList';

const TripSplitCard = ({ trip, onAddExpense, onAddParticipant, onRefresh }) => {
    const { user } = useContext(AuthContext);
    const [expanded, setExpanded] = useState(false);
    const [activeTab, setActiveTab] = useState('expenses');
    const [participants, setParticipants] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [settlements, setSettlements] = useState([]);
    const [loading, setLoading] = useState(false);

    const toggleExpanded = () => {
        setExpanded(!expanded);
        if (!expanded) {
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

            setParticipants(participantsData.participants || []);
            setExpenses(expensesData.expenses || []);
            setSettlements(settlementsData.settlements || []);
        } catch (error) {
            console.error('Error fetching trip data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Calculate user's share
    const userShare = expenses.reduce((total, expense) => {
        const splits = expense.expense_splits || [];
        const userSplit = splits.find(split => split.user_id === user?.userId);
        return total + (userSplit ? parseFloat(userSplit.amount) : 0);
    }, 0);

    return (
        <div className={`trip-split-card ${expanded ? 'expanded' : ''}`}>
            <div className="card-header" onClick={toggleExpanded}>
                <div className="trip-image">
                    <SmartTripImage
                        src={trip.image_url}
                        alt={trip.trip_name}
                        className="card-trip-image"
                    />
                </div>

                <div className="trip-info">
                    <h3>{trip.trip_name}</h3>
                    <p className="trip-location">{trip.city_name}</p>
                    <p className="trip-dates">
                        {formatDate(trip.start_date)} - {formatDate(trip.end_date)}
                    </p>
                    <div className="trip-role">
                        <span className={`role-badge ${trip.user_role}`}>
                            {trip.user_role === 'owner' ? '👑 Trip Owner' : '🤝 Participant'}
                        </span>
                    </div>
                </div>

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
                        <span className="stat-value">${trip.total_expenses.toFixed(2)}</span>
                        <span className="stat-label">Total</span>
                    </div>
                </div>

                <div className="expand-icon">
                    {expanded ? '▲' : '▼'}
                </div>
            </div>

            {expanded && (
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