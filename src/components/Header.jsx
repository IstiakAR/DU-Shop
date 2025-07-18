import '../styles/Header.css';
import Cart from './Cart';
import CategoryBar from './CategoryBar';
import addIcon from '../assets/add.svg';
import cartIcon from '../assets/cart.svg';
import profileIcon from '../assets/profile.svg'

import { useState, useEffect, useRef } from 'react';
import supabase from '../supabase';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

function Header({isLoggedIn=false}) {

    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [cart, setCart] = useState(false);
    const [searchText, setSearchText] = useState('');

    const dropdownRef = useRef(null);

    useEffect(() => {
        if (!open) return;

        function handleClickOutside(event) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target) &&
                event.target.className !== 'profile-icon'
            ) {
                setOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [open]);

    const handleEdit =(e) => {
        e.preventDefault();
        setSearchText(e.target.value);
    }
    const handleClose = () => {
        setOpen(false);
    };
    const handleToggle = () => {
        setOpen(!open);
        if (cart) setCart(false);
    };

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if(!error){
            navigate('/');
        }
    };

    const handleCart = () => {
        setCart(!cart);
        if (open) setOpen(false);
    }
    const handleAdd = () => {
        if (isLoggedIn) {
            navigate('/add-product');
        }
    };

    return (
        <div className="header">
            <div className='left-header'>
                <Link to="/">
                    <img src="/DU-Shop.png" alt="DU Shop Logo" className='du-logo'/>
                </Link>
                <h1 className='logo-text'>DU Shop</h1>
            </div>
            <div className='center-header'>
                <CategoryBar />
                <input type="text" placeholder='Search for products...' 
                className='search-input' onChange={handleEdit} value={searchText}/>
            </div>
            <div className='right-header'>
                {isLoggedIn ? (
                    <>
                    <img src={addIcon} alt="Add" className='add-icon' 
                        style={{width: 45, height: 45}} onClick={handleAdd}/>
                    <img src={cartIcon} alt="Cart" className='cart-icon' 
                        style={{width: 45, height: 45}} onClick={handleCart}/>
                    <img src={profileIcon} alt="Profile" className='profile-icon' 
                        style={{width: 50, height: 50}} onClick={handleToggle}/>

                    {cart && (
                        <Cart handleCart={handleCart} />
                    )}

                    {open && (
                        <div className='profile-dropdown-container' ref={dropdownRef}>
                            <div className='profile-dropdown'>
                                <button id="dropdown-button" onClick={() => {navigate('/profile');
                                     setOpen(false);}}>View Profile</button>
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