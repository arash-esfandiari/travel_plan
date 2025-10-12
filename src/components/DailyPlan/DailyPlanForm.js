import React, { useState, useEffect } from 'react';
import { eachDayOfInterval, format } from 'date-fns';
import { createDailyPlan } from '../../services/dailyPlanService';
import './DailyPlan.css';

// Helper function to get ordinal suffix for day numbers.
const getOrdinal = (n) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

const DailyPlanForm = ({ tripId, tripStartDate, tripEndDate, onPlanAdded }) => {
    const [selectedDate, setSelectedDate] = useState('');
    const [category, setCategory] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [dateOptions, setDateOptions] = useState([]);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    // Category options with emojis and colors
    const categoryOptions = [
        { value: 'Hotel', emoji: '🏨', label: 'Hotel', color: '#4f46e5' },
        { value: 'Restaurant', emoji: '🍽️', label: 'Restaurant', color: '#dc2626' },
        { value: 'Attraction', emoji: '🎯', label: 'Attraction', color: '#059669' },
        { value: 'Comment', emoji: '💬', label: 'Comment', color: '#7c3aed' },
        { value: 'Activity', emoji: '🎭', label: 'Activity', color: '#ea580c' },
        { value: 'Transportation', emoji: '🚗', label: 'Transportation', color: '#0891b2' }
    ];

    // Generate dropdown options for each day between tripStartDate and tripEndDate
    useEffect(() => {
        const start = new Date(tripStartDate);
        const end = new Date(tripEndDate);
        const days = eachDayOfInterval({ start, end });
        const options = days.map((date, index) => ({
            value: format(date, 'yyyy-MM-dd'), // Format exactly as "yyyy-MM-dd"
            label: `${getOrdinal(index + 1)} day, ${format(date, 'MMMM d')}`
        }));
        setDateOptions(options);
        if (options.length > 0) {
            setSelectedDate(options[0].value);
        }
    }, [tripStartDate, tripEndDate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!category || !title.trim()) return;

        setIsSubmitting(true);

        try {
            // Create the daily plan with the selectedDate in "yyyy-MM-dd" format
            const newPlan = await createDailyPlan(tripId, selectedDate, category, title, description);
            console.log('✅ New plan created:', newPlan);
            onPlanAdded(newPlan);

            // Show success animation
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 2000);

            // Reset form fields and selectedDate to first option.
            setCategory('');
            setTitle('');
            setDescription('');
            setIsExpanded(false); // Collapse form after successful submission

            if (dateOptions.length > 0) {
                setSelectedDate(dateOptions[0].value);
            }
        } catch (error) {
            console.error('Error creating daily plan:', error);
            // Show a nice error notification instead of alert
            setShowSuccess(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCategorySelect = (categoryValue) => {
        setCategory(categoryValue);
    };

    const handleExpandToggle = () => {
        setIsExpanded(!isExpanded);
        if (!isExpanded && dateOptions.length > 0 && !selectedDate) {
            setSelectedDate(dateOptions[0].value);
        }
    };

    const resetForm = () => {
        setCategory('');
        setTitle('');
        setDescription('');
        setIsExpanded(false);
        if (dateOptions.length > 0) {
            setSelectedDate(dateOptions[0].value);
        }
    };

    return (
        <div className="modern-daily-plan-form">
            {/* Success Animation Overlay */}
            {showSuccess && (
                <div className="success-overlay">
                    <div className="success-animation">
                        <div className="success-checkmark">✨</div>
                        <div className="success-text">Plan Added Successfully!</div>
                        <div className="success-particles">
                            <span>🎉</span>
                            <span>✨</span>
                            <span>🌟</span>
                            <span>💫</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Form Container */}
            <div className={`form-container ${isExpanded ? 'expanded' : 'collapsed'}`}>
                {/* Header Section */}
                <div className="form-header" onClick={!isExpanded ? handleExpandToggle : undefined}>
                    <div className="header-content">
                        <div className="header-icon">
                            <span className="plus-icon">+</span>
                        </div>
                        <div className="header-text">
                            <h3>Add New Plan</h3>
                            <p>Create a new activity for your trip</p>
                        </div>
                        {!isExpanded && (
                            <div className="expand-hint">
                                <span className="arrow-icon">→</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Expanded Form */}
                {isExpanded && (
                    <div className="form-content">
                        <form onSubmit={handleSubmit} className="modern-form">
                            {/* Day Selection */}
                            <div className="form-group">
                                <label className="form-label">📅 Select Day</label>
                                <div className="custom-select">
                                    <select
                                        value={selectedDate}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        required
                                        className="day-select"
                                    >
                                        {dateOptions.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Category Selection */}
                            <div className="form-group">
                                <label className="form-label">🎯 Choose Category</label>
                                <div className="category-grid">
                                    {categoryOptions.map((cat) => (
                                        <button
                                            key={cat.value}
                                            type="button"
                                            className={`category-button ${category === cat.value ? 'selected' : ''}`}
                                            onClick={() => handleCategorySelect(cat.value)}
                                            style={{
                                                '--category-color': cat.color,
                                                borderColor: category === cat.value ? cat.color : 'rgba(255, 255, 255, 0.3)'
                                            }}
                                        >
                                            <span className="category-emoji">{cat.emoji}</span>
                                            <span className="category-label">{cat.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Title Input */}
                            <div className="form-group">
                                <div className="input-container">
                                    <input
                                        type="text"
                                        id="title"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        required
                                        className="modern-input"
                                        placeholder=" "
                                    />
                                    <label htmlFor="title" className="floating-label">
                                        ✏️ Plan Title
                                    </label>
                                </div>
                            </div>

                            {/* Description Input */}
                            <div className="form-group">
                                <div className="input-container">
                                    <textarea
                                        id="description"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        rows="3"
                                        className="modern-textarea"
                                        placeholder=" "
                                    />
                                    <label htmlFor="description" className="floating-label">
                                        📝 Description (Optional)
                                    </label>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="form-actions">
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="cancel-button"
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className={`submit-button ${isSubmitting ? 'submitting' : ''}`}
                                    disabled={!category || !title.trim() || isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <span className="spinner"></span>
                                            <span>Adding...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="submit-icon">✨</span>
                                            <span>Add Plan</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DailyPlanForm;