import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchCategories, fetchSubcategories, getUserID } from '../fetch';
import supabase from '../supabase';

// Image service functions
export const uploadImageToSupabase = async (file, productId, position) => {
    try {
        console.log(`Uploading image ${position} for product ${productId}`, file);
        
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            throw new Error('User not authenticated for image upload');
        }
        
        const fileExt = file.name.split('.').pop();
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(2, 15);
        const fileName = `${productId}_${position}_${timestamp}_${randomId}.${fileExt}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('product-image')
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (uploadError) {
            if (uploadError.message?.includes('already exists') || uploadError.statusCode === '409') {
                const newRandomId = Math.random().toString(36).substring(2, 15);
                const newFileName = `${productId}_${position}_${timestamp}_${newRandomId}.${fileExt}`;
                
                const { data: retryData, error: retryError } = await supabase.storage
                    .from('product-image')
                    .upload(newFileName, file, {
                        cacheControl: '3600',
                        upsert: false
                    });
                
                if (retryError) {
                    throw new Error(`Storage upload failed: ${retryError.message}`);
                }
                
                const { error: dbError } = await supabase
                    .from('product_image')
                    .insert({
                        id: productId,
                        filepath: newFileName,
                        position: position
                    });

                if (dbError) {
                    await supabase.storage.from('product-image').remove([newFileName]);
                    throw new Error(`Database insert failed: ${dbError.message}`);
                }
                
                return { success: true, filepath: newFileName };
            } else {
                throw new Error(`Storage upload failed: ${uploadError.message}`);
            }
        }

        const { error: dbError } = await supabase
            .from('product_image')
            .insert({
                id: productId,
                filepath: fileName,
                position: position
            });

        if (dbError) {
            await supabase.storage.from('product-image').remove([fileName]);
            throw new Error(`Database insert failed: ${dbError.message}`);
        }

        return { success: true, filepath: fileName };
    } catch (error) {
        console.error('Error uploading image:', error);
        return { success: false, error: error.message };
    }
};

export const deleteImagesFromStorage = async (imagePaths) => {
    if (!imagePaths || imagePaths.length === 0) return;
    
    try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            console.error('User not authenticated for storage deletion');
            return;
        }
        
        const { error } = await supabase.storage
            .from('product-image')
            .remove(imagePaths);
            
        if (error) {
            console.error('Error deleting images from storage:', error);
        }
    } catch (error) {
        console.error('Error deleting images from storage:', error);
    }
};

// Product service functions
export const createProduct = async (productData, productDesc, selectedSubcategory, imageFiles, userId) => {
    const { data, error: productError } = await supabase
        .from('product')
        .insert([
            { 
                name: productData.name,
                price: parseInt(productData.price), 
                stock: parseInt(productData.stock), 
                sub_id: selectedSubcategory,
                type: 'product',
                seller_id: userId,
                status: 'pending' // Set default status to pending for new products
            }
        ])
        .select();

    if (productError) throw productError;

    const { error: detailsError } = await supabase
        .from('product_details') 
        .insert([
            { 
                id: data[0].id,
                description: productDesc.description,
                detail: productDesc.details,
                specs: productDesc.specs
            }
        ]);

    if (detailsError) throw detailsError;

    if (imageFiles.length > 0) {
        const uploadPromises = imageFiles.map((file, index) => 
            uploadImageToSupabase(file, data[0].id, index + 1)
        );
        
        const uploadResults = await Promise.all(uploadPromises);
        const failedUploads = uploadResults.filter(result => !result.success);
        
        if (failedUploads.length > 0) {
            const errorMessages = failedUploads.map((result, index) => 
                `Image ${index + 1}: ${result.error}`
            ).join('\n');
            
            throw new Error(`Some images failed to upload:\n${errorMessages}`);
        }
    }

    return data[0].id;
};

export const updateProduct = async (productId, productData, productDesc, selectedSubcategory, imageFiles, imagesToDelete, existingImages, userId) => {
    // Update product basic info
    const { error: productError } = await supabase
        .from('product')
        .update({
            name: productData.name,
            price: parseInt(productData.price),
            stock: parseInt(productData.stock),
            sub_id: selectedSubcategory,
        })
        .eq('id', productId);
        
    if (productError) throw productError;
    
    // Update product details
    const { error: detailsError } = await supabase
        .from('product_details')
        .update({
            description: productDesc.description,
            detail: productDesc.details,
            specs: productDesc.specs
        })
        .eq('id', productId);
        
    if (detailsError) throw detailsError;
    
    // Delete marked images
    if (imagesToDelete.length > 0) {
        const imageIds = imagesToDelete.map(img => img.filepath);
        const { error: dbDeleteError } = await supabase
            .from('product_image')
            .delete()
            .eq('id', productId)
            .in('filepath', imageIds);
            
        if (dbDeleteError) {
            console.error('Error deleting images from database:', dbDeleteError);
        } else {
            await deleteImagesFromStorage(imageIds);
        }
    }
    
    // Upload new images
    if (imageFiles.length > 0) {
        const { data: existingImagesCount } = await supabase
            .from('product_image')
            .select('position')
            .eq('id', productId)
            .order('position', { ascending: false })
            .limit(1);
            
        const startPosition = existingImagesCount && existingImagesCount.length > 0 
            ? existingImagesCount[0].position + 1 
            : 1;
        
        const uploadPromises = imageFiles.map((file, index) => 
            uploadImageToSupabase(file, productId, startPosition + index)
        );
        
        const uploadResults = await Promise.all(uploadPromises);
        const failedUploads = uploadResults.filter(result => !result.success);
        
        if (failedUploads.length > 0) {
            const errorMessages = failedUploads.map((result, index) => 
                `Image ${index + 1}: ${result.error}`
            ).join('\n');
            
            throw new Error(`Some images failed to upload:\n${errorMessages}`);
        }
    }
};

export const loadProductData = async (productId) => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        throw new Error('You must be logged in to edit products.');
    }
    
    // Fetch product data
    const { data: product, error: productError } = await supabase
        .from('product')
        .select('*')
        .eq('id', productId)
        .single();
        
    if (productError) throw productError;
    
    // Fetch product details
    const { data: details, error: detailsError } = await supabase
        .from('product_details')
        .select('*')
        .eq('id', productId)
        .single();
        
    if (detailsError) throw detailsError;
    
    // Fetch existing images
    const { data: images, error: imagesError } = await supabase
        .from('product_image')
        .select('*')
        .eq('id', productId)
        .order('position', { ascending: true });
        
    if (imagesError) throw imagesError;
    
    return { product, details, images };
};

// Custom hook for product form
export const useProductForm = () => {
    const { id: productId } = useParams();
    const navigate = useNavigate();
    const isUpdateMode = Boolean(productId);
    
    // State
    const [loading, setLoading] = useState(false);
    const [disable, setDisable] = useState(false);
    const [currentContent, setCurrentContent] = useState('details');
    const [mode, setMode] = useState('edit');
    
    // Form data
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
    
    // Categories
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedSubcategory, setSelectedSubcategory] = useState(null);
    
    // Images
    const [image, setImage] = useState([]);
    const [imageFiles, setImageFiles] = useState([]);
    const [existingImages, setExistingImages] = useState([]);
    const [imagesToDelete, setImagesToDelete] = useState([]);
    const [currentImage, setCurrentImage] = useState(null);
    
    // Drag & Drop
    const [draggedIndex, setDraggedIndex] = useState(null);
    const [dragOverIndex, setDragOverIndex] = useState(null);

    useEffect(() => {
        fetchCategories().then(setCategories).catch(console.error);
        
        if (isUpdateMode) {
            loadExistingProduct();
        }
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

    const loadExistingProduct = async () => {
        try {
            setLoading(true);
            const { product, details, images } = await loadProductData(productId);
            
            setProductData({
                name: product.name,
                price: product.price.toString(),
                stock: product.stock.toString(),
                subcategory: product.sub_id
            });
            
            setProductDesc({
                description: details.description || '',
                details: details.detail || '',
                specs: details.specs || ''
            });
            
            setSelectedSubcategory(product.sub_id);
            
            if (images && images.length > 0) {
                const imageUrls = images.map(img => 
                    `https://ursffahpdyihjraagbuz.supabase.co/storage/v1/object/public/product-image/${img.filepath}`
                );
                setExistingImages(images);
                setImage(imageUrls);
                setCurrentImage(imageUrls[0]);
            }
            
            if (product.sub_id) {
                const { data: subcategoryData } = await supabase
                    .from('subcategory')
                    .select('cat_id')
                    .eq('id', product.sub_id)
                    .single();
                    
                if (subcategoryData) {
                    setSelectedCategory(subcategoryData.cat_id);
                }
            }
            
        } catch (error) {
            console.error('Error loading product data:', error);
            alert('Error loading product data. Please try again.');
            navigate('/seller/products');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setDisable(true);
        
        try {
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            if (authError || !user) {
                alert('You must be logged in to save products.');
                navigate('/login');
                return;
            }
            
            const userId = await getUserID();
            
            // Check if seller is banned
            const { data: sellerData } = await supabase
                .from("seller")
                .select("level")
                .eq("id", userId)
                .single();
                
            if (sellerData?.level === -1) {
                alert('Your seller account has been banned. You cannot create or update products.');
                setDisable(false);
                return;
            }
            
            if (isUpdateMode) {
                await updateProduct(productId, productData, productDesc, selectedSubcategory, imageFiles, imagesToDelete, existingImages, userId);
                alert('Product updated successfully!');
                navigate('/seller/products');
            } else {
                await createProduct(productData, productDesc, selectedSubcategory, imageFiles, userId);
                resetForm();
                alert('Product added successfully!');
            }
            
        } catch (error) {
            console.error('Error saving product:', error);
            alert(`Error saving product: ${error.message}`);
        } finally {
            setDisable(false);
        }
    };
    
    const resetForm = () => {
        setProductData({ name: '', price: '', stock: '', subcategory: '' });
        setProductDesc({ description: '', details: '', specs: '' });
        setSelectedCategory(null);
        setSelectedSubcategory(null);
        setImage([]);
        setImageFiles([]);
        setExistingImages([]);
        setImagesToDelete([]);
        setCurrentImage(null);
    };

    return {
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
    };
};
