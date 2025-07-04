import '../styles/Shop.css';
import {useState} from 'react';

import closeIcon from '../assets/exit.svg';
import sidebarIcon from '../assets/sidebar.svg';

function Shop(){
    const [isOpen, setIsOpen] = useState(false);
    return(
        <div>
            <img src={sidebarIcon} alt="Sidebar" className='sidebar-icon' onClick={() => setIsOpen(!isOpen)} />
            {isOpen && (
            <div className="sidebar-container">
                <div className='close-button'>
                    <button className='close-btn' onClick={() => setIsOpen(false)}>
                        <img src={closeIcon} alt="Close Cart" style={{width: 30, height: 30}} />
                    </button>
                </div>
                <ul>
                    <li>Detergent</li>
                    <li>Books</li>
                    <li>Utensils</li>
                </ul>
            </div>
            )}
        </div>
    )
}

export default Shop;
