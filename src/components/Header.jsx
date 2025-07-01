import '../styles/Header.css';
import { Link } from 'react-router-dom';

function Header() {
    return (
        <div className="header">
            <div className='left-header'>
                <Link to="/">
                    <img src="/DU-Shop.png" alt="DU Shop Logo" className='du-logo'/>
                </Link>
                <h1 className='logo-text'>DU Shop</h1>
            </div>
            <div className='right-header'>
                <Link to="/login">
                    <button className='login-button'>Login</button>
                </Link>
            </div>
        </div>
    );
}

export default Header;