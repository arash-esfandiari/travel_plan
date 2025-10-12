// src/components/Trips/AdvancedMarker.js
import { useEffect } from 'react';
import { useGoogleMap } from '@react-google-maps/api';

const AdvancedMarker = ({ position, title }) => {
    const map = useGoogleMap();

    useEffect(() => {
        if (!map || !window.google || !window.google.maps || !window.google.maps.marker) return;
        const advancedMarker = new window.google.maps.marker.AdvancedMarkerElement({
            position,
            map,
            title,
            content: `<div style="font-family:Montserrat; font-size:12px; color:#000;">${title}</div>`,
        });
        return () => {
            advancedMarker.setMap(null);
        };
    }, [map, position, title]);

    return null;
};

export default AdvancedMarker;