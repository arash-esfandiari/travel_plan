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
 * Fetches the forecast for a trip's duration and validates it against required dates.
 * @param {number} lat - Latitude.
 * @param {number} lon - Longitude.
 * @param {number} days - Number of days for the forecast (max 14).
 * @param {Array<string>} requiredDates - An array of 'YYYY-MM-DD' date strings that are expected.
 * @returns {Promise<Object|null>} - A map of dates to forecast objects.
 */
export const getTripWeatherForecast = async (lat, lon, days, requiredDates) => {
    try {
        const query = `${lat},${lon}`;
        console.log(`Weather API: Fetching ${days} days for query: ${query}`);
        console.log('Weather API: Required dates:', requiredDates);

        const response = await axios.get(WEATHER_API_URL, {
            params: {
                key: API_KEY,
                q: query,
                days: Math.min(days, 14), // API maximum is 14 days
                aqi: 'no',
                alerts: 'no'
            }
        });

        console.log('Weather API: Received response.');
        const forecastDays = response.data.forecast.forecastday;
        console.log('Weather API: Raw forecast days:', forecastDays);

        // Create a map of dates to weather data for available dates
        const availableWeatherMap = {};

        forecastDays.forEach(day => {
            // Process all available days, not just required ones
            availableWeatherMap[day.date] = {
                date: day.date,
                temperature: {
                    min: Math.round(day.day.mintemp_c),
                    max: Math.round(day.day.maxtemp_c),
                    avg: Math.round(day.day.avgtemp_c)
                },
                weather: day.day.condition.text,
                icon: day.day.condition.icon.startsWith('//')
                    ? `https:${day.day.condition.icon}`
                    : day.day.condition.icon
            };
        });

        console.log('Weather API: All available weather data:', availableWeatherMap);

        // Filter to only include dates that are in our required dates
        const filteredWeatherMap = {};
        requiredDates.forEach(date => {
            if (availableWeatherMap[date]) {
                filteredWeatherMap[date] = availableWeatherMap[date];
            }
        });

        console.log('Weather API: Filtered weather map for required dates:', filteredWeatherMap);

        // Return the filtered data (even if partial)
        return Object.keys(filteredWeatherMap).length > 0 ? filteredWeatherMap : null;
    } catch (error) {
        console.error('Error fetching trip weather forecast:', error.response ? error.response.data : error.message);
        return null;
    }
};

/**
 * Retrieves the forecast for a specific day by fetching a multi-day forecast.
 * This is less efficient if you need weather for many individual days.
 * @param {number} lat - Latitude.
 * @param {number} lon - Longitude.
 * @param {string} targetDate - Date in "yyyy-MM-dd" format.
 * @returns {Promise<Object|null>} - Forecast object for the day, or null if not found.
 */
export const getWeatherForDay = async (lat, lon, targetDate) => {
    try {
        // Fetch a 7-day forecast to find the specific day
        const forecast = await getWeatherForecast(lat, lon, 7);
        const dayForecast = forecast.find(f => f.date === targetDate);
        return dayForecast;
    } catch (error) {
        console.error('Error fetching weather for day:', error);
        return null;
    }
};