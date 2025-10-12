// src/components/Trips/TripSplitComponents/ExpensesSection.js
import React, { useState, useEffect, useCallback } from 'react';
import { getExpenses, deleteExpense } from '../../../services/tripSplitService';

const ExpensesSection = ({ tripId, refreshTrigger, onDataChange, onAddExpense, onEditExpense, onTotalUpdate }) => {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const categories = [
        { value: 'food', label: 'Food & Drinks', icon: '🍽️' },
        { value: 'transport', label: 'Transportation', icon: '🚗' },
        { value: 'accommodation', label: 'Accommodation', icon: '🏨' },
        { value: 'entertainment', label: 'Entertainment', icon: '🎉' },
        { value: 'shopping', label: 'Shopping', icon: '🛍️' },
        { value: 'other', label: 'Other', icon: '📦' }
    ];

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const expensesData = await getExpenses(tripId);
            setExpenses(expensesData);

            // Calculate and report total to parent component
            if (onTotalUpdate) {
                const total = expensesData.reduce((sum, expense) => sum + parseFloat(expense.amount || 0), 0);
                onTotalUpdate(total);
            }

            setError(null);
        } catch (error) {
            console.error('Error fetching data:', error);
            setError('Failed to load expenses');
        } finally {
            setLoading(false);
        }
    }, [tripId]);

    useEffect(() => {
        fetchData();
    }, [fetchData, refreshTrigger]);

    const handleEdit = (expense) => {
        onEditExpense(expense);
    };

    const handleDelete = async (expenseId) => {
        if (!window.confirm('Are you sure you want to delete this expense?')) {
            return;
        }

        try {
            await deleteExpense(expenseId);
            fetchData();
            onDataChange();
        } catch (error) {
            console.error('Error deleting expense:', error);
            setError(error.response?.data?.error || 'Failed to delete expense');
        }
    };

    if (loading) {
        return (
            <div className="expenses-section">
                <div className="loading-state">
                    <div className="loading-spinner">⏳</div>
                    <p>Loading expenses...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="expenses-section">
            <div className="section-header">
                <h2>💳 Trip Expenses</h2>
                <button
                    className="add-expense-btn"
                    onClick={onAddExpense}
                >
                    + Add Expense
                </button>
            </div>

            {error && (
                <div className="error-message">
                    <span className="error-icon">⚠️</span>
                    {error}
                </div>
            )}


            {/* Expenses List */}
            <div className="expenses-list">
                {expenses.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">💳</div>
                        <h3>No expenses yet</h3>
                        <p>Start tracking your trip expenses</p>
                        <button
                            className="empty-action-btn"
                            onClick={onAddExpense}
                        >
                            Add Your First Expense
                        </button>
                    </div>
                ) : (
                    expenses.map(expense => {
                        const category = categories.find(cat => cat.value === expense.category);
                        return (
                            <div key={expense.id} className="expense-card">
                                {/* Card Header with Category and Actions */}
                                <div className="expense-card-header">
                                    <div className="expense-category-badge">
                                        <span className="category-icon">{category?.icon || '📦'}</span>
                                        <span className="category-label">{category?.label || 'Other'}</span>
                                    </div>
                                    <div className="expense-actions">
                                        <button
                                            className="action-btn edit-btn"
                                            onClick={() => handleEdit(expense)}
                                            title="Edit expense"
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            className="action-btn delete-btn"
                                            onClick={() => handleDelete(expense.id)}
                                            title="Delete expense"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>

                                {/* Main Content */}
                                <div className="expense-main-content">
                                    <div className="expense-title-section">
                                        <h3 className="expense-title">{expense.title || expense.description}</h3>
                                        {expense.description && expense.title !== expense.description && (
                                            <p className="expense-description">{expense.description}</p>
                                        )}
                                    </div>

                                    <div className="expense-amount-display">
                                        <span className="expense-amount">{parseFloat(expense.amount).toFixed(2)}</span>
                                    </div>
                                </div>

                                {/* Footer with meta information */}
                                <div className="expense-footer">
                                    <div className="expense-meta-info">
                                        <div className="meta-item">
                                            <span className="meta-icon">👤</span>
                                            <span className="meta-text">Paid by {expense.payer_name}</span>
                                        </div>
                                        <div className="meta-item">
                                            <span className="meta-icon">📅</span>
                                            <span className="meta-text">{new Date(expense.expense_date).toLocaleDateString()}</span>
                                        </div>
                                        <div className="meta-item">
                                            <span className={`expense-type-badge ${expense.expense_type || 'group'}`}>
                                                {expense.expense_type === 'personal' ? '👤 Personal' :
                                                    expense.expense_type === 'group' ? '👥 Group' : '⚖️ Custom'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Show expense participants */}
                                {expense.participants && expense.participants.length > 0 && (
                                    <div className="expense-participants">
                                        <div className="participants-header">
                                            <span>👥 Split between:</span>
                                        </div>
                                        <div className="participants-list">
                                            {expense.participants.map(participant => (
                                                <div key={participant.user_id} className="participant-share">
                                                    <span className="participant-name">
                                                        {participant.first_name} {participant.last_name}
                                                    </span>
                                                    <span className="participant-amount">
                                                        {parseFloat(participant.share_amount).toFixed(2)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default ExpensesSection; 