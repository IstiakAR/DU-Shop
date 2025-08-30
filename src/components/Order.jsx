import { useLocation, useNavigate } from "react-router-dom";
import OrderItem from "./OrderItem";
import supabase from "../supabase";
import { getUserID } from "../fetch";
import { useState } from "react";

function Order() {
  const location = useLocation();
  const navigate = useNavigate();
  const { cartItems } = location.state || { cartItems: [] };
  const [loading, setLoading] = useState(false);

  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handlePayment = async () => {
    setLoading(true);
    
    try {
      // Get current user
      const userId = await getUserID();
      if (!userId) {
        alert("Please login to continue");
        navigate("/login");
        return;
      }

      // Call server-side function to create order with atomic stock reservation
      const { data, error } = await supabase.rpc('create_order_with_items', {
        p_user_id: userId,
        p_cart_items: cartItems.map(item => ({
          prod_id: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        p_address: '',  // Will be filled in payment step
        p_phone: ''     // Will be filled in payment step
      });

      if (error) throw error;

      // Check if stock reservation was successful
      if (!data.success) {
        alert(data.error || "Failed to process order");
        setLoading(false);
        return;
      }

      // Navigate to payment with order data
      navigate("/payment", { 
        state: { 
          cartItems, 
          orderId: data.order_id, 
          paymentId: data.payment_id,
          total 
        } 
      });

    } catch (error) {
      console.error("Error processing order:", error);
      alert("Error processing order. Please try again.");
    } finally {
      setLoading(false);
    }
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
