import { Link } from 'react-router-dom';
import '../styles/LoginPage.css';
import exitIcon from '../assets/exit.svg';
import { useState } from 'react';
import supabase from '../supabase';
import { useEffect } from 'react';

function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [noError, setNoError] = useState(false);

    const handleEdit = (e) => {
        setEmail(e.target.value);
    }
    const handleSubmit = async () => {
        setNoError(true);
        const redirect = window.location.origin + '/reset-password';
        const { data, error } = await supabase.auth
        .resetPasswordForEmail(email, {redirectTo: redirect});
        if(error){
            setNoError(false);
        }
    }
    return(
        <div className="login-container">
            <div className="exit-button">
                <Link to="/">
                    <button type="button" className="exit-btn">
                        <img src={exitIcon} alt="Exit" />
                    </button>
                </Link>
            </div>
            {noError? (
                <div>Password reset email sent successfully!</div>
            ):
            <div className="form-container">
                <h2>Enter email to reset your password</h2>
                <div className="form-group">
                    <label htmlFor="email">Email:</label>
                    <input type="email" id="email" name="email" onChange={(e) => handleEdit(e)} required />
                </div>
                <button className="submit-btn" onClick={handleSubmit} disabled={noError}>Submit</button>
                <div className="toggle-form">
                    <p>Remember your password?{' '}
                        <Link to="/login">
                            <button className="toggle-btn">Login</button>
                        </Link>
                    </p>
                </div>
            </div>
            }
        </div>
    )
}
export default ForgotPassword;