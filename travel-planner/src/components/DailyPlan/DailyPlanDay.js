// src/components/DailyPlan/DailyPlanDay.js
import React, { useState } from 'react';
import { format } from 'date-fns';
import { getWeatherForDay } from '../../services/weatherApi';
import DailyPlanItem from './DailyPlanItem';
import './DailyPlan.css';

const DailyPlanDay = ({ date, plans, latitude, longitude }) => {
    const [expanded, setExpanded] = useState(false);
    const [weather, setWeather] = useState(null);
    const [loadingWeather, setLoadingWeather] = useState(false);

    const dateStr = format(date, 'yyyy-MM-dd');
    const displayDate = format(date, 'MMMM dd, yyyy');

    const toggleExpand = async () => {
        setExpanded(prev => !prev);
        if (!expanded && !weather) {
            setLoadingWeather(true);
            const weatherData = await getWeatherForDay(latitude, longitude, dateStr);
            setWeather(weatherData);
            setLoadingWeather(false);
        }
    };

    return (
        <div className="daily-plan-day">
            <div className="daily-plan-header" onClick={toggleExpand}>
                <h4>{displayDate}</h4>
                <span>{expanded ? '-' : '+'}</span>
            </div>
            {expanded && (
                <div className="daily-plan-content">
                    {loadingWeather ? (
                        <p>Fetching weather for the day...</p>
                    ) : weather ? (
                        <div className="daily-weather">
                            <img src={weather.icon} alt={weather.weather} />
                            <p>{weather.weather}</p>
                            <p>{weather.temperature.min}°C - {weather.temperature.max}°C</p>
                        </div>
                    ) : (
                        <p>Weather data unavailable.</p>
                    )}
                    {plans.length > 0 ? (
                        plans.map(plan => (
                            <DailyPlanItem key={plan.id} plan={plan} />
                        ))
                    ) : (
                        <p>No plans for the day.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default DailyPlanDay;