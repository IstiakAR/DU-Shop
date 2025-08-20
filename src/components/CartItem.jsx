import '../styles/CartItem.css';
import { useState, useEffect } from 'react';
import { addToCart } from './CartCondition';

function CartItem({ item, onCartUpdate }) {
    const { id, name, price, quantity, image } = item;
    const [quantityNumber, setQuantity] = useState(quantity);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        setQuantity(quantity);
    }, [quantity]);

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
        if (isUpdating) return;
        
        setIsUpdating(true);
        const newQuantity = quantityNumber - 1;
        setQuantity(newQuantity);
        await addToCart(id, 1, 'minus');
        setIsUpdating(false);
        onCartUpdate();
    };

    const removeItem = async () => {
        if (isUpdating) return;
        
        setIsUpdating(true);
        await addToCart(id, 0, 'set');
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
                    disabled={isUpdating}
                >–</button>
            </div>
            <button 
                className="cart-item-remove" 
                onClick={removeItem}
                disabled={isUpdating}
            >✕</button>
        </div>
    );
}

export default CartItem;