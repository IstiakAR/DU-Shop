import '../styles/ItemDetails.css';
import '../styles/AddProduct.css';
import { useEffect, useState } from 'react';
import addImage from '../assets/addImage.svg'
import ReactMarkdown from 'react-markdown';
import { fetchCategories, fetchSubcategories, getUserID } from '../fetch';
import supabase from '../supabase';

function AddProduct() {
    const [image, setImage] = useState([]);
    const [imageFiles, setImageFiles] = useState([]);
    const [currentImage, setCurrentImage] = useState(null);
    const [currentContent, setCurrentContent] = useState('details');
    const [draggedIndex, setDraggedIndex] = useState(null);
    const [dragOverIndex, setDragOverIndex] = useState(null);

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
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            if (!validTypes.includes(file.type)) {
                alert('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
                return;
            }
            const maxSize = 10 * 1024 * 1024;
            if (file.size > maxSize) {
                alert('File size must be less than 10MB');
                return;
            }
            
            console.log('Adding image file:', file.name, 'Type:', file.type, 'Size:', file.size);
            
            const url = URL.createObjectURL(file);
            setImage((prevImages) => [...prevImages, url]);
            setImageFiles((prevFiles) => [...prevFiles, file]);
            setCurrentImage(url);
        }
    };

    const handleImageDelete = (indexToDelete) => {
        setImage((prevImages) => {
            const newImages = prevImages.filter((_, index) => index !== indexToDelete);
            if (currentImage === prevImages[indexToDelete]) {
                if (newImages.length > 0) {
                    const newCurrentIndex = indexToDelete > 0 ? indexToDelete - 1 : 0;
                    setCurrentImage(newImages[newCurrentIndex] || null);
                } else {
                    setCurrentImage(null);
                }
            }
            return newImages;
        });
        setImageFiles((prevFiles) => {
            return prevFiles.filter((_, index) => index !== indexToDelete);
        });
    };

    const moveImage = (fromIndex, toIndex) => {
        if (fromIndex === toIndex) return;
        
        setImage((prevImages) => {
            const newImages = [...prevImages];
            const movedImage = newImages[fromIndex];
            newImages.splice(fromIndex, 1);
            newImages.splice(toIndex, 0, movedImage);
            
            return newImages;
        });
        setImageFiles((prevFiles) => {
            const newFiles = [...prevFiles];
            const movedFile = newFiles[fromIndex];
            newFiles.splice(fromIndex, 1);
            newFiles.splice(toIndex, 0, movedFile);
            
            return newFiles;
        });
    };

    const uploadImageToSupabase = async (file, productId, position) => {
        try {
            console.log(`Uploading image ${position} for product ${productId}`, file);
            
            const fileExt = file.name.split('.').pop();
            const timestamp = Date.now();
            const fileName = `${productId}_${position}_${timestamp}.${fileExt}`;
            const filePath = fileName;

            console.log(`Uploading to path: ${filePath}`);

            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('product-image')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: true
                });

            if (uploadError) {
                console.error('Storage upload error:', uploadError);
                throw uploadError;
            }

            console.log('Upload successful:', uploadData);

            const { data: dbData, error: dbError } = await supabase
                .from('product_image')
                .insert({
                    id: productId,
                    filepath: filePath,
                    position: position
                });

            if (dbError) {
                console.error('Database insert error:', dbError);
                await supabase.storage
                    .from('product-image')
                    .remove([filePath]);
                throw dbError;
            }

            console.log('Database insert successful:', dbData);
            return { success: true, filepath: filePath };
        } catch (error) {
            console.error('Error uploading image:', error);
            return { success: false, error: error.message || error };
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
        try {
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

            if (productError) {
                throw productError;
            }

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

            if (detailsError) {
                throw detailsError;
            }

            if (imageFiles.length > 0) {
                console.log(`Starting upload of ${imageFiles.length} images for product ${data[0].id}`);
                
                const uploadPromises = imageFiles.map((file, index) => {
                    console.log(`Preparing upload for image ${index + 1}:`, file.name);
                    return uploadImageToSupabase(file, data[0].id, index + 1);
                });
                
                const uploadResults = await Promise.all(uploadPromises);
                console.log('All upload results:', uploadResults);
                
                const failedUploads = uploadResults.filter(result => !result.success);
                const successfulUploads = uploadResults.filter(result => result.success);
                
                if (failedUploads.length > 0) {
                    console.error('Failed uploads:', failedUploads);
                    const errorMessages = failedUploads.map((result, index) => 
                        `Image ${index + 1}: ${result.error}`
                    ).join('\n');
                    
                    alert(`Product created successfully!\nSuccessful uploads: ${successfulUploads.length}/${imageFiles.length}\n\nFailed uploads:\n${errorMessages}`);
                    return;
                } else {
                    console.log('All images uploaded successfully');
                }
            }

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
            setImage([]);
            setImageFiles([]);
            setCurrentImage(null);
            
            alert('Product added successfully!');
            
        } catch (error) {
            console.error('Error creating product:', error);
            alert('Error creating product. Please try again.');
        } finally {
            setDisable(false);
        }
    };


    return(
        <div className='add-product-container'>
            <div className='add-product-top'>
                <div className='picture-container'>
                    <div className='picture-bar'>
                        <div className='add-image-section'>
                            <label style={{ cursor: 'pointer' }}>
                                <img src={addImage} alt="Add" />
                                <input type="file" accept="image/*" 
                                onChange={handleImagePick} style={{ display: 'none' }} />
                            </label>
                        </div>
                        <div className='thumbnails-container'>
                            {image.map((img, index) => (
                            <div key={index} 
                                className={`thumbnail-container ${draggedIndex === index ? 'dragging' : ''} ${dragOverIndex === index && draggedIndex !== index ? 'drag-over' : ''}`}
                                draggable
                                onDragStart={(e) => {
                                    e.dataTransfer.setData('text/plain', index.toString());
                                    e.dataTransfer.effectAllowed = 'move';
                                    setDraggedIndex(index);
                                }}
                                onDragEnd={() => {
                                    setDraggedIndex(null);
                                    setDragOverIndex(null);
                                }}
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    e.dataTransfer.dropEffect = 'move';
                                    if (draggedIndex !== index) {
                                        setDragOverIndex(index);
                                    }
                                }}
                                onDragEnter={(e) => {
                                    e.preventDefault();
                                    if (draggedIndex !== index) {
                                        setDragOverIndex(index);
                                    }
                                }}
                                onDragLeave={(e) => {
                                    e.preventDefault();
                                    if (!e.currentTarget.contains(e.relatedTarget)) {
                                        setDragOverIndex(null);
                                    }
                                }}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
                                    if (fromIndex !== index && !isNaN(fromIndex) && fromIndex >= 0 && fromIndex < image.length) {
                                        moveImage(fromIndex, index);
                                    }
                                    setDraggedIndex(null);
                                    setDragOverIndex(null);
                                }}
                            >
                                <img 
                                    src={img} 
                                    className={`thumbnail ${currentImage === img ? 'active' : ''}`}
                                    onClick={() => setCurrentImage(img)} 
                                    alt={`Product image ${index + 1}`}
                                    draggable={false}
                                />
                                <button 
                                    className='delete-thumbnail-btn'
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleImageDelete(index);
                                    }}
                                    title="Delete image"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                        </div>
                    </div>
                    <div className='picture-area'>
                        <img src={currentImage} className='main-picture'/>
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
                        <span 
                            onClick={() => {setCurrentContent('details')}} 
                            className={currentContent === 'details' ? 'active' : ''}
                        >
                            Details
                        </span>
                        <span 
                            onClick={() => {setCurrentContent('specs')}} 
                            className={currentContent === 'specs' ? 'active' : ''}
                        >
                            Specs
                        </span>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' , marginBottom: '10px'}}>
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
