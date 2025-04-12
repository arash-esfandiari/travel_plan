import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import './Header.css';
import logo from '../../assets/images/logos/logo_horz.png';

const Header = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <header>
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
                            <button className="user-name">{user.email}</button>
                            <div className="dropdown-menu">
                                <button onClick={handleLogout}>Logout</button>
                            </div>
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