import '../styles/CategoryBar.css';
import cancelIcon from '../assets/cancel.svg';
import sidebarIcon from '../assets/sidebar.svg';
import { useState, useRef, useEffect } from 'react';
import supabase from '../supabase.jsx';

function CategoryBar() {
    console.log("CategoryBar mounted");
    const [categories, setCategories] = useState([]);
    useEffect(() => {
        console.log("supabase object:", supabase);
        const fetchCategories = async () => {
            console.log("Fetching categories...");
            const { data, error } = await supabase
                .from('category')
                .select('id, name');
            if (error) throw error;
            setCategories(data);
            console.log('Fetched categories:', data);
        };
        fetchCategories();
    }, []);
    const [isOpen, setIsOpen] = useState(false);
    const iconRef = useRef(null);
    const [barTop, setBarTop] = useState(0);
    const [barLeft, setBarLeft] = useState(0);

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
                            {categories.map((dept) => (
                                <div className="sidebar-link" key={dept.id}>
                                    {dept.name}
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
