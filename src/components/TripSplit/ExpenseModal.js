// src/components/TripSplit/ExpenseModal.js
import React, { useState, useEffect } from 'react';
import { createExpense, getParticipants } from '../../services/tripSplitService';

const ExpenseModal = ({ trip, onClose }) => {
    const [participants, setParticipants] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        amount: '',
        expense_date: new Date().toISOString().split('T')[0],
        category: 'food',
        expense_type: 'group'
    });

    const categories = [
        { value: 'food', label: '🍽️ Food & Drinks' },
        { value: 'transport', label: '🚗 Transportation' },
        { value: 'accommodation', label: '🏨 Accommodation' },
        { value: 'entertainment', label: '🎉 Entertainment' },
        { value: 'shopping', label: '🛍️ Shopping' },
        { value: 'other', label: '📦 Other' }
    ];

    useEffect(() => {
        fetchParticipants();
    }, []);

    const fetchParticipants = async () => {
        setLoading(true);
        try {
            const data = await getParticipants(trip.id);
            setParticipants(data.participants || []);
        } catch (error) {
            console.error('Error fetching participants:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title || !formData.amount) {
            alert('Please fill in all required fields');
            return;
        }

        setSubmitting(true);
        try {
            const expenseData = {
                ...formData,
                amount: parseFloat(formData.amount)
            };

            await createExpense(trip.id, expenseData);
            onClose(); // This will trigger refresh in parent
        } catch (error) {
            console.error('Error creating expense:', error);
            alert('Failed to create expense. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content expense-modal">
                <div className="modal-header">
                    <h3>💰 Add Expense</h3>
                    <h4>{trip.trip_name}</h4>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                {loading ? (
                    <div className="modal-loading">
                        <span>Loading participants...</span>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="expense-form">
                        <div className="form-group">
                            <label>Expense Title *</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                placeholder="e.g., Dinner at restaurant"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Amount *</label>
                            <input
                                type="number"
                                name="amount"
                                value={formData.amount}
                                onChange={handleInputChange}
                                placeholder="0.00"
                                step="0.01"
                                min="0"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Category</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleInputChange}
                            >
                                {categories.map(cat => (
                                    <option key={cat.value} value={cat.value}>
                                        {cat.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Date</label>
                            <input
                                type="date"
                                name="expense_date"
                                value={formData.expense_date}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="form-group">
                            <label>Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder="Optional description..."
                                rows="3"
                            />
                        </div>

                        <div className="modal-actions">
                            <button
                                type="button"
                                className="cancel-btn"
                                onClick={onClose}
                                disabled={submitting}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="submit-btn"
                                disabled={submitting}
                            >
                                {submitting ? 'Adding...' : 'Add Expense'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ExpenseModal; 