import React, { useState, useRef, useEffect } from 'react';
import { createTrip } from '../../services/tripService';
import { DateRange } from 'react-date-range';
import { addDays, format } from 'date-fns';
import enUS from 'date-fns/locale/en-US';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import ImageUploader from '../Shared/ImageUploader';
import './TripCreateModal.css';

const TripCreateModal = ({ onClose, onTripCreated }) => {
    const [tripName, setTripName] = useState('');
    const [description, setDescription] = useState('');
    const [imageFile, setImageFile] = useState(null);

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

    // Toggle calendar popup on click outside
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (dateRange[0].endDate <= dateRange[0].startDate) {
            alert('The trip must end after it starts.');
            return;
        }
        const start_date = format(dateRange[0].startDate, 'yyyy-MM-dd');
        const end_date = format(dateRange[0].endDate, 'yyyy-MM-dd');

        try {
            const formData = new FormData();
            formData.append('trip_name', tripName);
            formData.append('start_date', start_date);
            formData.append('end_date', end_date);
            formData.append('description', description);
            if (imageFile) formData.append('image', imageFile);

            const newTrip = await createTrip(formData);
            onTripCreated(newTrip);
            onClose();
        } catch (error) {
            console.error('Error creating trip:', error);
            alert('Failed to create trip.');
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Create a Trip</h2>
                <form onSubmit={handleSubmit} encType="multipart/form-data">
                    <input
                        type="text"
                        placeholder="Trip Name"
                        value={tripName}
                        onChange={(e) => setTripName(e.target.value)}
                        required
                    />
                    <div className="date-range-input" onClick={() => setShowCalendar(!showCalendar)}>
                        {formattedDateRange}
                    </div>
                    {showCalendar && (
                        <div className="calendar-popup" ref={calendarRef}>
                            <DateRange
                                onChange={item => setDateRange([item.selection])}
                                ranges={dateRange}
                                minDate={new Date()}
                                staticRanges={[]}
                                inputRanges={[]}
                                locale={enUS}
                                rangeColors={['#FF4500']}
                            />
                        </div>
                    )}
                    <textarea
                        placeholder="Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                    ></textarea>
                    <ImageUploader
                        onFileSelected={(file) => setImageFile(file)}
                    />
                    <div className="modal-actions">
                        <button type="button" onClick={onClose}>Cancel</button>
                        <button type="submit">Create Trip</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TripCreateModal;