// src/components/Trips/TripDetailsComponents/DaySection.js
import React from 'react';
import PlanBubble from './PlanBubble';
import WeatherDisplay from './WeatherDisplay';
import { formatDate } from '../../../utils/formatDate';

const DaySection = ({
    date,
    dayNumber,
    plans,
    weatherData,
    weatherStatus,
    isDragging,
    draggedPlan,
    onDragOver,
    onDrop,
    onDragStart,
    onDeletePlan
}) => {
    const dateKey = date.split('T')[0];
    const dayWeather = weatherData?.[dateKey];

    // Enhanced debug logging
    console.log(`🌤️ Rendering day section for ${dateKey}:`, {
        dateKey,
        hasWeatherData: weatherData !== null,
        weatherDataKeys: weatherData ? Object.keys(weatherData) : 'null',
        dayWeather,
        weatherStatus,
        hasExactMatch: weatherData && weatherData.hasOwnProperty(dateKey)
    });

    function parseLocalDate(dateString) {
        const [year, month, day] = dateString.split('-').map(Number);
        return new Date(year, month - 1, day);
    }

    return (
        <div
            className={`day-section ${isDragging ? 'drop-zone' : ''}`}
            onDragOver={onDragOver}
            onDrop={(e) => onDrop(e, dateKey)}
        >
            <div className="day-header">
                <div className="day-title">
                    <WeatherDisplay
                        weatherStatus={weatherStatus}
                        dayWeather={dayWeather}
                    />
                    <h3>Day {dayNumber}</h3>
                </div>
                <span className="day-date">{formatDate(parseLocalDate(dateKey))}</span>
            </div>
            <div className="day-plans">
                {plans && plans.length > 0 ? (
                    plans.map(plan => (
                        <PlanBubble
                            key={plan.id}
                            plan={plan}
                            isDragging={isDragging}
                            draggedPlan={draggedPlan}
                            onDragStart={onDragStart}
                            onDeletePlan={onDeletePlan}
                        />
                    ))
                ) : (
                    <div className="empty-day">
                        <span className="empty-icon">📅</span>
                        <span className="empty-text">Drop plans here or add new ones</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DaySection; 