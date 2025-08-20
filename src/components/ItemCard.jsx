import '../styles/ItemCard.css';
import { useNavigate } from 'react-router-dom';
import { addToCart } from './CartCondition';

function ItemCard({prop}) {
    const navigate = useNavigate();

    const handleItemClick = () => {
        navigate(`/item/${prop.id}`);
    };
    
    const handleCartAdd = async (e) => {
        e.stopPropagation();
        await addToCart(prop.id, 1, 'plus');
        // Optional: You could add a visual feedback that item was added to cart
    }
    
    return(
        <div className="item-card" onClick={handleItemClick}>
            <img src={prop.image} alt={prop.name} className="item-image" />
            <h3 className="item-name">{prop.name}</h3>
            <p className="item-price">₹{prop.price}</p>
            <p className='item-stock'>{prop.stock} left</p>
            <button className="addCart" disabled={prop.stock === 0} onClick={handleCartAdd}>Add to Cart</button>
        </div>
    )
}

export default ItemCard;