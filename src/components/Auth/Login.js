import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { login as loginService } from '../../services/authService';
import { AuthContext } from '../../context/AuthContext';
import './Login.css';

// Import travel images
import paris from '../../assets/images/places/paris.webp';
import barcelona from '../../assets/images/places/barcelona.avif';
import egypt from '../../assets/images/places/egypt.avif';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    // Get return information from navigation state
    const returnTo = location.state?.returnTo;
    const message = location.state?.message;

    // Animated emojis for the floating icons
    const emojis = ['✈️', '🗺️', '🏛️', '🌍', '🎒', '📸', '🏖️', '🗽', '🎡', '🏰'];

    useEffect(() => {
        // Add entrance animation
        const container = document.querySelector('.login-container');
        if (container) {
            container.classList.add('login-entering');
            setTimeout(() => {
                container.classList.remove('login-entering');
                container.classList.add('login-visible');
            }, 100);
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const { token } = await loginService(email, password);
            localStorage.setItem('token', token);
            login(token);

            // Redirect based on return state
            if (returnTo === 'question-flow') {
                navigate('/', { state: { showQuestionFlow: true } });
            } else {
                navigate('/');
            }
        } catch (error) {
            console.error('Login failed:', error);
            setError('Login failed. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-page">
            {/* Background with layered images */}
            <div className="login-background">
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

            {/* Main login container */}
            <div className="login-container">
                <div className="login-header">
                    <div className="login-logo">
                        <span className="logo-emoji">🌍</span>
                        <h1 className="login-title">Welcome Back!</h1>
                    </div>
                    <p className="login-subtitle">Ready to plan your next adventure?</p>
                </div>

                {message && (
                    <div className="login-message">
                        <span className="message-icon">🎯</span>
                        <p>{message}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="input-group">
                        <div className="input-icon">📧</div>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="login-input"
                        />
                    </div>

                    <div className="input-group">
                        <div className="input-icon">🔒</div>
                        <input
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="login-input"
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
                        className={`login-button ${isLoading ? 'loading' : ''}`}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <span className="loading-spinner">⏳</span>
                                <span>Logging in...</span>
                            </>
                        ) : (
                            <>
                                <span className="button-icon">🚀</span>
                                <span>Start Your Journey</span>
                            </>
                        )}
                    </button>
                </form>

                <div className="login-footer">
                    <p className="signup-prompt">
                        Don't have an account?
                        <button
                            className="signup-link"
                            onClick={() => navigate('/signup')}
                        >
                            Sign up here! ✨
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;