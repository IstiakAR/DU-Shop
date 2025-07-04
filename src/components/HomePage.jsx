import '../styles/HomePage.css';
import { Link } from "react-router-dom";

function HomePage() {
    return (
        <div>
            <div className="first-part">
                <h1>Your Campus. Your Marketplace.</h1>
                <div className="wrapper">
                    <div className="typing-text">
                        <span>Buy</span>
                        <span>Sell</span>
                        <span>Trade</span>
                    </div>
                </div>
                <Link to="/shop">
                    <button className='browse-button yellow-button'>Browse</button>
                </Link>
            </div>
        </div>
    )
}

export default HomePage;