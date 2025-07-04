import '../styles/ItemCard.css';

function ItemCard({prop}) {
    return(
        <div className="item-card">
            <img src={prop.image} alt={prop.name} className="item-image" />
            <h3 className="item-name">{prop.name}</h3>
            <p className="item-price">₹{prop.price}</p>
            <button className="addCart">Add to Cart</button>
        </div>
    )
}

export default ItemCard;