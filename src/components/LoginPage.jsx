import { useState } from 'react';
import axios from 'axios';
import '../styles/LoginPage.css';
import { Link, Navigate } from 'react-router-dom';
import exitIcon from '../assets/exit.svg';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../App';

function Login() {
    const navigate = useNavigate();
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
        const { data, error } = await supabase.auth.signUp({
            email: formData.email,
            password: formData.password,
            options: {
                data: {
                    full_name: formData.fullName,
                },
            },
        });

        if (error) {
            alert("Sign up failed: " + error.message);
        } else {
            alert("Sign up successful! Please check your email to confirm your account.");
            navigate('/');
        }
    }


    const handleLogin = async (e) => {
        e.preventDefault();
        const { data, error } = await supabase.auth.signInWithPassword({
            email: formData.email,
            password: formData.password,
        });
        if (error) {
            alert("Login failed: " + error.message);
        } else {
            alert("Login successful!");
            navigate('/');
        }
    };

    const handleEdit = (e, field) =>{
        setFormData({ ...formData, [field]: e.target.value });
    }

    return (
        <div className="container">
            <div className="exit-button">
                <Link to="/">
                    <button type="button" className="exit-btn">
                        <img src={exitIcon} alt="Exit" />
                    </button>
                </Link>
            </div>
            <div className="form-container">
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

                    {isLogin && <div style={{ textAlign: 'right' }}>
                        <div className="forgot-password" onClick={() => navigate('/forgot-password')}>Forgot Password?</div>
                    </div>}

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