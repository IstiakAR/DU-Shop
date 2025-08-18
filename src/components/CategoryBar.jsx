import '../styles/CategoryBar.css';
import cancelIcon from '../assets/cancel.svg';
import sidebarIcon from '../assets/sidebar.svg';
import { useState, useRef, useEffect } from 'react';
import { fetchCategories, fetchSubcategories } from '../fetch';
import { useNavigate } from 'react-router-dom';

function CategoryBar() {
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState();
    const [isOpen, setIsOpen] = useState(false);
    const iconRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchCategories().then(setCategories).catch(console.error);
    }, []);

    useEffect(() => {
        if (!selectedCategory) {
            setSubcategories([]);
            return;
        }
        fetchSubcategories(selectedCategory)
            .then(setSubcategories)
            .catch(console.error);
    }, [selectedCategory]);

    const handleCategoryClick = (categoryId) => {
        setSelectedCategory(categoryId);
    };

    const handleSubcategoryClick = (subcategoryId) => {
        navigate(`/shop/${subcategoryId}`);
        setIsOpen(false);
    };

    const handleBack = () => {
        setSelectedCategory(null);
        setSubcategories([]);
    };

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
                            {!selectedCategory ? (
                                categories.map((dept) => (
                                    <div
                                        className="sidebar-link"
                                        key={dept.id}
                                        onClick={() => handleCategoryClick(dept.id)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        {dept.name}
                                        <span className="sidebar-arrow">{'>'}</span>
                                    </div>
                                ))
                            ) : (
                                <>
                                    <div
                                        className="sidebar-link"
                                        onClick={handleBack}
                                        style={{ cursor: 'pointer', fontWeight: 'bold' }}
                                    >
                                        {'< Back'}
                                    </div>
                                    {subcategories.map((sub) => (
                                        <div className="sidebar-link" key={sub.id}
                                        onClick={() => handleSubcategoryClick(sub.id)}>
                                            {sub.name}
                                        </div>
                                    ))}
                                </>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default CategoryBar;
