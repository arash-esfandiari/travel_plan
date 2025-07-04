import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import './Header.css';
import logo from '../../assets/images/logos/logo.png';

const Header = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [isFading, setIsFading] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY;
            const shouldBeScrolled = scrollTop > 10;
            setIsScrolled(shouldBeScrolled);
        };

        // Call once on mount to set initial state
        handleScroll();

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Reset fading state when user changes
    useEffect(() => {
        setIsFading(false);
        setIsDropdownOpen(false);
    }, [user]);

    const handleLogout = () => {
        setIsFading(true);
        setTimeout(() => {
            logout();
            navigate('/');
        }, 1000);
    };

    const toggleDropdown = () => {
        setIsDropdownOpen((prev) => !prev);
    };

    return (
        <header className={`${isFading ? 'fade-out' : ''} ${isScrolled ? 'scrolled' : ''}`}>
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
                                onClick={toggleDropdown}
                                aria-expanded={isDropdownOpen}
                            >
                                {user.first_name} <span className="dropdown-arrow">▼</span>
                            </button>
                            {isDropdownOpen && (
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