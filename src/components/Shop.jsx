import { useEffect, useState } from 'react';
import '../styles/Shop.css';
import ItemCard from './ItemCard';
import supabase from '../supabase.jsx'
import { useParams } from 'react-router-dom';

function Shop(props){
    const { subcategoryId } = useParams();
    const [itemData, setItemData] = useState([]); 
    const [images, setImages] = useState({});
    useEffect(() => {
        const fetchItems = async () => {
            const { data, error } = await supabase
                .from('product')
                .select('*')
                .eq('sub_id', subcategoryId)
                .eq('type', 'product')
            if(!error && data) {
                setItemData(data);
            }
        }
        fetchItems();
    }, [subcategoryId]);

    useEffect(() => {
        if (itemData.length === 0) return;
        const fetchImages = async () => {
            const imagePromises = itemData.map(async (item) => {
                const { data, error } = await supabase
                    .from('product_image')
                    .select('filepath')
                    .eq('id', item.id)
                    .order('position', { ascending: true })
                    .limit(1);
                return { id: item.id, filepath: (!error && data && data[0]) ? data[0].filepath : null };
            });
            const results = await Promise.all(imagePromises);
            const imagesObj = results.reduce((acc, curr) => {
                acc[curr.id] = curr.filepath;
                return acc;
            }, {});
            setImages(imagesObj);
            console.log(imagesObj)
        };
        fetchImages();
    }, [itemData]);

    return(
        <div className='shop-container'>
            <div className='item-card-container'>
                {itemData.length > 0 ? (
                    itemData.map((item, index) => (
                        <ItemCard 
                            key={item.id || index} 
                            prop={{
                                name: item.name, 
                                price: item.price, 
                                image: `https://ursffahpdyihjraagbuz.supabase.co/storage/v1/object/public/product-image/${images[item.id]}` || "/DU-Shop.png",
                                id: item.id,
                                stock: item.stock
                            }} 
                        />
                    ))
                ) : (
                    <div>No products found</div>
                )}
            </div>
        </div>
    )
}

export default Shop;
