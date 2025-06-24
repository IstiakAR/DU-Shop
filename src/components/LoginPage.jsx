import { useState } from 'react';
import axios from 'axios';
import '../styles/LoginPage.css';

function Login() {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        password: '',
        fullName: '',
        email: ''
    });

    const toggleForm = () => {
        setIsLogin(!isLogin);
    };

    const handleSignUp = async (e) => {
        e.preventDefault();
        console.log("Sign Up Data:", formData);
        await axios.post('http://localhost:5000/send-otp', { email: formData.email });
        alert('OTP sent!');
    }

    return (
        <div className="container">
            <div className="login-form-container">
                <h1>{isLogin ? "Login" : "Sign Up"}</h1>
                
                {isLogin ? (
                    <form className="login-form">
                        <div className="form-group">
                            <label htmlFor="username">Username:</label>
                            <input type="text" id="username" name="username" required />
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="password">Password:</label>
                            <input type="password" id="password" name="password" required />
                        </div>
                        
                        <button type="submit" className="submit-btn">Login</button>
                        
                        <div className="form-links">
                            <a href="#" className="forgot-password">Forgot Password?</a>
                        </div>
                    </form>
                ) : (
                    <form className="signup-form">
                        <div className="form-group">
                            <label htmlFor="fullName">Full Name:</label>
                            <input type="text" id="fullName" name="fullName" required />
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="email">Email:</label>
                            <input type="email" id="email" name="email" onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="newPassword">Password:</label>
                            <input type="password" id="newPassword" name="newPassword" required />
                        </div>
                        
                        <button type="submit" className="submit-btn" onClick={handleSignUp}>Sign Up</button>
                    </form>
                )}
                
                <div className="toggle-form">
                    {isLogin ? (
                        <p>Don't have an account? <button onClick={toggleForm} className="toggle-btn">Sign up</button></p>
                    ) : (
                        <p>Already have an account? <button onClick={toggleForm} className="toggle-btn">Login</button></p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Login;