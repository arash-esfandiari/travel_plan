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

    return (
        <div className="expenses-list">
            {expenses.map((expense) => (
                <div key={expense.id} className="expense-item">
                    <div className="expense-icon">
                        {categoryIcons[expense.category] || '📦'}
                    </div>
                    <div className="expense-details">
                        <div className="expense-title">{expense.title}</div>
                        <div className="expense-meta">
                            <span className="expense-date">
                                {formatDate(expense.expense_date)}
                            </span>
                            {expense.description && (
                                <span className="expense-description">
                                    • {expense.description}
                                </span>
                            )}
                        </div>
                        <div className="expense-payer">
                            Paid by {expense.payer_name || 'Unknown'}
                        </div>
                    </div>
                    <div className="expense-amount">
                        ${parseFloat(expense.amount).toFixed(2)}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ExpensesList; 