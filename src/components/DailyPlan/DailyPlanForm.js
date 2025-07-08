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
        try {
            // Create the daily plan with the selectedDate in "yyyy-MM-dd" format
            const newPlan = await createDailyPlan(tripId, selectedDate, category, title, description);
            console.log('✅ New plan created:', newPlan);
            onPlanAdded(newPlan);
            // Reset form fields and selectedDate to first option.
            setCategory('');
            setTitle('');
            setDescription('');
            if (dateOptions.length > 0) {
                setSelectedDate(dateOptions[0].value);
            }
        } catch (error) {
            console.error('Error creating daily plan:', error);
            alert('Failed to create daily plan.');
        }
    };

    return (
        <div className="daily-plan-form">
            <h4>Add Daily Plan</h4>
            <form onSubmit={handleSubmit}>
                <select
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    required
                >
                    {dateOptions.map(option => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                >
                    <option value="">Select Category</option>
                    <option value="Hotel">Hotel</option>
                    <option value="Restaurant">Restaurant</option>
                    <option value="Attraction">Attraction</option>
                    <option value="Comment">Comment</option>
                </select>
                <input
                    type="text"
                    placeholder="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />
                <textarea
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows="2"
                ></textarea>
                <button type="submit">Add Daily Plan</button>
            </form>
        </div>
    );
};

export default DailyPlanForm;