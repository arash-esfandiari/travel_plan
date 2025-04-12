import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import './MainPage.css';
import { AuthContext } from '../../context/AuthContext'; // Import AuthContext

// Import local images from assets/images/cities
import city1 from '../../assets/images/cities/barca.jpg';
import city2 from '../../assets/images/cities/santiago.webp';
import city3 from '../../assets/images/cities/eiffel.jpg';
import city4 from '../../assets/images/cities/lisbon.webp';
import city5 from '../../assets/images/cities/munich.webp';
import city6 from '../../assets/images/cities/isfahan.jpg';
import city7 from '../../assets/images/cities/egypt.avif';
import city8 from '../../assets/images/cities/vegas.webp';

const imageUrls = [city1, city2, city3, city4, city5, city6, city7, city8];

const MainPage = () => {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext); // Access the user from AuthContext

    const handleCreateTrip = () => {
        if (user) {
            navigate('/trips'); // Redirect to trips page if logged in
        } else {
            navigate('/login'); // Redirect to login page if not logged in
        }
    };

    // Create an array for 9 cells (3 rows x 3 columns)
    const cells = Array.from({ length: 9 }, (_, index) => index);

    return (
        <div className="main-page">
            <div className="grid-container">
                {cells.map((cellIndex) => {
                    // For cell index 4 (the center cell), render the button.
                    if (cellIndex === 4) {
                        return (
                            <div key={cellIndex} className="grid-item central-item">
                                <button className="create-trip-button" onClick={handleCreateTrip}>
                                    + Plan Your Trip
                                </button>
                            </div>
                        );
                    }
                    // Otherwise, render an image from our local assets.
                    // Use modulo to cycle through images if necessary.
                    let imgIndex = 0;
                    if (cellIndex < 4) {
                        imgIndex = cellIndex;
                    } else {
                        imgIndex = cellIndex - 1;
                    }
                    const imageUrl = imageUrls[imgIndex];
                    return (
                        <div key={cellIndex} className="grid-item">
                            <img src={imageUrl} alt="City Attraction" />
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default MainPage;