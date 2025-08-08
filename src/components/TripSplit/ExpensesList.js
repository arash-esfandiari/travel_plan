// src/components/TripSplit/ExpensesList.js
import React from 'react';
import { formatDate } from '../../utils/formatDate';

const ExpensesList = ({ expenses, tripId, onRefresh }) => {
    const categoryIcons = {
        food: '🍽️',
        transport: '🚗',
        accommodation: '🏨',
        entertainment: '🎉',
        shopping: '🛍️',
        other: '📦'
    };

    if (expenses.length === 0) {
        return (
            <div className="empty-list">
                <div className="empty-icon">💳</div>
                <p>No expenses yet</p>
                <small>Add an expense to get started!</small>
            </div>
        );
    }

    // Compute total and group by date for readability
    const total = expenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
    const grouped = expenses.reduce((acc, e) => {
        const key = e.expense_date;
        acc[key] = acc[key] || [];
        acc[key].push(e);
        return acc;
    }, {});

    const dateKeys = Object.keys(grouped).sort((a, b) => new Date(b) - new Date(a));

    return (
        <div className="expenses-list">
            <div className="list-header">
                <div className="list-title">Expenses</div>
                <div className="list-total">Total: <strong>${total.toFixed(2)}</strong></div>
            </div>

            {dateKeys.map(dateKey => (
                <div key={dateKey} className="date-group">
                    <div className="date-header">{formatDate(dateKey)}</div>
                    {grouped[dateKey].map((expense) => (
                        <div key={expense.id} className="expense-item">
                            <div className="expense-icon">
                                {categoryIcons[expense.category] || '📦'}
                            </div>
                            <div className="expense-details">
                                <div className="expense-title-row">
                                    <div className="expense-title">{expense.title || expense.description}</div>
                                    <div className="expense-amount">${parseFloat(expense.amount).toFixed(2)}</div>
                                </div>
                                {expense.description && (expense.title !== expense.description) && (
                                    <div className="expense-description">{expense.description}</div>
                                )}
                                <div className="expense-payer">Paid by {expense.payer_name || 'Unknown'}</div>
                                {Array.isArray(expense.participants) && expense.participants.length > 0 && (
                                    <div className="expense-participants-inline">
                                        {expense.participants.map(p => (
                                            <span key={p.user_id} className="participant-chip">
                                                {p.first_name} {p.last_name}
                                                <span className="chip-amount">${parseFloat(p.share_amount).toFixed(2)}</span>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
};

export default ExpensesList; 