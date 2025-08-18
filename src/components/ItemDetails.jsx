import '../styles/ItemDetails.css';

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import supabase from '../supabase';

function ItemDetails() {
    const productID = useParams().id;
    // Initialize currentImage to 0 (first image index)
    const [currentImage, setCurrentImage] = useState(0);
    const [content, setContent] = useState();
    const [itemData, setItemData] = useState([]);
    const [images, setImages] = useState([]);
    const [desc, setDesc] = useState({});

    useEffect(() => {
        const fetchItem = async () => {
            const { data, error } = await supabase
                .from('product')
                .select('*')
                .eq('id', productID)
            if(!error && data) {
                setItemData(data);
            }
        }
        fetchItem();
    }, [productID]);

    useEffect(() => {
        if (itemData.length === 0) return;

        const fetchImages = async () => {
            const { data, error } = await supabase
                .from('product_image')
                .select('filepath')
                .eq('id', itemData[0].id)
                .order('position', { ascending: true })
            if (!error && data) {
                setImages(data);
            }
        };
        fetchImages();
    }, [itemData]);

    useEffect(() => {
        if (itemData.length === 0) return;
        const fetchDesc = async () => {
            const { data, error } = await supabase
                .from('product_details')
                .select('*')
                .eq('id', itemData[0].id)
                .single();
            if (!error && data) {
                setDesc(data);
            }
        };
        fetchDesc();
    }, [itemData]);

    const getImageUrl = (filepath) => {
        return `https://ursffahpdyihjraagbuz.supabase.co/storage/v1/object/public/product-image/${filepath}`;
    };

    return(
        <div className='container'>
            <div className='top-part'>
                <div className='picture-container'>
                    <div className='picture-bar'>
                        {images && images.map((img, idx) => (
                            <img key={idx} src={getImageUrl(img.filepath)}
                            onClick={() => setCurrentImage(idx)} />
                        ))}
                    </div>
                    <div className='picture-area'>
                        {images.length > 0 && images[currentImage] ? (
                            <img src={getImageUrl(images[currentImage].filepath)} alt="Item"
                                className='main-picture'/>
                        ) : (
                            <span style={{color: '#888'}}>No image available</span>
                        )}
                    </div>
                </div>
                <div className='info-container'>
                    <h2>{itemData[0]?.name}</h2>
                    <div className="price-stock-row">
                        <span className="price">Price: ₹{itemData[0]?.price}</span>
                        <span className="divider"> | </span>
                        <span className="stock">Stock: {itemData[0]?.stock}</span>
                    </div>
                    <p>{desc.description || "Description will be here soon."}</p>
                </div>
            </div>
            <div className='details-container'>
                <div className='tab-bar'>
                    <span onClick={() => setContent(desc.detail || 'Details about the item will be displayed here.')}>Details</span>
                    <span onClick={() => setContent(desc.specs || 'Specifications of the item will be displayed here.')}>Specs</span>
                </div>
                <div className='tab-content'>
                    <span>{content || desc.detail}</span>
                </div>
            </div>
            <div className='review-container details-container'>
                <h2>Reviews</h2>
            </div>
        </div>
    )
}

export default ItemDetails;