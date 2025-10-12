// src/components/Trips/TripDetailsComponents/useTripDetails.js
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTripById } from '../../../services/tripService';
import { createBulkDailyPlans } from '../../../services/dailyPlanService';
import { getTripWeatherForecast } from '../../../services/weatherApi';

export const useTripDetails = (tripId) => {
    const navigate = useNavigate();
    const [trip, setTrip] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [mapCenter, setMapCenter] = useState(null);
    const [dailyPlans, setDailyPlans] = useState([]);
    const [draggedPlan, setDraggedPlan] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [weatherData, setWeatherData] = useState(null);
    const [weatherStatus, setWeatherStatus] = useState('loading');

    // Fetch trip details
    useEffect(() => {
        console.log('🔍 TripDetails: Fetching trip details for ID:', tripId);
        const fetchTripDetails = async () => {
            try {
                setLoading(true);
                const data = await getTripById(tripId);
                console.log('✅ TripDetails: Trip data received:', data);
                console.log('🗓️ Trip dates from backend:', {
                    start_date: data.trip.start_date,
                    end_date: data.trip.end_date
                });
                setTrip(data.trip);

                // Filter out any undefined/null plans and log the filtering process
                const rawPlans = data.trip.daily_plans || [];

                const validPlans = rawPlans.filter((plan, index) => {
                    const isValid = plan && typeof plan === 'object' && plan.plan_date;
                    if (!isValid) {
                        console.warn(`⚠️ Filtering out invalid plan at index ${index}:`, plan);
                    }
                    return isValid;
                });

                setDailyPlans(validPlans);
                setError(null);
            } catch (error) {
                console.error('❌ TripDetails: Error fetching trip details:', error);
                setError('Failed to load trip details. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        if (tripId) {
            fetchTripDetails();
        }
    }, [tripId]);

    // Set map center
    useEffect(() => {
        if (trip) {
            const lat = parseFloat(trip.latitude);
            const lng = parseFloat(trip.longitude);
            if (!isNaN(lat) && !isNaN(lng)) {
                setMapCenter({ lat, lng });
                console.log('📍 TripDetails: Map center set to:', { lat, lng });
            } else {
                setMapCenter({ lat: 40.7128, lng: -74.0060 }); // Default to NYC
                console.log('📍 TripDetails: Using default coordinates (NYC)');
            }
        }
    }, [trip]);

    // Fetch weather for all visible dates
    useEffect(() => {
        const fetchTripWeather = async () => {
            setWeatherData(null);
            setWeatherStatus('loading');

            if (trip && trip.latitude && trip.longitude) {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const startDate = new Date(trip.start_date);
                const endDate = new Date(trip.end_date);

                const daysUntilTrip = Math.ceil((startDate - today) / (1000 * 60 * 60 * 24));
                const daysUntilTripEnd = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));

                console.log('🌤️ Weather Debug - Trip dates analysis:', {
                    today: today.toISOString().split('T')[0],
                    tripStart: startDate.toISOString().split('T')[0],
                    tripEnd: endDate.toISOString().split('T')[0],
                    daysUntilTrip,
                    daysUntilTripEnd
                });

                // Only fetch weather if trip end is within the next 14 days
                if (daysUntilTripEnd < 0 || daysUntilTripEnd > 14) {
                    console.log('Weather API: Trip end outside 14-day window:', { daysUntilTripEnd });
                    setWeatherStatus('unavailable');
                    setWeatherData(null);
                    return;
                }

                const requiredDates = [];
                for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
                    requiredDates.push(date.toISOString().split('T')[0]);
                }

                // Calculate how many days from today we need to fetch to cover all trip dates
                const lastTripDate = new Date(endDate);
                const daysToFetch = Math.ceil((lastTripDate - today) / (1000 * 60 * 60 * 24)) + 1;
                const duration = Math.min(daysToFetch, 14); // Cap at API maximum

                console.log('🌤️ Weather Debug - Requesting weather for dates:', requiredDates);
                console.log('🌤️ Weather Debug - Days to fetch from today:', duration);

                try {
                    const weatherMap = await getTripWeatherForecast(trip.latitude, trip.longitude, duration, requiredDates);

                    console.log('🌤️ Weather Debug - API returned:', weatherMap);
                    console.log('🌤️ Weather Debug - Available dates in response:', weatherMap ? Object.keys(weatherMap) : 'null');

                    if (weatherMap && Object.keys(weatherMap).length > 0) {
                        setWeatherData(weatherMap);
                        setWeatherStatus('available');
                        console.log('🌤️ Weather Debug - Set status to available');
                    } else {
                        setWeatherData(null);
                        setWeatherStatus('unavailable');
                        console.log('🌤️ Weather Debug - Set status to unavailable (empty data)');
                    }
                } catch (error) {
                    console.error('❌ Error fetching trip weather data:', error);
                    setWeatherData(null);
                    setWeatherStatus('unavailable');
                }
            }
        };

        fetchTripWeather();
    }, [trip]);

    // Handler functions
    const handleGoBack = () => {
        navigate('/trips');
    };

    const handleRefresh = async () => {
        console.log('🔄 TripDetails: Refreshing trip data...');
        const fetchTripDetails = async () => {
            try {
                setLoading(true);
                const data = await getTripById(tripId);
                setTrip(data.trip);

                // Filter out any undefined/null plans and log the filtering process
                const rawPlans = data.trip.daily_plans || [];

                const validPlans = rawPlans.filter((plan, index) => {
                    const isValid = plan && typeof plan === 'object' && plan.plan_date;
                    if (!isValid) {
                        console.warn(`⚠️ Filtering out invalid plan at index ${index} (refresh):`, plan);
                    }
                    return isValid;
                });

                console.log('✅ Valid plans after filtering (refresh):', validPlans);
                setDailyPlans(validPlans);
                setError(null);
                console.log('✅ TripDetails: Trip refreshed successfully');
            } catch (error) {
                console.error('❌ TripDetails: Error refreshing trip:', error);
                setError('Failed to refresh trip details.');
            } finally {
                setLoading(false);
            }
        };
        await fetchTripDetails();
    };

    // Drag and drop handlers
    const handleDragStart = (e, plan) => {
        setDraggedPlan(plan);
        setIsDragging(true);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = async (e, targetDay) => {
        e.preventDefault();
        if (!draggedPlan) return;

        try {
            // Update local state immediately for smooth UX
            const updatedPlans = dailyPlans.map(plan => {
                if (plan.id === draggedPlan.id) {
                    return { ...plan, plan_date: targetDay };
                }
                return plan;
            });
            setDailyPlans(updatedPlans);

            // Save to database using the correct backend schema
            const response = await fetch(`${process.env.REACT_APP_BACKEND_API_URL || 'http://localhost:5001'}/api/trips/${tripId}/daily-plans/${draggedPlan.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    plan_date: targetDay,
                    category: draggedPlan.category,
                    title: draggedPlan.title,
                    description: draggedPlan.description || ''
                })
            });

            if (!response.ok) {
                throw new Error('Failed to update plan');
            }

            console.log('✅ Plan updated successfully');
        } catch (error) {
            console.error('❌ Error updating plan:', error);
            // Revert local state on error
            const data = await getTripById(tripId);
            const validPlans = (data.trip.daily_plans || []).filter(plan =>
                plan && typeof plan === 'object' && plan.plan_date
            );
            setDailyPlans(validPlans);
        }

        setDraggedPlan(null);
        setIsDragging(false);
    };

    const handleParseToDailyPlans = async (parsedItems) => {
        try {
            console.log('🔄 handleParseToDailyPlans called with:', {
                itemsCount: parsedItems.length,
                tripId
            });

            if (!parsedItems || parsedItems.length === 0) {
                console.warn('⚠️ No parsed items to create');
                return [];
            }

            // De-duplicate against existing plans before creating new ones
            console.log('🔍 Filtering out plans that already exist in the state...');
            const existingPlans = new Set(
                dailyPlans.map(plan => {
                    const date = plan.plan_date.split('T')[0];
                    const title = plan.title.toLowerCase().trim();
                    return `${date}|${title}`;
                })
            );

            const newPlansToCreate = parsedItems.filter(item => {
                const date = item.plan_date.split('T')[0];
                const title = item.title.toLowerCase().trim();
                const key = `${date}|${title}`;
                return !existingPlans.has(key);
            });

            if (newPlansToCreate.length === 0) {
                console.log('✅ No new plans to add. All items are already in the daily plan.');
                return [];
            }

            console.log(`✅ Found ${newPlansToCreate.length} truly new plans to create.`);

            // Prepare plans for bulk creation
            const plansToCreate = newPlansToCreate.map(item => ({
                plan_date: item.plan_date,
                category: item.category,
                title: item.title,
                description: item.description || ''
            }));

            // Create plans in bulk
            const newPlans = await createBulkDailyPlans(tripId, plansToCreate);

            if (!newPlans || newPlans.length === 0) {
                console.warn('⚠️ API returned empty result after bulk create.');
                return [];
            }

            // Update local state and refresh
            setDailyPlans(prev => [...prev, ...newPlans]);
            await handleRefresh();

            console.log('✅ handleParseToDailyPlans completed successfully');
            return newPlans;
        } catch (error) {
            console.error('❌ Error in handleParseToDailyPlans:', error);
            alert(`Failed to create daily plans: ${error.message || 'Unknown error'}`);
            throw error;
        }
    };

    const handleDeletePlan = async (planId) => {
        try {
            // Update local state immediately
            const updatedPlans = dailyPlans.filter(plan => plan.id !== planId);
            setDailyPlans(updatedPlans);

            // Delete from database
            const response = await fetch(`${process.env.REACT_APP_BACKEND_API_URL || 'http://localhost:5001'}/api/trips/${tripId}/daily-plans/${planId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete plan');
            }

            console.log('✅ Plan deleted successfully');
        } catch (error) {
            console.error('❌ Error deleting plan:', error);
            // Revert local state on error
            const data = await getTripById(tripId);
            const validPlans = (data.trip.daily_plans || []).filter(plan =>
                plan && typeof plan === 'object' && plan.plan_date
            );
            setDailyPlans(validPlans);
        }
    };

    const handlePlanAdded = (newPlan) => {
        console.log('🎯 onPlanAdded called with:', newPlan);
        console.log('🔍 newPlan type:', typeof newPlan);
        console.log('🔍 newPlan has plan_date:', newPlan?.plan_date);

        if (!newPlan || typeof newPlan !== 'object') {
            console.error('❌ Invalid newPlan received:', newPlan);
            return;
        }

        if (!newPlan.plan_date) {
            console.error('❌ newPlan missing plan_date:', newPlan);
            return;
        }

        setDailyPlans(prev => {
            console.log('📋 Previous plans:', prev);
            const updated = [...prev, newPlan];
            console.log('📋 Updated plans:', updated);
            return updated;
        });
    };

    // Utility functions
    const getGroupedPlans = () => {
        if (!Array.isArray(dailyPlans)) {
            console.warn('⚠️ dailyPlans is not an array:', dailyPlans);
            return {};
        }

        return dailyPlans.reduce((acc, plan) => {
            if (!plan || !plan.plan_date) {
                console.warn(`⚠️ Invalid plan or missing plan_date:`, plan);
                return acc;
            }

            // Normalize the date to 'YYYY-MM-DD' format to handle both date strings and timestamps
            const date = plan.plan_date.split('T')[0];

            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push(plan);
            return acc;
        }, {});
    };

    const generateDateRange = (startDate, endDate) => {
        console.log('🗓️ generateDateRange called with:', { startDate, endDate });

        const dates = [];

        // Extract just the date part to avoid timezone issues
        const startDateString = startDate.split('T')[0]; // '2025-07-21'
        const endDateString = endDate.split('T')[0];     // '2025-07-24'

        console.log('🗓️ Working with date strings:', {
            start: startDateString,
            end: endDateString
        });

        // Work directly with date strings to avoid timezone conversion
        const [startYear, startMonth, startDay] = startDateString.split('-').map(Number);
        const [endYear, endMonth, endDay] = endDateString.split('-').map(Number);

        const currentDate = new Date(startYear, startMonth - 1, startDay); // Month is 0-indexed
        const endDateObj = new Date(endYear, endMonth - 1, endDay);

        // Exclude the last day by using < instead of <=
        while (currentDate < endDateObj) {
            const year = currentDate.getFullYear();
            const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
            const day = String(currentDate.getDate()).padStart(2, '0');
            const dateString = `${year}-${month}-${day}`;

            dates.push(dateString);
            console.log('🗓️ Generated date:', dateString);

            currentDate.setDate(currentDate.getDate() + 1);
        }

        console.log('🗓️ Final date range (excluding last day):', dates);
        return dates;
    };

    return {
        // State
        trip,
        loading,
        error,
        mapCenter,
        dailyPlans,
        draggedPlan,
        isDragging,
        weatherData,
        weatherStatus,

        // Handlers
        handleGoBack,
        handleRefresh,
        handleDragStart,
        handleDragOver,
        handleDrop,
        handleParseToDailyPlans,
        handleDeletePlan,
        handlePlanAdded,

        // Utility functions
        getGroupedPlans,
        generateDateRange
    };
}; 