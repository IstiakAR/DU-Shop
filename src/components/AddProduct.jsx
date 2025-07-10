import '../styles/ItemDetails.css';
import '../styles/AddProduct.css';
import { useEffect, useState } from 'react';
import addImage from '../assets/addImage.svg'
import ReactMarkdown from 'react-markdown';
import { fetchCategories, fetchSubcategories } from '../fetch';

function AddProduct() {
    const [image, setImage] = useState([]);
    const [currentImage, setCurrentImage] = useState(null);
    const [details, setDetails] = useState('');
    const [specs, setSpecs] = useState('');
    const [currentContent, setCurrentContent] = useState('details');
    const [mode, setMode] = useState('edit');
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);

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

    const handleImagePick = (event) => {
        const file = event.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setImage((prevImages) => [...prevImages, url]);
            setCurrentImage(url);
        }
    };


    return(
        <div className='container'>
            <div className='top-part'>
                <div className='picture-container'>
                    <div className='picture-bar'>
                        <label style={{ cursor: 'pointer' }}>
                            <img src={addImage} alt="Add" />
                            <input type="file" accept="image/*" 
                            onChange={handleImagePick} style={{ display: 'none' }} />
                        </label>
                        {image.map((img, index) => (
                            <img key={index} src={img} className='thumbnail' 
                            onClick={() => setCurrentImage(img)} />
                        ))}
                    </div>
                    <div className='picture-area'>
                        <img src={currentImage} className='main-picture'/>
                    </div>
                </div>
                <div className="info-container">
                    <form className='info-form'>
                        <div className='info-select'>
                            <input type="text" placeholder="Product Name" className='name' required />
                            <input type="number" placeholder="Price" className='price' required />
                        </div>
                        <div className='info-select'>
                            <select required defaultValue="">
                                <option value="">
                                    Select Category
                                </option>
                                {categories.map((category) => (
                                    <option key={category.id} value={category.id}
                                    onClick={() => setSelectedCategory(category.id)}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                            <select required defaultValue="">
                                <option value="">
                                    Select Subcategory
                                </option>
                                {subcategories.map((subcategory) => (
                                    <option key={subcategory.id} value={subcategory.id}>
                                        {subcategory.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <textarea name="description" id="description" placeholder="Product Description" required></textarea>
                        <button type="submit" className='submit-btn'>Add Product</button>
                    </form>
                </div>
            </div>
            <div className='details-container'>
                <div className='tab-bar'>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button className={`edit-preview${mode === 'edit' ? ' active' : ''}`} onClick={() => setMode('edit')}>Edit</button>
                        <button className={`edit-preview${mode === 'preview' ? ' active' : ''}`} onClick={() => setMode('preview')}>Preview</button>
                    </div>
                    <span onClick={() => {setCurrentContent('details')}}>Details</span>
                    <span onClick={() => {setCurrentContent('specs')}}>Specs</span>
                </div>
                <div className='tab-content'>
                    {mode === 'edit' ? (
                        currentContent === 'details' ? (
                            <textarea name="details" id="details" placeholder="Product Details" value={details}
                            onChange={(e) => setDetails(e.target.value)} required></textarea>
                        ) : (
                            <textarea name="specs" id="specs" placeholder="Product Specs" value={specs}
                            onChange={(e) => setSpecs(e.target.value)} required></textarea>
                        )
                    ) : (
                        currentContent === 'details' ? (
                            <div className='markdown-preview'>
                                <ReactMarkdown>{details}</ReactMarkdown>
                            </div>
                        ) : (
                            <div className='markdown-preview'>
                                <ReactMarkdown>{specs}</ReactMarkdown>
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}

export default AddProduct;
