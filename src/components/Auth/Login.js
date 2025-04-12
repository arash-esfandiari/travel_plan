import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as loginService } from '../../services/authService';
import { AuthContext } from '../../context/AuthContext'; // Import AuthContext

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useContext(AuthContext); // Access the login function from AuthContext
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { token } = await loginService(email, password); // Call the login service
            localStorage.setItem('token', token); // Store the token in localStorage
            login(token); // Update the global auth state using AuthContext
            navigate('/'); // Redirect to the home page
        } catch (error) {
            console.error('Login failed:', error);
            alert('Login failed. Please check your credentials.');
        }
    };

    return (
        <div className="form-container">
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit">Log In</button>
            </form>
        </div>
    );
};

export default Login;