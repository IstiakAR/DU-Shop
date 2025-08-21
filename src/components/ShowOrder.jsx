import { useEffect, useState } from "react";
import supabase from "../supabase";
import "../styles/Order.css";

function ShowOrder() {
  const [userOrders, setUserOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);

      // Get logged-in user
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user) {
        console.error("Failed to get user:", userError);
        setLoading(false);
        return;
      }

      const userId = userData.user.id;
      setUser(userData.user);

      try {
        // Step 1: Fetch orders for this user
        const { data: ordersData, error: ordersError } = await supabase
          .from("order")
          .select(`
            id,
            created_at,
            pay_id
          `)
          .eq("user_id", userId);

        if (ordersError) {
          console.error("Error fetching orders:", ordersError);
          setLoading(false);
          return;
        }

        // Step 2: Fetch payment status for all orders
        const payIds = ordersData.map((o) => o.pay_id);
        const { data: paymentsData } = await supabase
          .from("payment")
          .select(`pay_id, status`)
          .in("pay_id", payIds);

        // Step 3: Fetch order items with product names and price
        const orderIds = ordersData.map((o) => o.id);
        const { data: itemsData } = await supabase
          .from("order_item")
          .select(`
            id,
            order_id,
            prod_id,
            quantity,
            price_at_purchase,
            product!inner(name)
          `)
          .in("order_id", orderIds);

        // Step 4: Combine data and calculate total price per order
        const ordersWithItems = ordersData.map((order) => {
          const payment = paymentsData.find((p) => p.pay_id === order.pay_id);
          const items = itemsData
            .filter((i) => i.order_id === order.id)
            .map((i) => ({
              ...i,
              product_name: i.product.name,
              total_price: i.quantity * i.price_at_purchase,
            }));

          const order_total = items.reduce((sum, item) => sum + item.total_price, 0);

          return {
            ...order,
            payment_status: payment?.status || "N/A",
            order_item: items,
            order_total,
          };
        });

        setUserOrders(ordersWithItems);
      } catch (err) {
        console.error("Unexpected error:", err);
      }

      setLoading(false);
    };

    fetchOrders();
  }, []);

  if (loading) return <h3>Loading orders...</h3>;

  return (
    <div className="order-container">
      <h2>My Orders</h2>
      {userOrders.length === 0 ? (
        <p>No orders yet.</p>
      ) : (
        <ul>
          {userOrders.map((o) => (
            <li key={o.id} className="order-card">
              <p>📦 Order ID: {o.id}</p>
              <p>Status: {o.payment_status}</p>
              <p>Date: {new Date(o.created_at).toLocaleString()}</p>
              <h4>Items:</h4>
              <ul>
                {o.order_item?.map((item) => (
                  <li key={item.id}>
                    {item.product_name} × {item.quantity} — ৳{item.price_at_purchase} each (Total: ৳{item.total_price})
                  </li>
                ))}
              </ul>
              <p><strong>Order Total: ৳{o.order_total}</strong></p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ShowOrder;
