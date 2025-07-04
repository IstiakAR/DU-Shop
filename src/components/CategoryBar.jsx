import '../styles/CategoryBar.css';
import cancelIcon from '../assets/cancel.svg';
import sidebarIcon from '../assets/sidebar.svg';
import { useState, useRef, useEffect } from 'react';

function CategoryBar() {
    const [isOpen, setIsOpen] = useState(false);
    const iconRef = useRef(null);
    const [barTop, setBarTop] = useState(0);
    const [barLeft, setBarLeft] = useState(0);

    const departments = [
        "Appliances",
        "TV & Home Theater",
        "Computers & Tablets",
        "Cell Phones",
        "Audio & Headphones",
        "Video Games",
        "Cameras, Camcorders & Drones",
        "Home, Furniture & Office",
        "Smart Home, Security & Wi-Fi",
        "Car Electronics & GPS",
        "Wearable Technology",
        "Health, Wellness & Fitness"
    ];

    return (
        <div className="sidebar-icon-container" 
        style={{ position: 'relative', display: 'inline-block' }}>
            <img
                ref={iconRef}
                src={isOpen ? cancelIcon : sidebarIcon}
                alt="Sidebar"
                className='sidebar-icon'
                onClick={() => setIsOpen((open) => !open)}
                style={{ zIndex: 2001 }}
            />
            {isOpen && (
                <>
                    <div className="sidebar-backdrop" onClick={() => setIsOpen(false)} />
                    <div className="sidebar-container">
                        <div className="sidebar-section">
                            {departments.map((dept) => (
                                <div className="sidebar-link" key={dept}>
                                    {dept}
                                    <span className="sidebar-arrow">{'>'}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default CategoryBar;
