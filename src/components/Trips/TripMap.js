// src/components/Trips/TripMap.js
import React from 'react';
import { GoogleMap } from '@react-google-maps/api';
import AdvancedMarker from './AdvancedMarker';

const containerStyle = {
    width: '100%',
    height: '100%',
};

const TripMap = ({ center, attractions }) => {
    if (!window.google || !window.google.maps) {
        return <div>Loading map...</div>;
    }
    return (
        <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={13}>
            {attractions &&
                attractions.map((attraction) => (
                    <AdvancedMarker
                        key={attraction.key}
                        position={attraction.location}
                        title={attraction.name}
                    />
                ))}
        </GoogleMap>
    );
};

export default React.memo(TripMap);