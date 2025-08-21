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
    try {
      const { data, error } = await supabase
        .from("pending_seller")
        .select(`
          id,
          created_at,
          user: user (id, name, email)
        `);

      if (error) throw error;
      setPendingSellers(data || []);
    } catch (err) {
      console.error("Error fetching pending sellers:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const confirmSeller = async (userId) => {
    try {
      // Insert into seller table with valid rating (1-5)
      const { error: insertError } = await supabase.from("seller").insert([{
        id: userId,
        income: 0,
        rating: 1,  // must be 1-5
        rate: 0,
        level: 1,
      }]);
      if (insertError) throw insertError;

      // Remove from pending_seller
      const { error: deleteError } = await supabase
        .from("pending_seller")
        .delete()
        .eq("id", userId);
      if (deleteError) throw deleteError;

      fetchPending();
    } catch (err) {
      console.error("Error confirming seller:", err.message);
    }
  };

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
              <div
                style={{
                  marginTop: "8px",
                  display: "flex",
                  gap: "10px",  // space between buttons
                }}
              >
                <button
                  className="submit-btn"
                  onClick={() => confirmSeller(seller.id)}
                  style={{ padding: "8px 16px" }}
                >
                  Confirm
                </button>
                <button
                  className="submit-btn"
                  onClick={() => cancelSeller(seller.id)}
                  style={{ padding: "8px 16px" }}
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
