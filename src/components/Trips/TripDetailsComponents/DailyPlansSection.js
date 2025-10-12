// src/components/Trips/TripDetailsComponents/DailyPlansSection.js
import React from 'react';
import DaySection from './DaySection';
import DailyPlanForm from '../../DailyPlan/DailyPlanForm';

const DailyPlansSection = ({
    trip,
    tripId,
    allDates,
    groupedPlans,
    weatherData,
    weatherStatus,
    isDragging,
    draggedPlan,
    onDragOver,
    onDrop,
    onDragStart,
    onDeletePlan,
    onPlanAdded
}) => {
    return (
        <div className="daily-plans-section">
            <div className="section-header">
                <h2>📅 Daily Plans</h2>
                <p className="drag-hint">Drag plans between days or click × to remove</p>
            </div>

            {weatherStatus === 'unavailable' && (
                <div className="weather-notice">
                    <p>ℹ️ Weather forecast is only available for trips starting within the next 14 days.</p>
                </div>
            )}

            <div className="days-container">
                {allDates.map((date, index) => (
                    <DaySection
                        key={date}
                        date={date}
                        dayNumber={index + 1}
                        plans={groupedPlans[date.split('T')[0]]}
                        weatherData={weatherData}
                        weatherStatus={weatherStatus}
                        isDragging={isDragging}
                        draggedPlan={draggedPlan}
                        onDragOver={onDragOver}
                        onDrop={onDrop}
                        onDragStart={onDragStart}
                        onDeletePlan={onDeletePlan}
                    />
                ))}
            </div>

            <div className="add-plan-section">
                <DailyPlanForm
                    tripId={tripId}
                    tripStartDate={trip.start_date}
                    tripEndDate={trip.end_date}
                    onPlanAdded={onPlanAdded}
                />
            </div>
        </div>
    );
};

export default DailyPlansSection; 