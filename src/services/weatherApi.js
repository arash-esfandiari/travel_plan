// src/services/weatherApi.js
import axios from 'axios';

const API_KEY = process.env.REACT_APP_WEATHER_API_KEY;
const WEATHER_API_URL = 'https://api.weatherapi.com/v1/forecast.json';

/**
 * Fetches the forecast for the given coordinates for a specified number of days (default 7).
 * @param {number} lat - Latitude.
 * @param {number} lon - Longitude.
 * @param {number} days - Number of days to fetch (default 7).
 * @returns {Promise<Array>} - Array of daily forecast objects.
 */
export const getWeatherForecast = async (lat, lon, days = 7) => {
    try {
        const query = `${lat},${lon}`;
        const response = await axios.get(WEATHER_API_URL, {
            params: {
                key: API_KEY,
                q: query,
                days,
                aqi: 'no',
                alerts: 'no'
            }
        });
        return response.data.forecast.forecastday.map(day => ({
            date: day.date, // "yyyy-MM-dd"
            temperature: {
                min: day.day.mintemp_c,
                max: day.day.maxtemp_c,
            },
            weather: day.day.condition.text,
            icon: `https:${day.day.condition.icon}`, // WeatherAPI returns a relative URL
        }));
    } catch (error) {
        console.error('Error fetching weather forecast:', error);
        return [];
    }
};

/**
 * Retrieves the forecast for a specific day (targetDate in "yyyy-MM-dd" format) from the forecast data.
 * @param {number} lat - Latitude.
 * @param {number} lon - Longitude.
 * @param {string} targetDate - Date in "yyyy-MM-dd" format.
 * @returns {Promise<Object|null>} - Forecast object for the day, or null if not found.
 */
export const getWeatherForDay = async (lat, lon, targetDate) => {
    try {
        const forecast = await getWeatherForecast(lat, lon);
        const dayForecast = forecast.find(f => f.date === targetDate);
        return dayForecast;
    } catch (error) {
        console.error('Error fetching weather for day:', error);
        return null;
    }
};