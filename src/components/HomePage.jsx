import '../styles/HomePage.css';

function HomePage() {
    return (
        <div>
            <div className="first-part">
                <h1>Your Campus. Your Marketplace.</h1>
                <div class="wrapper">
                    <div class="typing-text">
                        <span>Buy</span>
                        <span>Sell</span>
                        <span>Trade</span>
                    </div>
                </div>
                <button className='browse-button'>Browse</button>
            </div>
        </div>
    )
}

export default HomePage;