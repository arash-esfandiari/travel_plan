import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import './Header.css';
import logo from '../../assets/images/logos/logo-horz.png';

const Header = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [isFading, setIsFading] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false); // State to toggle dropdown visibility

    const handleLogout = () => {
        setIsFading(true); // Trigger fade-out effect
        setTimeout(() => {
            logout();
            navigate('/');
        }, 1000); // Match the fade-out duration
    };

    const toggleDropdown = () => {
        setIsDropdownOpen((prev) => !prev); // Toggle dropdown visibility
    };


    return (
        <header className={isFading ? 'fade-out' : ''}>
            <div className="logo">
                <Link to="/">
                    <img src={logo} alt="Logo" />
                </Link>
            </div>
            <nav>
                <Link to="/">Home</Link>
                {user ? (
                    <>
                        <Link to="/trips">My Trips</Link>
                        <div className="user-dropdown">
                            <button
                                className="user-name"
                                onClick={toggleDropdown} // Toggle dropdown on click
                                aria-expanded={isDropdownOpen} // Accessibility attribute
                            >
                                {user.first_name} <span className="dropdown-arrow">▼</span>
                            </button>
                            {isDropdownOpen && ( // Show dropdown menu only if isDropdownOpen is true
                                <div className="dropdown-menu">
                                    <button onClick={handleLogout}>Logout</button>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <>
                        <Link to="/login">Login</Link>
                        <Link to="/signup">Sign Up</Link>
                    </>
                )}
            </nav>
        </header>
    );
};

export default Header;