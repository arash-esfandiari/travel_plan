// src/components/Trips/TripDetailsComponents/WeatherDisplay.js
import React from 'react';

const WeatherDisplay = ({ weatherStatus, dayWeather }) => {
    if (weatherStatus === 'available' && dayWeather) {
        return (
            <div
                className="weather-display"
                title={`${dayWeather.weather}, ${dayWeather.temperature.min}°C - ${dayWeather.temperature.max}°C`}
            >
                <img
                    src={dayWeather.icon}
                    alt={dayWeather.weather}
                    className="weather-icon"
                    onError={(e) => {
                        console.error('Failed to load weather icon:', dayWeather.icon);
                        e.target.style.display = 'none';
                    }}
                />
                <span className="weather-temp">{Math.round(dayWeather.temperature.avg)}°C</span>
            </div>
        );
    }

    return (
        <div className="weather-display placeholder">
            <span className="weather-icon">--</span>
            <span className="weather-temp">--°C</span>
        </div>
    );
};

export default WeatherDisplay; 