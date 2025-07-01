import '../styles/Header.css';
import { Link } from 'react-router-dom';
import { supabase } from '../App';
import { useEffect, useState } from 'react';

function Header() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const checkSession = async () => {
            const { data } = await supabase.auth.getSession();
            setIsLoggedIn(data.session !== null);
        };
        checkSession();

        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            setIsLoggedIn(session !== null);
        });

        return () => {
            listener.subscription.unsubscribe();
        };
    }, []);

    return (
        <div className="header">
            <div className='left-header'>
                <Link to="/">
                    <img src="/DU-Shop.png" alt="DU Shop Logo" className='du-logo'/>
                </Link>
                <h1 className='logo-text'>DU Shop</h1>
            </div>
            <div className='right-header'>
                {isLoggedIn ? (
                    <Link to="/profile">
                        <button className='profile-button'>Profile</button>
                    </Link>
                ) : (
                    <Link to="/login">
                        <button className='login-button'>Login</button>
                    </Link>
                )}
            </div>
        </div>
    );
}

export default Header;