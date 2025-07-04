import '../styles/CartItem.css';

import { useState } from 'react';

function CartItem({ image, title, price, quantity }) {
    const [quantityNumber, setQuantity] = useState(quantity);

    const handleInputChange = (e) => {
        const value = e.target.value.replace(/\D/, '');
        setQuantity(value);
        if (value === '') {
            onQuantityChange(1);
        } else {
            onQuantityChange(Math.max(1, parseInt(value, 10)));
        }
    };

    return (
        <div className="cart-item">
            <img src={image} alt={title} className="cart-item-image" />
            <div className="cart-item-details">
                <div className="cart-item-title">{title}</div>
                    <span>${price}</span>
            </div>
            <div className="cart-item-quantity">
                <input
                    className="qty-input"
                    type="text"
                    value={quantityNumber}
                    onChange={handleInputChange}
                    min={1}
                    inputMode="numeric"
                    pattern="[0-9]*"
                />
                <button
                    className="qty-btn"
                    onClick={() => setQuantity(Math.max(1, quantityNumber + 1))}
                    aria-label="Increase quantity"
                >+</button>
                <button
                    className="qty-btn"
                    onClick={() => setQuantity(Math.max(1, quantityNumber - 1))}
                    aria-label="Decrease quantity"
                >–</button>
            </div>
            <button className="cart-item-remove" onClick={() => {}}>✕</button>
        </div>
    );
}

export default CartItem;