import React from 'react';
import { formatDate } from '../../utils/formatDate';

const DailyPlanItem = ({ plan }) => {
    const formattedDate = formatDate(plan.plan_date);

    return (
        <div className="daily-plan-item">
            <p><strong>Date:</strong> {formattedDate}</p>
            <p><strong>Category:</strong> {plan.category}</p>
            <p><strong>Title:</strong> {plan.title}</p>
            <p><strong>Description:</strong> {plan.description}</p>
        </div>
    );
};

export default DailyPlanItem;