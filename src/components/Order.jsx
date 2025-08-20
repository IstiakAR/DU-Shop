import { useLocation } from "react-router-dom";
import OrderItem from "./OrderItem";

function Order() {
  const location = useLocation();
  const { cartItems } = location.state || { cartItems: [] };
  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  return (
    <div className="order-container">
        <div className="order-items-wrapper">
            {cartItems.map((item, index) => (
                <OrderItem key={index} item={item} />
            ))}
            <div className="order-total order-item-container">
                <span className="left-side">Total:</span>
                <span className="right-side">{total.toFixed(2)} TK</span>
            </div>
        </div>
        <button className="yellow-button">Pay Now</button>
    </div>
  );
}

export default Order;
