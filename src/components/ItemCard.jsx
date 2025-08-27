import '../styles/ItemCard.css';
import { useNavigate } from 'react-router-dom';
import { addToCart } from './CartCondition';
import { useState, useEffect } from 'react';
import { getUserID } from '../fetch';

function ItemCard({prop}) {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        setUser(getUserID());
    }, []);

    const handleItemClick = () => {
        navigate(`/item/${prop.id}`);
    };
    
    const handleCartAdd = async (e) => {
        e.stopPropagation();
        await addToCart(prop.id, 1, 'plus');
    }

    const isOwnProduct = user && prop.seller_id && user.id === prop.seller_id;
    
    return(
        <div className="item-card" onClick={handleItemClick}>
            <img src={prop.image} alt={prop.name} className="item-image" />
            <h3 className="item-name">{prop.name}</h3>
            <p className="item-price">₹{prop.price}</p>
            <p className='item-stock'>{prop.stock} left</p>
            <button className="addCart" disabled={prop.stock === 0 || isOwnProduct} onClick={handleCartAdd}>Add to Cart</button>
        </div>
    )
}

export default ItemCard;