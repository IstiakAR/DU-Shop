import { useState, useEffect } from "react";
import supabase from "../supabase";
import "../styles/Admin.css";

function PendingSellers() {
  const [pendingSellers, setPendingSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    setLoading(true);

    // Assuming: pending_seller.id references user.id
    const { data, error } = await supabase
      .from("pending_seller")
      .select(`
        id,
        created_at,
        user: user (id, name, email)
      `);

    if (error) {
      console.error("Error fetching pending sellers:", error.message);
    } else {
      setPendingSellers(data || []);
    }
    setLoading(false);
  };

  // Confirm seller: add to seller table, remove from pending_seller
  const confirmSeller = async (userId) => {
    try {
      // Add to seller table
      const { error: insertError } = await supabase.from("seller").insert({
        id: userId,
        income: 0,
        rating: 0,
        rate: 0,
        level: 1,
      });

      if (insertError) throw insertError;

      // Remove from pending_seller
      const { error: deleteError } = await supabase
        .from("pending_seller")
        .delete()
        .eq("id", userId);

      if (deleteError) throw deleteError;

      // Refresh list
      fetchPending();
    } catch (err) {
      console.error("Error confirming seller:", err.message);
    }
  };

  // Cancel pending seller
  const cancelSeller = async (userId) => {
    try {
      const { error } = await supabase
        .from("pending_seller")
        .delete()
        .eq("id", userId);

      if (error) throw error;

      fetchPending();
    } catch (err) {
      console.error("Error cancelling seller:", err.message);
    }
  };

  if (loading) return <h3>Loading pending sellers...</h3>;

  return (
    <div className="admin-container">
      <h2 className="admin-title">Pending Sellers</h2>
      {pendingSellers.length === 0 ? (
        <p>No pending sellers.</p>
      ) : (
        <ul>
          {pendingSellers.map((seller) => (
            <li key={seller.id} style={{ marginBottom: "15px" }}>
              <strong>{seller.user?.name || "Unknown Name"}</strong> (
              {seller.user?.email || "No Email"}) <br />
              Requested at: {new Date(seller.created_at).toLocaleString()}
              <div style={{ marginTop: "8px" }}>
                <button
                  className="submit-btn"
                  onClick={() => confirmSeller(seller.id)}
                  style={{ marginRight: "8px" }}
                >
                  Confirm
                </button>
                <button
                  className="submit-btn"
                  onClick={() => cancelSeller(seller.id)}
                >
                  Cancel
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default PendingSellers;
