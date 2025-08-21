import { useLocation, useNavigate } from "react-router-dom";
import OrderItem from "./OrderItem";
import supabase from "../supabase";
import { getUserID } from "../fetch";
import { validateStockAvailability } from "./orderUtils";
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
      // Check stock availability
      const { isValid, outOfStockItems } = await validateStockAvailability(cartItems);

      if (!isValid) {
        const names = outOfStockItems.map(i => i.name).join(", ");
        alert(`Insufficient stock for: ${names}`);
        setLoading(false);
        return;
      }

      // Get current user
      const userId = await getUserID();
      if (!userId) {
        alert("Please login to continue");
        navigate("/login");
        return;
      }

      // Create pending payment
      const { data: paymentData, error: paymentError } = await supabase
        .from("payment")
        .insert({
          status: "pending",
          method: "bkash", // Default, will be updated in Payment component
          bank_id: "temp"
        })
        .select()
        .single();

      if (paymentError) throw paymentError;

      // Create order
      const { data: orderData, error: orderError } = await supabase
        .from("order")
        .insert({
          user_id: userId,
          pay_id: paymentData.pay_id
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items and reduce stock
      const orderItems = cartItems.map(item => ({
        order_id: orderData.id,
        prod_id: item.id,
        quantity: item.quantity,
        price_at_purchase: item.price
      }));

      const { error: orderItemsError } = await supabase
        .from("order_item")
        .insert(orderItems);

      if (orderItemsError) throw orderItemsError;

      // Reduce stock for all products
      for (const item of cartItems) {
        // First get the current stock
        const { data: productData, error: fetchError } = await supabase
          .from("product")
          .select("stock")
          .eq("id", item.id)
          .single();

        if (fetchError) throw fetchError;

        // Calculate new stock
        const newStock = productData.stock - item.quantity;

        // Update the stock
        const { error: stockError } = await supabase
          .from("product")
          .update({ stock: newStock })
          .eq("id", item.id);

        if (stockError) throw stockError;
      }

      // Navigate to payment with order and payment data
      navigate("/payment", { 
        state: { 
          cartItems, 
          orderId: orderData.id, 
          paymentId: paymentData.pay_id,
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
