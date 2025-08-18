import '../styles/ItemCard.css';
import { useNavigate } from 'react-router-dom';

function ItemCard({prop}) {
    const navigate = useNavigate();

    const handleItemClick = () => {
        navigate(`/item/${prop.id}`);
    };
    return(
        <div className="item-card" onClick={handleItemClick}>
            <img src={prop.image} alt={prop.name} className="item-image" />
            <h3 className="item-name">{prop.name}</h3>
            <p className="item-price">₹{prop.price}</p>
            <p className='item-stock'>{prop.stock} left</p>
            <button className="addCart" disabled={prop.stock === 0}>Add to Cart</button>
        </div>
    )
}

export default ItemCard;