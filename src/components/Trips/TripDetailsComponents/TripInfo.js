// src/components/Trips/TripDetailsComponents/TripInfo.js
import React from 'react';
import SmartTripImage from '../../Shared/SmartTripImage';
import TripRecommendations from '../TripRecommendations';
import { formatDate } from '../../../utils/formatDate';

const TripInfo = ({ trip, onParseToDailyPlans }) => {
    return (
        <div className="general-info-section">
            <div className="trip-image-container">
                <SmartTripImage
                    trip={trip}
                    alt={trip.trip_name}
                    className="trip-image"
                />
            </div>

            <div className="trip-info-grid">
                <div className="info-card">
                    <div className="info-icon">📍</div>
                    <div className="info-content">
                        <h3>Destination</h3>
                        <p>{trip.city_name || trip.trip_name}</p>
                    </div>
                </div>

                <div className="info-card">
                    <div className="info-icon">📅</div>
                    <div className="info-content">
                        <h3>Dates</h3>
                        <p>{formatDate(trip.start_date)} - {formatDate(trip.end_date)}</p>
                    </div>
                </div>

                <div className="info-card">
                    <div className="info-icon">👥</div>
                    <div className="info-content">
                        <h3>Travelers</h3>
                        <p>{trip.number_of_people} {trip.number_of_people === 1 ? 'Person' : 'People'}</p>
                    </div>
                </div>

                <div className="info-card">
                    <div className="info-icon">💰</div>
                    <div className="info-content">
                        <h3>Budget</h3>
                        <p>{trip.budget_range || 'Not specified'}</p>
                    </div>
                </div>
            </div>

            {trip.description && (
                <div className="description-card">
                    <h3>✨ About This Trip</h3>
                    <p>{trip.description}</p>
                </div>
            )}

            {trip.recommendations && (
                <div className="recommendations-section">
                    <TripRecommendations
                        recommendations={trip.recommendations}
                        trip={trip}
                        onParseToDailyPlans={onParseToDailyPlans}
                    />
                </div>
            )}
        </div>
    );
};

export default TripInfo; 