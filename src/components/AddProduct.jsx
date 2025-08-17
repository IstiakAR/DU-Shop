import '../styles/ItemDetails.css';
import '../styles/AddProduct.css';
import { useEffect, useState } from 'react';
import addImage from '../assets/addImage.svg'
import deleteImage from '../assets/deleteImage.svg';
import ReactMarkdown from 'react-markdown';
import { fetchCategories, fetchSubcategories, getUserID } from '../fetch';
import supabase from '../supabase';

function AddProduct() {
    const [image, setImage] = useState([]);
    const [currentImage, setCurrentImage] = useState(null);
    const [currentContent, setCurrentContent] = useState('details');

    const [mode, setMode] = useState('edit');
    const [disable, setDisable] = useState(false);

    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedSubcategory, setSelectedSubcategory] = useState(null);

    const [productData, setProductData] = useState({
        name: '',
        price: '',
        stock: '',
        subcategory: ''
    });
    const [productDesc, setProductDesc] = useState({
        description: '',
        details: '',
        specs: ''
    });

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
    const infoSelect = (categories) => {
        const isSubcategory = categories === subcategories;
        return (
            <select 
                required 
                value={isSubcategory ? selectedSubcategory || '' : selectedCategory || ''}
                onChange={(e) => {
                    const value = e.target.value || null;
                    if (isSubcategory) {
                        setSelectedSubcategory(value);
                    } else {
                        setSelectedCategory(value);
                        setSelectedSubcategory(null);
                    }
                }}
            >
                <option value="">
                    Select {isSubcategory ? 'Subcategory' : 'Category'}
                </option>
                {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                        {category.name}
                    </option>
                ))}
            </select>
        )
    }
    const handleSubmit = async (event) => {
        event.preventDefault();
        setDisable(true);
        const userId = await getUserID();

        const { data: data, error: productError } = await supabase
            .from('product')
            .insert([
                { 
                    name: productData.name,
                    price: parseInt(productData.price), 
                    stock: parseInt(productData.stock), 
                    sub_id: selectedSubcategory,
                    type: 'product',
                    seller_id: userId
                }
            ])
            .select();

        const { data: detailsData, error: detailsError } = await supabase
            .from('product_details') 
            .insert([
                { 
                    id: data[0].id,
                    description: productDesc.description,
                    detail: productDesc.details,
                    specs: productDesc.specs
                }
            ]);
        if (!productError && !detailsError) {
            setProductData({
                name: '',
                price: '',
                stock: '',
                subcategory: ''
            });
            setProductDesc({
                description: '',
                details: '',
                specs: ''
            });
            setSelectedCategory(null);
            setSelectedSubcategory(null);
        }
        setDisable(false);
    };


    return(
        <div className='add-product-container'>
            <div className='add-product-top'>
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
                    <div className='delete-picture'>
                        <img src={deleteImage} alt="Delete" />
                    </div>
                </div>
                <div className="add-info-container">
                    <form className='info-form'>
                        <div className='info-select'>
                            <input type="text" placeholder="Product Name" className='name' required value={productData.name}
                            onChange={(e) => setProductData({ ...productData, name: e.target.value })} />
                            <input type="number" placeholder="Price" className='price' required value={productData.price}
                            onChange={(e) => setProductData({ ...productData, price: e.target.value })} />
                            <input type="number" placeholder="Stock" className='stock' required value={productData.stock}
                            onChange={(e) => setProductData({ ...productData, stock: e.target.value })} />
                        </div>
                        <div className='info-select'>
                            {infoSelect(categories)}
                            {infoSelect(subcategories)}
                        </div>
                        <textarea name="description" id="description" placeholder="Product Description" required value={productDesc.description}
                        onChange={(e) => setProductDesc({ ...productDesc, description: e.target.value })}></textarea>
                        <button type="submit" className='submit-btn' onClick={handleSubmit} disabled={disable}>Add Product</button>
                    </form>
                </div>
            </div>
            <div className='add-product-details'>
                <div className='details-bar' style={{display: 'flex', justifyContent: 'space-between'}}>
                    <div className='details-bar-side'>
                        <span onClick={() => {setCurrentContent('details')}}>Details</span>
                        <span onClick={() => {setCurrentContent('specs')}}>Specs</span>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button className={`edit-preview${mode === 'edit' ? ' active' : ''}`} 
                        onClick={() => setMode('edit')}>Edit</button>
                        <button className={`edit-preview${mode === 'preview' ? ' active' : ''}`} 
                        onClick={() => setMode('preview')}>Preview</button>
                    </div>
                </div>
                <div className='details-content'>
                    {mode === 'edit' ? (
                        currentContent === 'details' ? (
                            <textarea name="details" id="details" placeholder="Product Details" value={productDesc.details}
                            onChange={(e) => setProductDesc({ ...productDesc, details: e.target.value })} required></textarea>
                        ) : (
                            <textarea name="specs" id="specs" placeholder="Product Specs" value={productDesc.specs}
                            onChange={(e) => setProductDesc({ ...productDesc, specs: e.target.value })} required></textarea>
                        )
                    ) : (
                        currentContent === 'details' ? (
                            <div className='markdown-preview'>
                                <ReactMarkdown>{productDesc.details}</ReactMarkdown>
                            </div>
                        ) : (
                            <div className='markdown-preview'>
                                <ReactMarkdown>{productDesc.specs}</ReactMarkdown>
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}

export default AddProduct;
