import '../styles/ItemDetails.css';
import '../styles/AddProduct.css';
import { useEffect, useState } from 'react';
import addImage from '../assets/addImage.svg'
import ReactMarkdown from 'react-markdown';
import { fetchCategories, fetchSubcategories, getUserID } from '../fetch';
import supabase from '../supabase';

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
    const [selectedSubcategory, setSelectedSubcategory] = useState(null);
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [stock, setStock] = useState('');
    const [description, setDescription] = useState('');

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

    const handleSubmit = async (event) => {
        event.preventDefault();
        
        try {
            const userId = await getUserID();
            
            // First insert into product table
            const { data: productData, error: productError } = await supabase
                .from('product') 
                .insert([
                    { 
                        name, 
                        price: parseInt(price), 
                        stock: parseInt(stock), 
                        sub_id: selectedSubcategory,  // Changed from subcategory to sub_id
                        type: 'regular',  // Added required type field
                        seller_id: userId  // Changed from user_id to seller_id
                    }
                ])
                .select();

            if (productError) {
                console.error('Product insert error:', productError);
                alert('Failed to add product');
                return;
            }

            // Then insert into product_details table using product id as primary key
            const { data: detailsData, error: detailsError } = await supabase
                .from('product_details') 
                .insert([
                    { 
                        id: productData[0].id,  // Use product id as primary key
                        description,
                        detail: details,  // Changed from details to detail
                        specs
                    }
                ]);

            if (detailsError) {
                console.error('Product details insert error:', detailsError);
                alert('Failed to add product details');
                return;
            }

            console.log('Product added successfully:', productData[0]);
            alert('Product added successfully!');
            
            // Reset form
            setName('');
            setPrice('');
            setStock('');
            setDescription('');
            setDetails('');
            setSpecs('');
            setImage([]);
            setCurrentImage(null);
            setSelectedCategory(null);
            setSelectedSubcategory(null);
            
        } catch (error) {
            console.error('Unexpected error:', error);
            alert('An unexpected error occurred');
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
                            <input type="text" placeholder="Product Name" className='name' required 
                            onChange={(e) => setName(e.target.value)} />
                            <input type="number" placeholder="Price" className='price' required 
                            onChange={(e) => setPrice(e.target.value)} />
                            <input type="number" placeholder="Stock" className='stock' required 
                            onChange={(e) => setStock(e.target.value)} />
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
                                    <option key={subcategory.id} value={subcategory.id}
                                    onClick={() => setSelectedSubcategory(subcategory.id)}>
                                        {subcategory.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <textarea name="description" id="description" placeholder="Product Description" required
                        onChange={(e) => setDescription(e.target.value)}></textarea>
                        <button type="submit" className='submit-btn' onClick={handleSubmit}>Add Product</button>
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
