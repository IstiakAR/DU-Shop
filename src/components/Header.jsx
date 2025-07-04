import '../styles/Header.css';

import Cart from './Cart';

import { useState } from 'react';
import supabase from '../supabase';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

import cartIcon from '../assets/cart.svg';
import profileIcon from '../assets/profile.svg'

function Header({isLoggedIn=false}) {

    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [cart, setCart] = useState(false);
    const [searchText, setSearchText] = useState('');

    const handleEdit =(e) => {
        e.preventDefault();
        setSearchText(e.target.value);
    }
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
    };

    const handleCart = () => {
        setCart(!cart);
    }

    return (
        <div className="header">
            <div className='left-header'>
                <Link to="/">
                    <img src="/DU-Shop.png" alt="DU Shop Logo" className='du-logo'/>
                </Link>
                <h1 className='logo-text'>DU Shop</h1>
            </div>
            <div className='center-header'>
                <input type="text" placeholder='Search for products...' 
                className='search-input' onChange={handleEdit} value={searchText}/>
            </div>
            <div className='right-header'>
                {isLoggedIn ? (
                    <>
                    <img src={cartIcon} alt="Cart" className='cart-icon' 
                    style={{width: 45, height: 45}} onClick={handleCart}/>
                    <img src={profileIcon} alt="Profile" className='profile-icon' 
                    style={{width: 50, height: 50}} onClick={handleToggle}/>

                    {cart && (
                        <Cart handleCart={handleCart} />
                    )}

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
                        <button className='login-button yellow-button'>Login</button>
                    </Link>
                )}
            </div>
        </div>
    );
}

export default Header;