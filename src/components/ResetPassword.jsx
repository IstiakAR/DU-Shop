import '../styles/LoginPage.css';
import { useState, useEffect } from 'react';
import { supabase } from '../App';

function ResetPassword() {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (event === "PASSWORD_RECOVERY") {
                    console.log("Password recovery session detected.");
                }
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setMessage("Passwords do not match.");
            return;
        }
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) {
            setMessage("Error: " + error.message);
        } else {
            setMessage("Password reset successful! Redirecting to login...");
            setTimeout(() => {
                window.location.href = '/login';
            }, 1500);
        }
    };

    return (
        <div className="container">
        <form onSubmit={handleSubmit}>
            <div className="form-group">
                <label htmlFor="new-password">New Password:</label>
                <input type="password" id="new-password" name="new-password" required 
                onChange={(e) => setNewPassword(e.target.value)} />
            </div>
            <div className="form-group">
                <label htmlFor="confirm-password">Retype Password:</label>
                <input type="password" id="confirm-password" name="confirm-password" required 
                onChange={(e) => setConfirmPassword(e.target.value)} />
            </div>
            <button type="submit" className="submit-btn">Reset Password</button>
            {message && <p>{message}</p>}
        </form>
        </div>
    );
}

export default ResetPassword;