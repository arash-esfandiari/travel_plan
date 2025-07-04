import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../../services/authService';
import './Signup.css';

// Import travel images
import paris from '../../assets/images/places/paris.webp';
import barcelona from '../../assets/images/places/barcelona.avif';
import egypt from '../../assets/images/places/egypt.avif';

const Signup = () => {
    const [username, setUsername] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Animated emojis for the floating icons
    const emojis = ['🌟', '🎉', '🚀', '💫', '✨', '🎊', '🏆', '💎', '🎯', '⭐'];

    // Helper function to capitalize the first letter and make all other letters lowercase
    const formatName = (name) => {
        return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
    };

    useEffect(() => {
        // Add entrance animation
        const container = document.querySelector('.signup-container');
        if (container) {
            container.classList.add('signup-entering');
            setTimeout(() => {
                container.classList.remove('signup-entering');
                container.classList.add('signup-visible');
            }, 100);
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            // Format firstName and lastName before sending to the backend
            const formattedFirstName = formatName(firstName);
            const formattedLastName = formatName(lastName);

            await register(username, email, password, formattedFirstName, formattedLastName);
            navigate('/login', {
                state: {
                    message: 'Account created successfully! Please log in to start your journey.'
                }
            });
        } catch (error) {
            console.error('Signup failed:', error);
            setError('Signup failed. Please try again with different credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="signup-page">
            {/* Background with layered images */}
            <div className="signup-background">
                <div className="bg-layer bg-layer-1">
                    <img src={paris} alt="Paris" className="bg-image" />
                    <div className="bg-overlay"></div>
                </div>
                <div className="bg-layer bg-layer-2">
                    <img src={barcelona} alt="Barcelona" className="bg-image" />
                    <div className="bg-overlay"></div>
                </div>
                <div className="bg-layer bg-layer-3">
                    <img src={egypt} alt="Egypt" className="bg-image" />
                    <div className="bg-overlay"></div>
                </div>
            </div>

            {/* Floating decorative icons */}
            {emojis.map((emoji, index) => (
                <div
                    key={index}
                    className={`floating-emoji floating-emoji-${index + 1}`}
                    style={{ animationDelay: `${index * 0.5}s` }}
                >
                    <span>{emoji}</span>
                </div>
            ))}

            {/* Main signup container */}
            <div className="signup-container">
                <div className="signup-header">
                    <div className="signup-logo">
                        <span className="logo-emoji">🎉</span>
                        <h1 className="signup-title">Join the Adventure!</h1>
                    </div>
                    <p className="signup-subtitle">Create your account and start planning amazing trips</p>
                </div>

                <form onSubmit={handleSubmit} className="signup-form">
                    <div className="input-group">
                        <div className="input-icon">👤</div>
                        <input
                            type="text"
                            placeholder="Choose a username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            className="signup-input"
                        />
                    </div>

                    <div className="input-row">
                        <div className="input-group">
                            <div className="input-icon">📝</div>
                            <input
                                type="text"
                                placeholder="First name"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                required
                                className="signup-input"
                            />
                        </div>

                        <div className="input-group">
                            <div className="input-icon">📝</div>
                            <input
                                type="text"
                                placeholder="Last name"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                required
                                className="signup-input"
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <div className="input-icon">📧</div>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="signup-input"
                        />
                    </div>

                    <div className="input-group">
                        <div className="input-icon">🔒</div>
                        <input
                            type="password"
                            placeholder="Create a password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="signup-input"
                        />
                    </div>

                    {error && (
                        <div className="error-message">
                            <span className="error-icon">⚠️</span>
                            <p>{error}</p>
                        </div>
                    )}

                    <button
                        type="submit"
                        className={`signup-button ${isLoading ? 'loading' : ''}`}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <span className="loading-spinner">⏳</span>
                                <span>Creating Account...</span>
                            </>
                        ) : (
                            <>
                                <span className="button-icon">🚀</span>
                                <span>Start Your Journey</span>
                            </>
                        )}
                    </button>
                </form>

                <div className="signup-footer">
                    <p className="login-prompt">
                        Already have an account?
                        <button
                            className="login-link"
                            onClick={() => navigate('/login')}
                        >
                            Log in here! ✨
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Signup;