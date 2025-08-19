import '../styles/ItemCard.css';
import { useNavigate } from 'react-router-dom';
import { addToCart } from './CartCondition';

function ItemCard({prop}) {
    const navigate = useNavigate();

    const handleItemClick = () => {
        navigate(`/item/${prop.id}`);
    };
    
    const handleCartAdd = (e) => {
        e.stopPropagation();
        addToCart(prop.id, 1, 'plus');
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