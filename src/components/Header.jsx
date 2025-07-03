import '../styles/Header.css';
import { Link } from 'react-router-dom';
import profileIcon from '../assets/profile.svg'
import { useRef, useState } from 'react';
import { supabase } from '../App';
import { useNavigate } from 'react-router-dom';

function Header({isLoggedIn=false}) {

    const navigate = useNavigate();
    const [open, setOpen] = useState(false);

    const handleClose = () => {
        setOpen(false);
    };
    const handleToggle = () => {
        setOpen(!open);
    };

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if(!error){
            navigate('/');
        }
    }

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
                    <>
                    <img src={profileIcon} alt="Profile" className='profile-icon' 
                    style={{width: 50, height: 50}} onClick={handleToggle}/>

                    {open && (
                        <div className='profile-dropdown-container'>
                            <div className='profile-dropdown'>
                                <button id="dropdown-button" onClick={() => navigate('/profile')}>View Profile</button>
                                <button id="dropdown-button">Settings</button>
                                <button id="dropdown-button" onClick={handleLogout}>Logout</button>
                            </div>
                        </div>
                    )}
                    </>
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