// src/App.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { LoadScript } from '@react-google-maps/api'; // Use LoadScript to load the Maps API
import Header from './components/Shared/Header';
import Footer from './components/Shared/Footer';
import NotFound from './components/Shared/NotFound';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
// import Dashboard from './components/Dashboard/Dashboard';
import MainPage from './components/Home/MainPage';
import TripList from './components/Trips/TripList';
import TripDetails from './components/Trips/TripDetails';
import TripEdit from './components/Trips/TripEdit';
import SplitDetails from './components/Trips/SplitDetails';
import TripSplitList from './components/TripSplit/TripSplitList';

function App() {
  return (
    <LoadScript
      googleMapsApiKey={process.env.REACT_APP_GOOGLE_API_KEY}
      libraries={['places']}
      onLoad={() => console.log('Google Maps API loaded')}
    >
      <div className="app-container">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/trips" element={<TripList />} />
            <Route path="/trip-split" element={<TripSplitList />} />
            <Route path="/trip-split/:tripId" element={<SplitDetails />} />
            <Route path="/trips/:tripId" element={<TripDetails />} />
            <Route path="/trips/:tripId/edit" element={<TripEdit />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </LoadScript>
  );
}

export default App;