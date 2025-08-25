import React from 'react';
import '../styles/ItemDetails.css';
import '../styles/AddProduct.css';
import ReactMarkdown from 'react-markdown';
import { useProductForm } from './ProductUtils';
import ImageManager from './ImageManager';

function AddProduct() {
    const {
        // State
        isUpdateMode,
        loading,
        disable,
        currentContent,
        setCurrentContent,
        mode,
        setMode,
        
        // Form data
        productData,
        setProductData,
        productDesc,
        setProductDesc,
        
        // Categories
        categories,
        subcategories,
        selectedCategory,
        setSelectedCategory,
        selectedSubcategory,
        setSelectedSubcategory,
        
        // Images
        image,
        setImage,
        imageFiles,
        setImageFiles,
        existingImages,
        setExistingImages,
        imagesToDelete,
        setImagesToDelete,
        currentImage,
        setCurrentImage,
        
        // Drag & Drop
        draggedIndex,
        setDraggedIndex,
        dragOverIndex,
        setDragOverIndex,
        
        // Methods
        handleSubmit
    } = useProductForm();

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
        );
    };

    if (loading) {
        return (
            <div className='add-product-container'>
                <div style={{ textAlign: 'center', padding: '50px' }}>
                    <h2>Loading product data...</h2>
                </div>
            </div>
        );
    }

    return (
        <div className='add-product-container'>
            <div className='add-product-top'>
                <ImageManager
                    image={image}
                    currentImage={currentImage}
                    setCurrentImage={setCurrentImage}
                    imageFiles={imageFiles}
                    setImageFiles={setImageFiles}
                    setImage={setImage}
                    existingImages={existingImages}
                    setExistingImages={setExistingImages}
                    imagesToDelete={imagesToDelete}
                    setImagesToDelete={setImagesToDelete}
                    draggedIndex={draggedIndex}
                    setDraggedIndex={setDraggedIndex}
                    dragOverIndex={dragOverIndex}
                    setDragOverIndex={setDragOverIndex}
                />
                
                <div className="add-info-container">
                    <form className='info-form'>
                        <div className='info-select'>
                            <input 
                                type="text" 
                                placeholder="Product Name" 
                                className='name' 
                                required 
                                value={productData.name}
                                onChange={(e) => setProductData({ ...productData, name: e.target.value })} 
                            />
                            <input 
                                type="number" 
                                placeholder="Price" 
                                className='price' 
                                required 
                                value={productData.price}
                                onChange={(e) => setProductData({ ...productData, price: e.target.value })} 
                            />
                            <input 
                                type="number" 
                                placeholder="Stock" 
                                className='stock' 
                                required 
                                value={productData.stock}
                                onChange={(e) => setProductData({ ...productData, stock: e.target.value })} 
                            />
                        </div>
                        <div className='info-select'>
                            {infoSelect(categories)}
                            {infoSelect(subcategories)}
                        </div>
                        <textarea 
                            name="description" 
                            placeholder="Product Description" 
                            required 
                            value={productDesc.description}
                            onChange={(e) => setProductDesc({ ...productDesc, description: e.target.value })}
                        />
                        <button 
                            type="submit" 
                            className='submit-btn' 
                            onClick={handleSubmit} 
                            disabled={disable || loading}
                        >
                            {loading ? 'Loading...' : isUpdateMode ? 'Update Product' : 'Add Product'}
                        </button>
                    </form>
                </div>
            </div>
            
            <div className='add-product-details'>
                <div className='details-bar' style={{display: 'flex', justifyContent: 'space-between'}}>
                    <div className='details-bar-side'>
                        <span 
                            onClick={() => setCurrentContent('details')} 
                            className={currentContent === 'details' ? 'active' : ''}
                        >
                            Details
                        </span>
                        <span 
                            onClick={() => setCurrentContent('specs')} 
                            className={currentContent === 'specs' ? 'active' : ''}
                        >
                            Specs
                        </span>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                        <button 
                            className={`edit-preview${mode === 'edit' ? ' active' : ''}`} 
                            onClick={() => setMode('edit')}
                        >
                            Edit
                        </button>
                        <button 
                            className={`edit-preview${mode === 'preview' ? ' active' : ''}`} 
                            onClick={() => setMode('preview')}
                        >
                            Preview
                        </button>
                    </div>
                </div>
                <div className='details-content'>
                    {mode === 'edit' ? (
                        currentContent === 'details' ? (
                            <textarea 
                                name="details" 
                                placeholder="Product Details" 
                                value={productDesc.details}
                                onChange={(e) => setProductDesc({ ...productDesc, details: e.target.value })} 
                                required
                            />
                        ) : (
                            <textarea 
                                name="specs" 
                                placeholder="Product Specs" 
                                value={productDesc.specs}
                                onChange={(e) => setProductDesc({ ...productDesc, specs: e.target.value })} 
                                required
                            />
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
