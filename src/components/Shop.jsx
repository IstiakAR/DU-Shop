import { useEffect, useState } from 'react';
import '../styles/Shop.css';
import ItemCard from './ItemCard';
import supabase from '../supabase.jsx'
import { useParams } from 'react-router-dom';

function Shop(){
    const { subcategoryId } = useParams();
    const [itemData, setItemData] = useState([]); 
    const [images, setImages] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [retryCount, setRetryCount] = useState(0);
    
    const fetchItems = async (attempt = 1) => {
        try {
            setLoading(true);
            setError(null);
            
            let query = supabase
                .from('product')
                .select('*')
                .eq('type', 'product');
                
            if(subcategoryId) {
                query = query.eq('sub_id', subcategoryId);
            }
            
            console.log('Fetching products...', { subcategoryId, attempt });
            const { data, error } = await query;
            
            if(error) {
                console.error('Database error:', error);
                throw new Error(`Database error: ${error.message}`);
            }
            
            if(data) {
                console.log(`Fetched ${data.length} products`);
                setItemData(data);
                setRetryCount(0); // Reset retry count on success
            } else {
                console.warn('No data returned from query');
                setItemData([]);
            }
        } catch (err) {
            console.error('Error fetching items:', err);
            setError(err.message);
            
            // Retry logic: retry up to 3 times with exponential backoff
            if (attempt < 3) {
                const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
                console.log(`Retrying in ${delay}ms... (attempt ${attempt + 1}/3)`);
                setTimeout(() => {
                    setRetryCount(attempt);
                    fetchItems(attempt + 1);
                }, delay);
            } else {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        fetchItems();
    }, [subcategoryId]);

    useEffect(() => {
        if (itemData.length === 0) {
            setLoading(false);
            return;
        }
        
        const fetchImages = async () => {
            try {
                console.log('Fetching images for', itemData.length, 'products');
                
                // Batch fetch images to improve performance
                const productIds = itemData.map(item => item.id);
                const { data: imageData, error: imageError } = await supabase
                    .from('product_image')
                    .select('id, filepath, position')
                    .in('id', productIds)
                    .order('position', { ascending: true });

                if (imageError) {
                    console.error('Error fetching images:', imageError);
                    // Continue with default images
                    setImages({});
                    setLoading(false);
                    return;
                }

                // Group images by product ID and take the first one (lowest position)
                const imagesObj = {};
                if (imageData) {
                    imageData.forEach(img => {
                        if (!imagesObj[img.id]) {
                            imagesObj[img.id] = img.filepath;
                        }
                    });
                }

                console.log('Images loaded:', Object.keys(imagesObj).length);
                setImages(imagesObj);
            } catch (err) {
                console.error('Error in fetchImages:', err);
                setImages({}); // Set empty object to prevent loading state hanging
            } finally {
                setLoading(false);
            }
        };
        
        fetchImages();
    }, [itemData]);

    return(
        <div className='shop-container'>
            <div className='item-card-container'>
                {itemData.map((item, index) => (
                    <ItemCard 
                        key={item.id || index} 
                        prop={{
                            name: item.name, 
                            price: item.price, 
                            image: images[item.id] 
                                ? `https://ursffahpdyihjraagbuz.supabase.co/storage/v1/object/public/product-image/${images[item.id]}`
                                : "/DU-Shop.png",
                            id: item.id,
                            stock: item.stock
                        }}
                    />
                ))}
            </div>
        </div>
    )
}

export default Shop;