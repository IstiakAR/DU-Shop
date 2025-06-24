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
        await axios.post('http://localhost:5000/sign-up', formData);
    }

    const handleLogin = async (e) => {
        e.preventDefault();
        console.log("Login Data:", formData);
        try {
            const response = await axios.post('http://localhost:5000/login', formData);
            if (response.data.success) {
                alert("Login successful!");
            } else {
                alert("Login failed. Please check your credentials.");
            }
        } catch (error) {
            console.error("Error during login:", error);
            alert("An error occurred during login. Please try again.");
        }
    }

    const handleEdit = (e, field) =>{
        setFormData({ ...formData, [field]: e.target.value });
    }

    return (
        <div className="container">
            <div className="login-form-container">
                <h1>{isLogin ? "Login" : "Sign Up"}</h1>
                
                <form className="full-form">

                    {!isLogin && (
                        <div className="form-group">
                            <label htmlFor="fullName">Full Name:</label>
                            <input type="text" id="fullName" name="fullName" onChange={(e) => handleEdit(e, 'fullName')} required />
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="email">Email:</label>
                        <input type="email" id="email" name="email" onChange={(e) => handleEdit(e, 'email')} required />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password:</label>
                        <input type="password" id="password" name="password" onChange={(e) => handleEdit(e, 'password')} required />
                    </div>

                    {isLogin && <a href="#" className="forgot-password">Forgot Password?</a>}

                    {(isLogin) ? (
                        <button type="button" className="submit-btn" onClick={handleLogin}>Login</button>
                    ) : (
                        <button type="button" className="submit-btn" onClick={handleSignUp}>Sign Up</button>
                    )}

                </form>

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