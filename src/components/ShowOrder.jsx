import { useEffect, useState } from "react";
import supabase from "../supabase";
import "../styles/Admin.css";

function TotalOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      // Get logged-in user
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user) {
        console.error("Failed to get user:", userError);
        setLoading(false);
        return;
      }
      const userId = userData.user.id;
      setUser(userData.user);

      // Step 1: Fetch orders
      const { data: ordersData, error: ordersError } = await supabase
        .from("order")
        .select("id, created_at, pay_id")
        .eq("user_id", userId);

      if (ordersError) throw ordersError;

      if (!ordersData || ordersData.length === 0) {
        setOrders([]);
        setLoading(false);
        return;
      }

      // Step 2: Fetch payments
      const payIds = ordersData.map((o) => o.pay_id);
      const { data: paymentsData } = await supabase
        .from("payment")
        .select("pay_id, status")
        .in("pay_id", payIds);

      // Step 3: Fetch order items with product names
      const orderIds = ordersData.map((o) => o.id);
      const { data: itemsData } = await supabase
        .from("order_item")
        .select("order_id, quantity, price_at_purchase, product!inner(name)")
        .in("order_id", orderIds);

      // Step 4: Combine data
      const ordersWithItems = ordersData.map((order) => {
        const payment = paymentsData.find((p) => p.pay_id === order.pay_id);
        const items = itemsData.filter((i) => i.order_id === order.id);
        const totalPrice = items.reduce((sum, i) => sum + i.quantity * i.price_at_purchase, 0);
        const productNames = items.map(i => `${i.product.name} × ${i.quantity}`);

        return {
          ...order,
          payment_status: payment?.status || "N/A",
          total_price: totalPrice,
          items_count: items.length,
          product_names: productNames,
        };
      });

      setOrders(ordersWithItems);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async (orderId, payId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;

    try {
      const { error } = await supabase
        .from("payment")
        .update({ status: "refunded" })
        .eq("pay_id", payId);

      if (error) throw error;

      fetchOrders();
    } catch (err) {
      console.error("Error canceling order:", err);
    }
  };

  const filteredOrders = orders.filter(
    (o) =>
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.payment_status.toLowerCase().includes(search.toLowerCase()) ||
      o.product_names.join(" ").toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <p>Loading orders...</p>;

  return (
    <div className="seller-container">
      <h2 className="admin-title">My Orders</h2>
      <input
        type="text"
        placeholder="Search by Order ID, Payment Status, or Product Name"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="search-input"
      />
      <table className="order-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Payment Status</th>
            <th>Items Count</th>
            <th>Products</th>
            <th>Total Price</th>
            <th>Date</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.length > 0 ? (
            filteredOrders.map((o) => (
              <tr key={o.id}>
                <td>{o.id}</td>
                <td>{o.payment_status}</td>
                <td>{o.items_count}</td>
                <td>
                  {o.product_names.map((name, idx) => (
                    <div key={idx}>{name}</div>
                  ))}
                </td>
                <td>৳{o.total_price}</td>
                <td>{new Date(o.created_at).toLocaleDateString()}</td>
                <td>
                  {(o.payment_status === "pending" || o.payment_status === "completed") && (
                    <button
                      className="cancel-btn"
                      onClick={() => cancelOrder(o.id, o.pay_id)}
                    >
                      Cancel
                    </button>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" style={{ textAlign: "center" }}>
                No orders found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default TotalOrders;
