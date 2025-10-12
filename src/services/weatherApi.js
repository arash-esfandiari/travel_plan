// src/services/weatherApi.js
import axios from 'axios';

const API_KEY = process.env.REACT_APP_WEATHER_API_KEY;
const WEATHER_API_URL = 'https://api.weatherapi.com/v1/forecast.json';

// Check if API key is configured
if (!API_KEY) {
    console.warn('⚠️ Weather API key not configured. Using mock weather data.');
    console.warn('📋 To fix: Add REACT_APP_WEATHER_API_KEY to your .env file');
    console.warn('🔗 Get key from: https://www.weatherapi.com/signup.aspx');
}

/**
 * Generate mock weather data for testing when API key is not configured
 */
const generateMockWeather = (days) => {
    const weatherConditions = [
        { text: 'Sunny', icon: '//cdn.weatherapi.com/weather/64x64/day/113.png' },
        { text: 'Partly cloudy', icon: '//cdn.weatherapi.com/weather/64x64/day/116.png' },
        { text: 'Cloudy', icon: '//cdn.weatherapi.com/weather/64x64/day/119.png' },
        { text: 'Light rain', icon: '//cdn.weatherapi.com/weather/64x64/day/296.png' }
    ];

    const mockData = [];
    const today = new Date();

    for (let i = 0; i < days; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        const condition = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];

        mockData.push({
            date: date.toISOString().split('T')[0], // "yyyy-MM-dd"
            temperature: {
                min: Math.floor(Math.random() * 15) + 10, // 10-25°C
                max: Math.floor(Math.random() * 15) + 20, // 20-35°C
            },
            weather: condition.text,
            icon: `https:${condition.icon}`,
        });
    }

    return mockData;
};

/**
 * Fetches the forecast for the given coordinates for a specified number of days (default 7).
 * @param {number} lat - Latitude.
 * @param {number} lon - Longitude.
 * @param {number} days - Number of days to fetch (default 7).
 * @returns {Promise<Array>} - Array of daily forecast objects.
 */
export const getWeatherForecast = async (lat, lon, days = 7) => {
    // Return mock data if API key is not configured
    if (!API_KEY) {
        console.log('🔄 Returning mock weather data (API key not configured)');
        return generateMockWeather(days);
    }

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
        console.log('🔄 Falling back to mock weather data');
        return generateMockWeather(days);
    }
};

/**
 * Generate mock weather map for specific required dates
 */
const generateMockWeatherMap = (requiredDates) => {
    const weatherConditions = [
        { text: 'Sunny', icon: '//cdn.weatherapi.com/weather/64x64/day/113.png' },
        { text: 'Partly cloudy', icon: '//cdn.weatherapi.com/weather/64x64/day/116.png' },
        { text: 'Cloudy', icon: '//cdn.weatherapi.com/weather/64x64/day/119.png' },
        { text: 'Light rain', icon: '//cdn.weatherapi.com/weather/64x64/day/296.png' }
    ];

    const mockWeatherMap = {};

    requiredDates.forEach(date => {
        const condition = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];
        const minTemp = Math.floor(Math.random() * 15) + 10; // 10-25°C
        const maxTemp = minTemp + Math.floor(Math.random() * 10) + 5; // 5-15°C above min

        mockWeatherMap[date] = {
            date: date,
            temperature: {
                min: Math.round(minTemp),
                max: Math.round(maxTemp),
                avg: Math.round((minTemp + maxTemp) / 2)
            },
            weather: condition.text,
            icon: condition.icon.startsWith('//')
                ? `https:${condition.icon}`
                : condition.icon
        };
    });

    return mockWeatherMap;
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
    // Return mock data if API key is not configured
    if (!API_KEY) {
        console.log('🔄 Returning mock trip weather data (API key not configured)');
        console.log('Weather API: Required dates:', requiredDates);
        const mockData = generateMockWeatherMap(requiredDates);
        console.log('Weather API: Mock weather map:', mockData);
        return mockData;
    }

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
        console.log('🔄 Falling back to mock trip weather data');
        return generateMockWeatherMap(requiredDates);
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
        return dayForecast || null;
    } catch (error) {
        console.error('Error fetching weather for day:', error);

        // Return mock data for the specific day if API fails
        if (!API_KEY) {
            console.log('🔄 Returning mock weather for specific day');
            const mockData = generateMockWeatherMap([targetDate]);
            return mockData[targetDate] || null;
        }

        return null;
    }
};