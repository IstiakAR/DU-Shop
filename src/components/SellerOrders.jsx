import { useEffect, useState } from "react";
import supabase from "../supabase";
import "../styles/SellerOrders.css"; // CSS for table styling

function SellerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchSellerOrders();
  }, []);

  const fetchSellerOrders = async () => {
    setLoading(true);

    // Get current logged-in user
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (!user) {
      setLoading(false);
      return;
    }

    // Fetch all order items along with product and buyer info
    const { data, error } = await supabase
      .from("order_item")
      .select(`
        id,
        quantity,
        price_at_purchase,
        product:prod_id ( id, name, seller_id ),
        order:order_id (
          id,
          created_at,
          user:user_id ( id, name )
        )
      `);

    if (error) {
      console.error("Error fetching orders:", error);
      setLoading(false);
      return;
    }

    // Filter only orders where product.seller_id matches logged-in seller
    const sellerOrders = data.filter(o => o.product?.seller_id === user.id);
    setOrders(sellerOrders);
    setLoading(false);
  };

  const deleteOrder = async (orderItemId) => {
    const { error } = await supabase
      .from("order_item")
      .delete()
      .eq("id", orderItemId);
    if (error) console.error("Error deleting order:", error);
    else setOrders(orders.filter((o) => o.id !== orderItemId));
  };

  const filteredOrders = orders.filter(
    (o) =>
      o.product?.name.toLowerCase().includes(search.toLowerCase()) ||
      (o.order.user?.name || "").toLowerCase().includes(search.toLowerCase()) ||
      o.order.id.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <p>Loading orders...</p>;

  return (
    <div className="seller-container">
      <h2 className="admin-title">My Received Orders</h2>

      <input
        type="text"
        placeholder="Search by product, buyer, or order ID"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="search-input"
      />

      <table className="order-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Product</th>
            <th>Quantity</th>
            <th>Price</th>
            <th>Buyer</th>
            <th>Date</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.length > 0 ? (
            filteredOrders.map((o) => (
              <tr key={o.id}>
                <td>{o.order.id}</td>
                <td>{o.product?.name}</td>
                <td>{o.quantity}</td>
                <td>${o.price_at_purchase}</td>
                <td>{o.order.user?.name || "Unknown"}</td>
                <td>{new Date(o.order.created_at).toLocaleString()}</td>
                <td>
                  <button
                    className="seller-button"
                    onClick={() => deleteOrder(o.id)}
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

export default SellerOrders;
