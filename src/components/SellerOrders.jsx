import { useEffect, useState } from "react";
import supabase from "../supabase";
import "../styles/Order.css";

function SellerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSellerOrders();
  }, []);

  const fetchSellerOrders = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) {
        console.error("No logged in user.");
        setLoading(false);
        return;
      }

      // Check if seller is banned
      const { data: sellerData } = await supabase
        .from("seller")
        .select("level")
        .eq("id", user.id)
        .single();
        
      if (sellerData?.level === -1) {
        alert("Your seller account has been banned. You cannot access order management.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("order_item")
        .select(`
          id,
          quantity,
          price_at_purchase,
          product:prod_id (
            id,
            name,
            seller_id
          ),
          order:order_id (
            id,
            created_at,
            user:user_id (
              id,
              name
            ),
            delivery:delivery (
              delivery_id,
              delivery_status,
              address,
              phone
            )
          )
        `);

      if (error) throw error;

      const sellerOrders = data
        .filter((o) => o.product?.seller_id === user.id)
        .map((o) => ({
          ...o,
          order: {
            ...o.order,
            delivery: Array.isArray(o.order.delivery)
              ? o.order.delivery[0] || { delivery_status: "Pending" }
              : o.order.delivery || { delivery_status: "Pending" },
          },
        }));

      setOrders(sellerOrders);
    } catch (err) {
      console.error("Error fetching orders:", err.message);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const updateDeliveryStatus = async (deliveryId) => {
    try {
      // Update DB
      const { error } = await supabase
        .from("delivery")
        .update({ delivery_status: "On the Way" })
        .eq("delivery_id", deliveryId);

      if (error) throw error;
    } catch (err) {
      console.error("Error updating delivery:", err.message);
    }
  };

  const handleOnTheWay = (orderId, deliveryId) => {
    // Update UI instantly (disable button)
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              order: {
                ...o.order,
                delivery: {
                  ...o.order.delivery,
                  delivery_status: "On the Way",
                },
              },
            }
          : o
      )
    );

    // Update DB
    updateDeliveryStatus(deliveryId);
  };

  if (loading) return <p>Loading seller orders...</p>;

  return (
    <div className="seller-orders-container">
      {orders.length === 0 ? (
        <p>No orders found for your products.</p>
      ) : (
        <table className="order-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Buyer</th>
              <th>Product</th>
              <th>Quantity</th>
              <th>Total Price</th>
              <th>Address</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td>{o.order.id}</td>
                <td>{o.order.user?.name || "Unknown"}</td>
                <td>{o.product?.name}</td>
                <td>{o.quantity}</td>
                <td>{o.price_at_purchase * o.quantity} ৳</td>
                <td>{o.order.delivery?.address || "No Address"}</td>
                <td>{o.order.delivery?.phone || "No Phone"}</td>
                <td>{o.order.delivery?.delivery_status || "Pending"}</td>
                <td>
                  {o.order.delivery?.delivery_status === "Pending" ? (
                    <button
                      className="seller-button"
                      onClick={() =>
                        handleOnTheWay(o.id, o.order.delivery.delivery_id)
                      }
                    >
                      On the Way
                    </button>
                  ) : (
                    <button className="seller-button" disabled>
                      On the Way
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default SellerOrders;
