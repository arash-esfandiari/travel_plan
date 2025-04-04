// src/components/Trips/TripDetails.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getTripById } from '../../services/tripService';
import { geocodeCity } from '../../services/geocodeCity';
import DailyPlanList from '../DailyPlan/DailyPlanList';
import DailyPlanForm from '../DailyPlan/DailyPlanForm';
import TripMap from './TripMap';
import TripRecommendations from './TripRecommendations'; // New import
import { formatDate } from '../../utils/formatDate';
import './TripDetails.css';

const TripDetails = () => {
    const { tripId } = useParams();
    const [trip, setTrip] = useState(null);
    const [mapCenter, setMapCenter] = useState(null);
    const [refreshPlans, setRefreshPlans] = useState(false);

    useEffect(() => {
        const fetchTripDetails = async () => {
            try {
                const data = await getTripById(tripId);
                setTrip(data.trip);
            } catch (error) {
                console.error('Error fetching trip details:', error);
            }
        };
        fetchTripDetails();
    }, [tripId]);

    useEffect(() => {
        if (trip) {
            const lat = parseFloat(trip.latitude);
            const lng = parseFloat(trip.longitude);
            if (!isNaN(lat) && !isNaN(lng)) {
                setMapCenter({ lat, lng });
            } else if (trip.trip_name) {
                geocodeCity(trip.trip_name)
                    .then((coords) => setMapCenter(coords))
                    .catch(() => setMapCenter({ lat: 40.7128, lng: -74.0060 }));
            } else {
                setMapCenter({ lat: 40.7128, lng: -74.0060 });
            }
        }
    }, [trip]);

    if (!trip) return <div>Loading trip details...</div>;
    if (!mapCenter) return <div>Loading map...</div>;

    const attractions = trip.attractions || [
        { key: 'attraction1', name: 'Attraction 1', location: { lat: mapCenter.lat + 0.01, lng: mapCenter.lng + 0.01 } },
        { key: 'attraction2', name: 'Attraction 2', location: { lat: mapCenter.lat - 0.01, lng: mapCenter.lng - 0.01 } },
    ];

    return (
        <div className="trip-details-wrapper">
            <div className="trip-details-left">
                <div className="trip-details-container">
                    <h2>{trip.trip_name}</h2>
                    {trip.image_url && (
                        <img
                            src={`${process.env.REACT_APP_BACKEND_API_URL}${trip.image_url}`}
                            alt={trip.trip_name}
                            className="trip-image"
                        />
                    )}
                    <p>
                        <strong>Dates:</strong> {formatDate(trip.start_date)} - {formatDate(trip.end_date)}
                    </p>
                    <p>
                        <strong>Description:</strong> {trip.description}
                    </p>
                    <h3>Itinerary</h3>
                    {/* New Recommendations Section */}
                    {trip.recommendations && (
                        <TripRecommendations recommendations={trip.recommendations} />
                    )}
                    <DailyPlanList
                        tripId={tripId}
                        tripStartDate={trip.start_date}
                        tripEndDate={trip.end_date}
                        latitude={mapCenter.lat}
                        longitude={mapCenter.lng}
                        refresh={refreshPlans}
                    />
                    <DailyPlanForm
                        tripId={tripId}
                        tripStartDate={trip.start_date}
                        tripEndDate={trip.end_date}
                        onPlanAdded={() => setRefreshPlans(!refreshPlans)}
                    />
                </div>
            </div>
            <div className="trip-details-right">
                <TripMap center={mapCenter} attractions={attractions} />
            </div>
        </div>
    );
};

export default TripDetails;