import '../styles/Header.css';
import Cart from './Cart';
import CategoryBar from './CategoryBar';
import chatIcon from '../assets/chat.svg';
import cartIcon from '../assets/cart.svg';
import profileIcon from '../assets/profile.svg';
import { searchProducts } from './SeacrhingMethod';

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
    const handleKeyDown = async (e) => {
        if (e.key === 'Enter' && searchText.trim()) {
            const { data, error } = await supabase
                .from('product')
                .select('*')
                .eq('type', 'product');

            if (!error && data) {
                const searchResults = searchProducts(data, searchText);

                navigate('/shop', { 
                    state: { 
                        products: searchResults, 
                        searchTerm: searchText,
                        isSearch: true
                    } 
                });
            }
        }
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
    const handleChat = () => {
        if (isLoggedIn) {
            navigate('/messenger');
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
                className='search-product' onChange={handleEdit} value={searchText} onKeyDown={handleKeyDown}/>
            </div>
            <div className='right-header'>
                {isLoggedIn ? (
                    <>
                    <img src={chatIcon} alt="Chat" className='chat-icon' 
                        style={{width: 40, height: 40}} onClick={handleChat}/>
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