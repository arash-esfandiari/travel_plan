import React, { useEffect, useState } from 'react';
import { format, eachDayOfInterval } from 'date-fns';
import { getDailyPlans } from '../../services/dailyPlanService';
import DailyPlanDay from './DailyPlanDay';
import './DailyPlan.css';

const DailyPlanList = ({ tripId, tripStartDate, tripEndDate, latitude, longitude, refresh }) => {
    const [plans, setPlans] = useState([]);

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const data = await getDailyPlans(tripId);
                setPlans(data);
            } catch (error) {
                console.error('Error fetching daily plans:', error);
            }
        };
        fetchPlans();
    }, [tripId, refresh]);

    const start = new Date(tripStartDate);
    const end = new Date(tripEndDate);
    const allDates = eachDayOfInterval({ start, end });

    // Group plans by the date portion of the plan_date string.
    // For each plan, we convert its plan_date to "yyyy-MM-dd" format.
    const groupedPlans = plans.reduce((acc, plan) => {
        const key = new Date(plan.plan_date).toISOString().split('T')[0];
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(plan);
        return acc;
    }, {});

    return (
        <div className="daily-plan-section">
            {allDates.map(date => {
                const dateStr = format(date, 'yyyy-MM-dd');
                const plansForDate = groupedPlans[dateStr] || [];
                return (
                    <DailyPlanDay
                        key={dateStr}
                        date={date}
                        plans={plansForDate}
                        latitude={latitude}
                        longitude={longitude}
                    />
                );
            })}
        </div>
    );
};

export default DailyPlanList;