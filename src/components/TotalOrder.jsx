import { useEffect, useState } from "react";
import supabase from "../supabase";
import "../styles/Admin.css";

function TotalOrder() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from("order_item")
      .select(`
        id,
        quantity,
        price_at_purchase,
        order:order_id (
          id,
          created_at,
          user:user_id ( id, name )
        ),
        product:prod_id ( id, name )
      `);

    if (error) {
      console.error("Error fetching orders:", error);
    } else {
      setOrders(data);
    }
    setLoading(false);
  };

  const deleteOrder = async (orderId) => {
    const { error } = await supabase.from("order").delete().eq("id", orderId);
    if (error) {
      console.error("Error deleting order:", error);
    } else {
      setOrders(orders.filter((o) => o.order.id !== orderId));
    }
  };

  const filteredOrders = orders.filter(
    (o) =>
      o.order.id.toLowerCase().includes(search.toLowerCase()) ||
      (o.order.user?.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (o.product?.name || "").toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <p>Loading orders...</p>;

  return (
    <div className="seller-container">
      <h2 className="admin-title">Total Orders</h2>

      <input
        type="text"
        placeholder="Search by Order ID, User, or Product"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="search-input"
      />

      <table className="order-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>User</th>
            <th>Product</th>
            <th>Quantity</th>
            <th>Price</th>
            <th>Date</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.length > 0 ? (
            filteredOrders.map((o) => (
              <tr key={o.id}>
                <td>{o.order.id}</td>
                <td>{o.order.user?.name || "Unknown"}</td>
                <td>{o.product?.name || "N/A"}</td>
                <td>{o.quantity}</td>
                <td>${o.price_at_purchase}</td>
                <td>{new Date(o.order.created_at).toLocaleString()}</td>
                <td>
                  <button
                    className="seller-button"
                    onClick={() => deleteOrder(o.order.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" style={{ textAlign: "center" }}>
                No orders found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default TotalOrder;
