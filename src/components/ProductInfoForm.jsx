const ProductInfoForm = ({
    productData,
    setProductData,
    productDesc,
    setProductDesc,
    categories,
    subcategories,
    selectedCategory,
    setSelectedCategory,
    selectedSubcategory,
    setSelectedSubcategory,
    handleSubmit,
    disable,
    loading,
    isUpdateMode
}) => {

    const CategorySelect = ({ items, value, onChange, placeholder }) => (
        <select 
            required 
            value={value || ''}
            onChange={(e) => onChange(e.target.value || null)}
        >
            <option value="">{placeholder}</option>
            {items.map((item) => (
                <option key={item.id} value={item.id}>
                    {item.name}
                </option>
            ))}
        </select>
    );

    const handleCategoryChange = (value) => {
        setSelectedCategory(value);
        setSelectedSubcategory(null);
    };

    return (
        <div className="add-info-container">
            <form className='info-form' onSubmit={handleSubmit}>
                <div className='info-select'>
                    <input 
                        type="text" 
                        placeholder="Product Name" 
                        className='name' 
                        required 
                        value={productData.name}
                        onChange={(e) => setProductData(prev => ({ ...prev, name: e.target.value }))}
                    />
                    <input 
                        type="number" 
                        placeholder="Price" 
                        className='price' 
                        required 
                        value={productData.price}
                        onChange={(e) => setProductData(prev => ({ ...prev, price: e.target.value }))}
                    />
                    <input 
                        type="number" 
                        placeholder="Stock" 
                        className='stock' 
                        required 
                        value={productData.stock}
                        onChange={(e) => setProductData(prev => ({ ...prev, stock: e.target.value }))}
                    />
                </div>
                
                <div className='info-select'>
                    <CategorySelect
                        items={categories}
                        value={selectedCategory}
                        onChange={handleCategoryChange}
                        placeholder="Select Category"
                    />
                    <CategorySelect
                        items={subcategories}
                        value={selectedSubcategory}
                        onChange={setSelectedSubcategory}
                        placeholder="Select Subcategory"
                    />
                </div>
                
                <textarea 
                    name="description" 
                    placeholder="Product Description" 
                    required 
                    value={productDesc.description}
                    onChange={(e) => setProductDesc(prev => ({ ...prev, description: e.target.value }))}
                />
                
                <button 
                    type="submit" 
                    className='submit-btn' 
                    disabled={disable || loading}
                >
                    {loading ? 'Loading...' : isUpdateMode ? 'Update Product' : 'Add Product'}
                </button>
            </form>
        </div>
    );
};

export default ProductInfoForm;
