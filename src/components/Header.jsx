import '../styles/Header.css';

function Header() {
    return (
        <div className="header">
            <div className='left-header'>
                <img src="/DU-Shop.png" alt="DU Shop Logo" />
                <h1>DU Shop</h1>
            </div>
            <div className='right-header'>
                <button>Login</button>
                <button>Sign Up</button>
            </div>
        </div>
    );
}

export default Header;