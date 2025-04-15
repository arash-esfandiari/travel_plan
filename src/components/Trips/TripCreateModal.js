import React, { useState, useRef, useEffect } from 'react';
import { createTrip } from '../../services/tripService';
import { DateRange } from 'react-date-range';
import { addDays, format } from 'date-fns';
import enUS from 'date-fns/locale/en-US';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import Autocomplete from 'react-google-autocomplete';
import './TripCreateModal.css';

const TripCreateModal = ({ onClose, onTripCreated }) => {
    const [tripName, setTripName] = useState('');
    const [description, setDescription] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [latitude, setLatitude] = useState(null); // State for latitude
    const [longitude, setLongitude] = useState(null); // State for longitude
    const [numberOfPeople, setNumberOfPeople] = useState(1); // State for number of people
    const [isLoading, setIsLoading] = useState(false);


    // Date range picker state
    const [dateRange, setDateRange] = useState([
        {
            startDate: new Date(),
            endDate: addDays(new Date(), 1),
            key: 'selection'
        }
    ]);
    const [showCalendar, setShowCalendar] = useState(false);
    const calendarRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (calendarRef.current && !calendarRef.current.contains(event.target)) {
                setShowCalendar(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const formattedDateRange = `${format(dateRange[0].startDate, 'MMM dd, yyyy')} - ${format(dateRange[0].endDate, 'MMM dd, yyyy')}`;

    // Fetch image URL for the city using a four-step process
    const fetchCityImageFromWikidata = async (cityName) => {
        try {
            // Step 1: Get Wikipedia title using the search API
            const searchRes = await fetch(
                `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(cityName)}&format=json&origin=*`
            );
            const searchData = await searchRes.json();
            const pageTitle = searchData.query.search[0]?.title;
            if (!pageTitle) return null;

            // Step 2: Get Wikidata ID from the Wikipedia page
            const pageRes = await fetch(
                `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(pageTitle)}&prop=pageprops&format=json&origin=*`
            );
            const pageData = await pageRes.json();
            const page = Object.values(pageData.query.pages)[0];
            const wikidataId = page?.pageprops?.wikibase_item;
            if (!wikidataId) return null;

            // Step 3: Get image filename from Wikidata (property P18)
            const wikidataRes = await fetch(
                `https://www.wikidata.org/wiki/Special:EntityData/${wikidataId}.json`
            );
            const wikidataData = await wikidataRes.json();
            const imageFilename = wikidataData.entities[wikidataId]?.claims?.P18?.[0]?.mainsnak?.datavalue?.value;
            if (!imageFilename) return null;

            // Step 4: Convert the filename to a Wikimedia Commons image URL
            return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(imageFilename)}`;
        } catch (err) {
            console.error('Failed to fetch city image:', err);
            return null;
        }
    };

    // When a destination is selected, update the trip name, fetch its image, and get coordinates
    const handlePlaceSelected = async (place) => {
        const destination = place.formatted_address || place.name;
        setTripName(destination);

        // Extract latitude and longitude
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        setLatitude(lat);
        setLongitude(lng);

        console.log('Latitude:', lat, 'Longitude:', lng); // Debugging

        // Fetch the city image
        const cityImageUrl = await fetchCityImageFromWikidata(destination);
        if (cityImageUrl) {
            setImageUrl(cityImageUrl);
        } else {
            console.warn('No image found for the destination.');
            setImageUrl('');
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        // Validate the date range
        if (dateRange[0].endDate <= dateRange[0].startDate) {
            alert('The trip must end after it starts.');
            setIsLoading(false);
            return;
        }

        // Format the dates
        const start_date = format(dateRange[0].startDate, 'yyyy-MM-dd');
        const end_date = format(dateRange[0].endDate, 'yyyy-MM-dd');

        try {
            // Create the trip data object
            const tripData = {
                trip_name: tripName,
                start_date: start_date,
                end_date: end_date,
                description: description,
                image_url: imageUrl, // Include the image URL as a string
                latitude: latitude, // Include latitude
                longitude: longitude, // Include longitude
                number_of_people: numberOfPeople, // Include number of people
            };

            // Call the createTrip service
            const newTrip = await createTrip(tripData);
            onTripCreated(newTrip); // Notify the parent component of the new trip
            onClose(); // Close the modal
        } catch (error) {
            console.error('Error creating trip:', error);
            alert('Failed to create trip.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Create a Trip</h2>
                <form onSubmit={handleSubmit}>
                    <label>
                        <span className="form-label">Destination</span>
                        <Autocomplete
                            apiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
                            onPlaceSelected={handlePlaceSelected}
                            types={['(cities)']}
                            placeholder="Enter the city or destination"
                            className="autocomplete-input"
                        />
                    </label>
                    <label>
                        <span className="form-label">Dates</span>
                        <div className="date-range-input" onClick={() => setShowCalendar(!showCalendar)}>
                            {formattedDateRange}
                        </div>
                    </label>
                    {showCalendar && (
                        <div className="calendar-popup" ref={calendarRef}>
                            <DateRange
                                onChange={(item) => setDateRange([item.selection])}
                                ranges={dateRange}
                                minDate={new Date()}
                                staticRanges={[]}
                                inputRanges={[]}
                                locale={enUS}
                                rangeColors={['#FF4500']}
                            />
                        </div>
                    )}
                    <label>
                        <span className="form-label">Number of People</span>
                        <input
                            type="number"
                            min="1"
                            value={numberOfPeople}
                            onChange={(e) => setNumberOfPeople(parseInt(e.target.value, 10))}
                            required
                        />
                    </label>
                    <label>
                        <span className="form-label">Description</span>
                        <textarea
                            placeholder="Enter details about your trip, including activities, preferences, and goals (e.g., sightseeing, food tours, adventure sports)"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        ></textarea>
                    </label>
                    <div className="modal-actions">
                        <button type="button" onClick={onClose}>Cancel</button>
                        <button type="submit" disabled={isLoading}>
                            {isLoading ? 'Creating...' : 'Create Trip'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TripCreateModal;