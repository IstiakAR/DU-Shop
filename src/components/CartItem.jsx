import '../styles/CartItem.css';
import { useState } from 'react';
import { addToCart } from './CartCondition';

function CartItem({ item, onCartUpdate }) {
    const { id, name, price, quantity, image } = item;
    const [quantityNumber, setQuantity] = useState(quantity);
    const [isUpdating, setIsUpdating] = useState(false);

    // Calculate the item's total price
    const calculateTotal = () => {
        return price * quantityNumber;
    };

    const incrementQuantity = async () => {
        if (isUpdating) return;
        
        setIsUpdating(true);
        const newQuantity = quantityNumber + 1;
        setQuantity(newQuantity);
        await addToCart(id, 1, 'plus');
        setIsUpdating(false);
        onCartUpdate();
    };

    const decrementQuantity = async () => {
        if (isUpdating || quantityNumber <= 1) return;
        
        setIsUpdating(true);
        const newQuantity = quantityNumber - 1;
        setQuantity(newQuantity);
        await addToCart(id, 1, 'minus');
        setIsUpdating(false);
        onCartUpdate();
    };

    return (
        <div className="cart-item">
            <img src={image} alt={name} className="cart-item-image" />
            <div className="cart-item-details">
                <div className="cart-item-title">{name}</div>
                <span>{price} TK × {quantityNumber} = {calculateTotal()} TK</span>
            </div>
            <div className="cart-item-quantity">
                <button
                    className="qty-btn"
                    onClick={incrementQuantity}
                    aria-label="Increase quantity"
                    disabled={isUpdating}
                >+</button>
                {quantityNumber}
                <button
                    className="qty-btn"
                    onClick={decrementQuantity}
                    aria-label="Decrease quantity"
                    disabled={isUpdating || quantityNumber <= 1}
                >–</button>
            </div>
            <button 
                className="cart-item-remove" 
                onClick={async () => {
                    // Implement remove functionality
                }}
            >✕</button>
        </div>
    );
}

export default CartItem;