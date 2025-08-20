import { useLocation, useNavigate } from "react-router-dom";
import OrderItem from "./OrderItem";
import supabases from "../supabase";
import { useState } from "react";

function Order() {
  const location = useLocation();
  const navigate = useNavigate();
  const { cartItems } = location.state || { cartItems: [] };
  const [loading, setLoading] = useState(false);

  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handlePayment = async () => {
    setLoading(true);
    const ids = cartItems.map(item => item.id);
    const { data, error } = await supabases
      .from("product")
      .select("id,stock,name")
      .in("id", ids);

    setLoading(false);

    const outOfStockItems = cartItems.filter(cartItem => {
      const dbItem = data.find(d => d.id === cartItem.id);
      return !dbItem || cartItem.quantity > dbItem.stock;
    });

    if (outOfStockItems.length > 0) {
      const names = outOfStockItems.map(i => i.name).join(", ");
      alert(`Insufficient stock for: ${names}`);
      return;
    }

    navigate("/payment", { state: { cartItems } });
  };

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
        <button className="yellow-button" onClick={handlePayment} disabled={loading}>
          {loading ? "Checking Stock..." : "Pay Now"}
        </button>
    </div>
  );
}

export default Order;
