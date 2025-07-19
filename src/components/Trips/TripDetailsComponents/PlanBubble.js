// src/components/Trips/TripDetailsComponents/PlanBubble.js
import React from 'react';

const PlanBubble = ({
    plan,
    isDragging,
    draggedPlan,
    onDragStart,
    onDeletePlan
}) => {
    // Map category to appropriate emoji
    const categoryEmojis = {
        'Hotel': '🏨',
        'Restaurant': '🍽️',
        'Attraction': '🎯',
        'Comment': '💬',
        'Activity': '🎭',
        'Transportation': '🚗'
    };

    return (
        <div
            className={`plan-bubble ${isDragging && draggedPlan?.id === plan.id ? 'dragging' : ''}`}
            draggable
            onDragStart={(e) => onDragStart(e, plan)}
            title={plan.title} // Tooltip is useful for long, truncated titles
        >
            <div className="plan-content">
                <div className="plan-main">
                    <div className="plan-category">
                        {categoryEmojis[plan.category] || '📋'}
                    </div>
                    <div className="plan-activity">{plan.title}</div>
                </div>
                <button
                    className="plan-delete-btn"
                    onClick={() => onDeletePlan(plan.id)}
                    title="Remove this plan"
                >
                    ×
                </button>
            </div>
        </div>
    );
};

export default PlanBubble; 