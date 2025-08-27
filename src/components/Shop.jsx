import { useEffect, useState } from 'react';
import '../styles/Shop.css';
import ItemCard from './ItemCard';
import supabase from '../supabase.jsx'
import { useParams, useLocation } from 'react-router-dom';

function Shop() {
    const { subcategoryId } = useParams();
    const location = useLocation();
    const [itemData, setItemData] = useState([]); 
    const [images, setImages] = useState({});
    
    const fetchItems = async () => {
        try {
            if (location.state?.products) {
                setItemData(location.state.products);
                return;
            }
            
            let query = supabase
                .from('product')
                .select('*')
                .eq('type', 'product')
                .eq('status', 'active');
                
            if(subcategoryId) {
                query = query.eq('sub_id', subcategoryId);
            }
            
            const { data, error } = await query;
            
            if(error) {
                setItemData([]);
                return;
            }
            
            setItemData(data || []);
        } catch (err) {
            setItemData([]);
        }
    };

    useEffect(() => {
        fetchItems();
    }, [subcategoryId, location.state]);

    useEffect(() => {
        if (itemData.length === 0) {
            return;
        }

        const fetchImages = async () => {
            try {
                const productIds = itemData.map(item => item.id);
                const { data: imageData, error } = await supabase
                    .from('product_image')
                    .select('id, filepath, position')
                    .in('id', productIds)
                    .order('position', { ascending: true });

                if (error || !imageData) {
                    setImages({});
                    return;
                }

                const imagesObj = {};
                imageData.forEach(img => {
                    if (!imagesObj[img.id]) {
                        imagesObj[img.id] = img.filepath;
                    }
                });

                setImages(imagesObj);
            } catch (err) {
                setImages({});
            }
        };
        
        fetchImages();
    }, [itemData]);

    if(itemData.length === 0) {
        return (
            <div className='shop-container'>
                <h2>No Items Found</h2>
            </div>
        )
    }

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
                            stock: item.stock,
                            seller_id: item.seller_id
                        }}
                    />
                ))}
            </div>
        </div>
    )
}

export default Shop;