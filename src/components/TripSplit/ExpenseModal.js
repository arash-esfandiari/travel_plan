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
        paid_by: '', // Who paid for this expense
        split_method: 'equal', // equal | custom | percent
        split_scope: 'all' // all | subset
    });

    // UI state for split inputs
    const [selectedParticipantIds, setSelectedParticipantIds] = useState([]);
    const [customAmounts, setCustomAmounts] = useState({}); // userId -> amount
    const [percentages, setPercentages] = useState({}); // userId -> percent

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
    }, [trip.id]);

    const fetchParticipants = async () => {
        setLoading(true);
        try {
            const data = await getParticipants(trip.id);
            setParticipants(data || []);
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

    const toggleSelected = (userId) => {
        setSelectedParticipantIds(prev =>
            prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
        );
    };

    const getTargetParticipants = () => {
        return formData.split_scope === 'all'
            ? participants.map(p => p.user_id)
            : selectedParticipantIds;
    };

    const toCents = (num) => Math.round(parseFloat(num) * 100);
    const fromCents = (cents) => (cents / 100);

    const computeParticipants = () => {
        const totalAmount = parseFloat(formData.amount || 0);
        const targetIds = getTargetParticipants();
        if (totalAmount <= 0 || targetIds.length === 0) return [];

        // Equal split
        if (formData.split_method === 'equal') {
            const per = Math.floor((toCents(totalAmount) / targetIds.length));
            const remainder = toCents(totalAmount) - per * targetIds.length;
            return targetIds.map((userId, idx) => ({
                user_id: userId,
                share_amount: fromCents(per + (idx === targetIds.length - 1 ? remainder : 0))
            }));
        }

        // Custom amounts
        if (formData.split_method === 'custom') {
            return targetIds.map(userId => ({
                user_id: userId,
                share_amount: parseFloat(customAmounts[userId] || 0)
            }));
        }

        // Percentages
        if (formData.split_method === 'percent') {
            const percList = targetIds.map(userId => parseFloat(percentages[userId] || 0));

            // Calculate amounts based on percentages (validation ensures they add up to 100%)
            const amounts = targetIds.map((userId, idx) => ({
                user_id: userId,
                share_amount: (totalAmount * percList[idx]) / 100
            }));

            // Round to cents and adjust last person for any rounding differences
            const centsList = amounts.map(p => toCents(p.share_amount));
            const diff = toCents(totalAmount) - centsList.reduce((s, c) => s + c, 0);
            if (centsList.length > 0) {
                centsList[centsList.length - 1] += diff;
            }
            return targetIds.map((userId, idx) => ({ user_id: userId, share_amount: fromCents(centsList[idx]) }));
        }

        // weights method removed

        return [];
    };

    // Live split preview and validation helpers
    const computePreview = () => {
        const list = computeParticipants();
        const total = list.reduce((s, p) => s + parseFloat(p.share_amount || 0), 0);
        return { list, total };
    };

    const getValidation = () => {
        const tolerance = 0.01; // Consistent tolerance for all validations
        const amount = parseFloat(formData.amount || 0);

        if (!amount || amount <= 0) return { ok: false, message: 'Enter a valid amount' };

        const targets = getTargetParticipants();
        if (targets.length === 0) return { ok: false, message: 'Select at least one participant' };

        if (formData.split_method === 'percent') {
            const sum = targets.reduce((s, id) => s + parseFloat(percentages[id] || 0), 0);
            if (sum <= 0) return { ok: false, message: 'Enter percentages for participants' };

            if (Math.abs(sum - 100) > tolerance) {
                const difference = (100 - sum).toFixed(2);
                if (sum > 100) {
                    return { ok: false, message: `Percentages add up to ${sum.toFixed(2)}%. Please reduce by ${Math.abs(difference)}%` };
                } else {
                    return { ok: false, message: `Percentages add up to ${sum.toFixed(2)}%. Please add ${difference}% more` };
                }
            }
        }

        if (formData.split_method === 'custom') {
            const customSum = targets.reduce((s, id) => s + parseFloat(customAmounts[id] || 0), 0);
            if (customSum === 0) return { ok: false, message: 'Enter custom amounts' };

            if (Math.abs(customSum - amount) > tolerance) {
                const difference = (amount - customSum).toFixed(2);
                if (customSum > amount) {
                    return { ok: false, message: `Custom amounts total $${customSum.toFixed(2)}. Please reduce by $${Math.abs(difference)}` };
                } else {
                    return { ok: false, message: `Custom amounts total $${customSum.toFixed(2)}. Please add $${difference} more` };
                }
            }
        }

        return { ok: true, message: '' };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Check basic required fields
        if (!formData.title || !formData.amount || !formData.paid_by) {
            alert('Please fill in all required fields (title, amount, and who paid)');
            return;
        }

        // Check validation
        const validation = getValidation();
        if (!validation.ok) {
            alert(validation.message);
            return;
        }

        setSubmitting(true);
        try {
            const expenseData = {
                title: formData.title,
                description: formData.description,
                amount: parseFloat(formData.amount),
                expense_date: formData.expense_date,
                category: formData.category,
                paid_by: formData.paid_by,
                participants: computeParticipants()
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
                            <label>Who paid? *</label>
                            <select
                                name="paid_by"
                                value={formData.paid_by}
                                onChange={handleInputChange}
                                required
                                disabled={participants.length === 0}
                            >
                                <option value="">
                                    {participants.length === 0 ? 'Loading participants...' : 'Select person'}
                                </option>
                                {participants.map(participant => (
                                    <option key={participant.user_id} value={participant.user_id}>
                                        {participant.first_name} {participant.last_name}
                                    </option>
                                ))}
                            </select>
                            {participants.length === 0 && !loading && (
                                <small style={{ color: 'orange' }}>
                                    ⚠️ No participants found. Add participants to the trip first.
                                </small>
                            )}
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

                        {/* Split Controls */}
                        <div className="form-group">
                            <label>Split Method</label>
                            <div className="split-method-grid">
                                {[
                                    { key: 'equal', title: 'Equal', desc: 'Everyone pays the same' },
                                    { key: 'custom', title: 'Custom', desc: 'Enter amounts per person' },
                                    { key: 'percent', title: 'Percent', desc: 'Split by percentages' }
                                ].map(opt => (
                                    <button
                                        key={opt.key}
                                        type="button"
                                        className={`split-card ${formData.split_method === opt.key ? 'active' : ''}`}
                                        onClick={() => setFormData(prev => ({ ...prev, split_method: opt.key }))}
                                    >
                                        <div className="split-card-title">{opt.title}</div>
                                        <div className="split-card-desc">{opt.desc}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Who shares this?</label>
                            <div className="radio-row">
                                <label><input type="radio" name="split_scope" value="all" checked={formData.split_scope === 'all'} onChange={handleInputChange} /> All trip participants</label>
                                <label><input type="radio" name="split_scope" value="subset" checked={formData.split_scope === 'subset'} onChange={handleInputChange} /> Selected people</label>
                            </div>
                        </div>

                        {formData.split_scope === 'subset' && (
                            <div className="form-group">
                                <label>Select people</label>
                                <div className="select-actions">
                                    <button type="button" onClick={() => setSelectedParticipantIds(participants.map(p => p.user_id))}>Select all</button>
                                    <button type="button" onClick={() => setSelectedParticipantIds([])}>Clear</button>
                                    <span className="select-count">{selectedParticipantIds.length} selected</span>
                                </div>
                                <div className="checkbox-grid">
                                    {participants.map(p => (
                                        <label key={p.user_id} className="checkbox-item">
                                            <input type="checkbox" checked={selectedParticipantIds.includes(p.user_id)} onChange={() => toggleSelected(p.user_id)} />
                                            <span> {p.first_name} {p.last_name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        {(formData.split_method === 'custom' || formData.split_method === 'percent') && (
                            <div className="form-group">
                                <label>Enter {formData.split_method === 'custom' ? 'amounts' : 'percentages'} per person</label>
                                <div className="split-input-grid">
                                    {getTargetParticipants().map(userId => {
                                        const person = participants.find(p => p.user_id === userId);
                                        const label = person ? `${person.first_name} ${person.last_name}` : userId;
                                        if (formData.split_method === 'custom') {
                                            return (
                                                <div key={userId} className="split-input-row">
                                                    <span className="name">{label}</span>
                                                    <input type="number" step="0.01" min="0" placeholder="0.00" value={customAmounts[userId] || ''} onChange={(e) => setCustomAmounts(prev => ({ ...prev, [userId]: e.target.value }))} />
                                                </div>
                                            );
                                        }
                                        // percent
                                        return (
                                            <div key={userId} className="split-input-row">
                                                <span className="name">{label}</span>
                                                <input type="number" step="0.01" min="0" placeholder="0" value={percentages[userId] || ''} onChange={(e) => setPercentages(prev => ({ ...prev, [userId]: e.target.value }))} />
                                                <span className="suffix">%</span>
                                            </div>
                                        );
                                    })}
                                </div>
                                {formData.split_method === 'percent' && (
                                    <div className="form-hint">
                                        <strong>Note:</strong> Percentages must add up to exactly 100%
                                        {(() => {
                                            const targets = getTargetParticipants();
                                            const sum = targets.reduce((s, id) => s + parseFloat(percentages[id] || 0), 0);
                                            if (sum > 0) {
                                                return (
                                                    <span style={{
                                                        marginLeft: '0.5rem',
                                                        color: Math.abs(sum - 100) <= 0.01 ? '#28a745' : '#dc3545',
                                                        fontWeight: 'bold'
                                                    }}>
                                                        (Current: {sum.toFixed(2)}%)
                                                    </span>
                                                );
                                            }
                                            return null;
                                        })()}
                                    </div>
                                )}
                                {formData.split_method === 'custom' && (
                                    <div className="form-hint">
                                        <strong>Note:</strong> Custom amounts must add up to the total expense amount
                                        {(() => {
                                            const targets = getTargetParticipants();
                                            const sum = targets.reduce((s, id) => s + parseFloat(customAmounts[id] || 0), 0);
                                            const totalAmount = parseFloat(formData.amount || 0);
                                            if (sum > 0 && totalAmount > 0) {
                                                return (
                                                    <span style={{
                                                        marginLeft: '0.5rem',
                                                        color: Math.abs(sum - totalAmount) <= 0.01 ? '#28a745' : '#dc3545',
                                                        fontWeight: 'bold'
                                                    }}>
                                                        (Current: ${sum.toFixed(2)} / ${totalAmount.toFixed(2)})
                                                    </span>
                                                );
                                            }
                                            return null;
                                        })()}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Live preview & validation */}
                        <div className="form-group">
                            <label>Preview</label>
                            {(() => {
                                const { list, total } = computePreview();
                                const valid = getValidation();
                                return (
                                    <div className="preview-box">
                                        <div className="summary-row">
                                            <span>Total</span>
                                            <span>${parseFloat(formData.amount || 0).toFixed(2)}</span>
                                        </div>
                                        <div className="summary-row">
                                            <span>Split sum</span>
                                            <span>${parseFloat(total || 0).toFixed(2)}</span>
                                        </div>
                                        {!valid.ok && (
                                            <div className="validation-msg">{valid.message}</div>
                                        )}
                                        {list.length > 0 && (
                                            <div className="preview-list">
                                                {list.map(p => {
                                                    const person = participants.find(x => x.user_id === p.user_id);
                                                    const label = person ? `${person.first_name} ${person.last_name}` : p.user_id;
                                                    return (
                                                        <div key={p.user_id} className="preview-row">
                                                            <span className="name">{label}</span>
                                                            <span className="amount">${parseFloat(p.share_amount).toFixed(2)}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            })()}
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
                                disabled={submitting || !getValidation().ok}
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