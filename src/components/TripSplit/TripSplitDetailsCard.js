// src/components/TripSplit/TripSplitDetailsCard.js
import React, { useState, useEffect, useContext } from 'react';
import { formatDate } from '../../utils/formatDate';
import { getParticipants, getExpenses, getSettlements, calculateSettlements } from '../../services/tripSplitService';
import { AuthContext } from '../../context/AuthContext';
import SmartTripImage from '../Shared/SmartTripImage';
import ExpensesList from './ExpensesList';
import ParticipantsList from './ParticipantsList';
import SettlementsList from './SettlementsList';
import './TripSplitDetailsCard.css';

const TripSplitDetailsCard = ({ trip, onAddExpense, onAddParticipant, onRefresh }) => {
    const { user } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('expenses');
    const [participants, setParticipants] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [settlements, setSettlements] = useState([]);
    const [loading, setLoading] = useState(false);

    // Fetch trip data on mount
    useEffect(() => {
        fetchTripData();
    }, [trip.id]);

    const fetchTripData = async () => {
        setLoading(true);
        try {
            const [participantsData, expensesData, settlementsData] = await Promise.all([
                getParticipants(trip.id),
                getExpenses(trip.id),
                getSettlements(trip.id)
            ]);

            setParticipants(participantsData || []);
            setExpenses(expensesData || []);
            let currentSettlements = settlementsData || [];

            // If no settlements exist yet, calculate and store them
            if (currentSettlements.length === 0 && (expensesData || []).length > 0) {
                try {
                    const calc = await calculateSettlements(trip.id);
                    currentSettlements = (calc && calc.settlements) ? calc.settlements : await getSettlements(trip.id);
                } catch (e) {
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

    // Refresh details when trip data changes
    useEffect(() => {
        fetchTripData();
    }, [trip.expense_count, trip.total_expenses, trip.participant_count]);

    // When user switches to Settlements tab, ensure calculation and refresh
    useEffect(() => {
        const ensureSettlements = async () => {
            if (activeTab !== 'settlements') return;
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
    }, [activeTab, trip.id]);

    // Calculate user's share
    const userShare = expenses.reduce((total, expense) => {
        const participants = expense.participants || [];
        const userParticipation = participants.find(participant => participant.user_id === user?.id);
        return total + (userParticipation ? parseFloat(userParticipation.share_amount) : 0);
    }, 0);

    return (
        <div className="trip-details-card">
            {/* Trip Header */}
            <div className="details-card-header">
                <div className="details-card-image">
                    <SmartTripImage
                        trip={trip}
                        alt={trip.trip_name}
                        className="details-trip-image"
                    />
                </div>

                <div className="details-card-info">
                    <h2 className="details-trip-title">{trip.trip_name}</h2>
                    <div className="details-trip-meta">
                        <div className="meta-item">
                            <span className="meta-icon">📅</span>
                            <span className="meta-text">
                                {formatDate(trip.start_date)} - {formatDate(trip.end_date)}
                            </span>
                        </div>
                        <div className="meta-item">
                            <span className="meta-icon">📍</span>
                            <span className="meta-text">{trip.city_name}</span>
                        </div>
                        <div className="meta-item">
                            <span className="meta-icon">👥</span>
                            <span className="meta-text">
                                {trip.participant_count || participants.length} {(trip.participant_count || participants.length) === 1 ? 'Person' : 'People'}
                            </span>
                        </div>
                        <div className="meta-item">
                            <span className="meta-icon">💰</span>
                            <span className="meta-text">
                                ${(trip.total_expenses || 0).toFixed(2)} Total
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="details-actions">
                <button
                    className="details-action-btn expense-btn"
                    onClick={() => onAddExpense()}
                >
                    💰 Add Expense
                </button>
                <button
                    className="details-action-btn participant-btn"
                    onClick={() => onAddParticipant()}
                >
                    👥 Add Friend
                </button>
                <div className="user-share-display">
                    Your share: <strong>${userShare.toFixed(2)}</strong>
                </div>
            </div>

            {/* Tabs */}
            <div className="details-tabs">
                <button
                    className={`details-tab ${activeTab === 'expenses' ? 'active' : ''}`}
                    onClick={() => setActiveTab('expenses')}
                >
                    💳 Expenses ({expenses.length})
                </button>
                <button
                    className={`details-tab ${activeTab === 'participants' ? 'active' : ''}`}
                    onClick={() => setActiveTab('participants')}
                >
                    👥 People ({participants.length})
                </button>
                <button
                    className={`details-tab ${activeTab === 'settlements' ? 'active' : ''}`}
                    onClick={() => setActiveTab('settlements')}
                >
                    🎯 Settlements ({settlements.length})
                </button>
            </div>

            {/* Tab Content */}
            <div className="details-tab-content">
                {loading ? (
                    <div className="details-loading">
                        <span>Loading trip details...</span>
                    </div>
                ) : (
                    <>
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
                    </>
                )}
            </div>
        </div>
    );
};

export default TripSplitDetailsCard;
