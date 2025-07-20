// src/components/Trips/TripSplitComponents/ExpensesSection.js
import React, { useState, useEffect } from 'react';
import { getExpenses, createExpense, updateExpense, deleteExpense } from '../../../services/tripSplitService';
import { getParticipants } from '../../../services/tripSplitService';

const ExpensesSection = ({ tripId, refreshTrigger, onDataChange }) => {
    const [expenses, setExpenses] = useState([]);
    const [participants, setParticipants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingExpense, setEditingExpense] = useState(null);
    const [formData, setFormData] = useState({
        payer_id: '',
        title: '',
        description: '',
        amount: '',
        expense_date: new Date().toISOString().split('T')[0],
        expense_type: 'group',
        category: 'food',
        splits: []
    });
    const [adding, setAdding] = useState(false);
    const [error, setError] = useState(null);

    const categories = [
        { value: 'food', label: '🍽️ Food & Drinks', icon: '🍽️' },
        { value: 'transport', label: '🚗 Transportation', icon: '🚗' },
        { value: 'accommodation', label: '🏨 Accommodation', icon: '🏨' },
        { value: 'entertainment', label: '🎉 Entertainment', icon: '🎉' },
        { value: 'shopping', label: '🛍️ Shopping', icon: '🛍️' },
        { value: 'other', label: '📦 Other', icon: '📦' }
    ];

    useEffect(() => {
        fetchData();
    }, [tripId, refreshTrigger]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [expensesData, participantsData] = await Promise.all([
                getExpenses(tripId),
                getParticipants(tripId)
            ]);
            setExpenses(expensesData);
            setParticipants(participantsData);
            setError(null);
        } catch (error) {
            console.error('Error fetching data:', error);
            setError('Failed to load expenses');
        } finally {
            setLoading(false);
        }
    };

    const calculateEqualSplits = (amount, excludePayer = false) => {
        const availableParticipants = excludePayer
            ? participants.filter(p => p.id !== parseInt(formData.payer_id))
            : participants;

        const splitAmount = parseFloat(amount) / availableParticipants.length;

        return availableParticipants.map(participant => ({
            participant_id: participant.id,
            split_amount: splitAmount.toFixed(2),
            split_percentage: (100 / availableParticipants.length).toFixed(2)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setAdding(true);
        setError(null);

        try {
            // Calculate splits based on expense type
            let splits = [];
            if (formData.expense_type === 'group') {
                splits = calculateEqualSplits(formData.amount, false);
            } else if (formData.expense_type === 'shared') {
                splits = formData.splits.length > 0 ? formData.splits : calculateEqualSplits(formData.amount, true);
            }
            // Personal expenses don't need splits

            const expenseData = {
                ...formData,
                amount: parseFloat(formData.amount),
                splits: splits
            };

            if (editingExpense) {
                await updateExpense(editingExpense.id, expenseData);
            } else {
                await createExpense(tripId, expenseData);
            }

            resetForm();
            fetchData();
            onDataChange();
        } catch (error) {
            console.error('Error saving expense:', error);
            setError(error.response?.data?.error || 'Failed to save expense');
        } finally {
            setAdding(false);
        }
    };

    const handleEdit = (expense) => {
        setEditingExpense(expense);
        setFormData({
            payer_id: expense.payer_id,
            title: expense.title,
            description: expense.description || '',
            amount: expense.amount,
            expense_date: expense.expense_date,
            expense_type: expense.expense_type,
            category: expense.category,
            splits: expense.splits || []
        });
        setShowAddForm(true);
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

    const resetForm = () => {
        setFormData({
            payer_id: '',
            title: '',
            description: '',
            amount: '',
            expense_date: new Date().toISOString().split('T')[0],
            expense_type: 'group',
            category: 'food',
            splits: []
        });
        setEditingExpense(null);
        setShowAddForm(false);
        setError(null);
    };

    const updateCustomSplit = (participantId, amount) => {
        const updatedSplits = formData.splits.filter(s => s.participant_id !== participantId);
        if (amount > 0) {
            updatedSplits.push({
                participant_id: participantId,
                split_amount: parseFloat(amount).toFixed(2),
                split_percentage: null
            });
        }
        setFormData({ ...formData, splits: updatedSplits });
    };

    const getSplitAmount = (participantId) => {
        const split = formData.splits.find(s => s.participant_id === participantId);
        return split ? split.split_amount : '';
    };

    const getTotalSplitAmount = () => {
        return formData.splits.reduce((total, split) => total + parseFloat(split.split_amount || 0), 0).toFixed(2);
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
                    onClick={() => setShowAddForm(true)}
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

            {/* Add/Edit Expense Form */}
            {showAddForm && (
                <div className="add-expense-modal">
                    <div className="modal-overlay" onClick={resetForm}></div>
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>{editingExpense ? 'Edit Expense' : 'Add New Expense'}</h3>
                            <button className="close-btn" onClick={resetForm}>×</button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Who paid?</label>
                                    <select
                                        value={formData.payer_id}
                                        onChange={(e) => setFormData({ ...formData, payer_id: e.target.value })}
                                        required
                                    >
                                        <option value="">Select person</option>
                                        {participants.map(participant => (
                                            <option key={participant.id} value={participant.id}>
                                                {participant.display_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Amount</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Expense Title</label>
                                <input
                                    type="text"
                                    placeholder="e.g., Dinner at restaurant"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Description (optional)</label>
                                <textarea
                                    placeholder="Additional details..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows="2"
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Date</label>
                                    <input
                                        type="date"
                                        value={formData.expense_date}
                                        onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Category</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        {categories.map(cat => (
                                            <option key={cat.value} value={cat.value}>
                                                {cat.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Split Type</label>
                                <div className="expense-type-selector">
                                    <label className={`type-option ${formData.expense_type === 'personal' ? 'active' : ''}`}>
                                        <input
                                            type="radio"
                                            name="expense_type"
                                            value="personal"
                                            checked={formData.expense_type === 'personal'}
                                            onChange={(e) => setFormData({ ...formData, expense_type: e.target.value })}
                                        />
                                        👤 Personal
                                    </label>
                                    <label className={`type-option ${formData.expense_type === 'group' ? 'active' : ''}`}>
                                        <input
                                            type="radio"
                                            name="expense_type"
                                            value="group"
                                            checked={formData.expense_type === 'group'}
                                            onChange={(e) => setFormData({ ...formData, expense_type: e.target.value })}
                                        />
                                        👥 Split Equally
                                    </label>
                                    <label className={`type-option ${formData.expense_type === 'shared' ? 'active' : ''}`}>
                                        <input
                                            type="radio"
                                            name="expense_type"
                                            value="shared"
                                            checked={formData.expense_type === 'shared'}
                                            onChange={(e) => setFormData({ ...formData, expense_type: e.target.value })}
                                        />
                                        ⚖️ Custom Split
                                    </label>
                                </div>
                            </div>

                            {formData.expense_type === 'shared' && (
                                <div className="custom-split-section">
                                    <label>Custom Split Amounts</label>
                                    <div className="split-inputs">
                                        {participants.filter(p => p.id !== parseInt(formData.payer_id)).map(participant => (
                                            <div key={participant.id} className="split-input-row">
                                                <span className="participant-name">{participant.display_name}</span>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    placeholder="0.00"
                                                    value={getSplitAmount(participant.id)}
                                                    onChange={(e) => updateCustomSplit(participant.id, e.target.value)}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    <div className="split-summary">
                                        <small>
                                            Total: ${getTotalSplitAmount()} / ${formData.amount || '0.00'}
                                        </small>
                                    </div>
                                </div>
                            )}

                            <div className="modal-actions">
                                <button type="button" onClick={resetForm} className="cancel-btn">
                                    Cancel
                                </button>
                                <button type="submit" disabled={adding} className="save-btn">
                                    {adding ? 'Saving...' : editingExpense ? 'Update Expense' : 'Add Expense'}
                                </button>
                            </div>
                        </form>
                    </div>
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
                            onClick={() => setShowAddForm(true)}
                        >
                            Add Your First Expense
                        </button>
                    </div>
                ) : (
                    expenses.map(expense => {
                        const category = categories.find(cat => cat.value === expense.category);
                        return (
                            <div key={expense.id} className="expense-card">
                                <div className="expense-header">
                                    <div className="expense-category">
                                        <span className="category-icon">{category?.icon || '📦'}</span>
                                        <span className="category-name">{category?.label || 'Other'}</span>
                                    </div>
                                    <div className="expense-amount">${parseFloat(expense.amount).toFixed(2)}</div>
                                </div>

                                <div className="expense-details">
                                    <h4 className="expense-title">{expense.title}</h4>
                                    {expense.description && (
                                        <p className="expense-description">{expense.description}</p>
                                    )}
                                    <div className="expense-meta">
                                        <span className="expense-payer">Paid by {expense.payer_name}</span>
                                        <span className="expense-date">
                                            {new Date(expense.expense_date).toLocaleDateString()}
                                        </span>
                                        <span className={`expense-type ${expense.expense_type}`}>
                                            {expense.expense_type === 'personal' ? '👤 Personal' :
                                                expense.expense_type === 'group' ? '👥 Group' : '⚖️ Custom'}
                                        </span>
                                    </div>
                                </div>

                                <div className="expense-actions">
                                    <button
                                        className="edit-btn"
                                        onClick={() => handleEdit(expense)}
                                        title="Edit expense"
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        className="delete-btn"
                                        onClick={() => handleDelete(expense.id)}
                                        title="Delete expense"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default ExpensesSection; 