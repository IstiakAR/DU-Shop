import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../supabase";
import "../styles/Seller.css";

function Seller() {
  const [isSeller, setIsSeller] = useState(false);
  const [applied, setApplied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ rating: 0, totalSales: 0 });

  const navigate = useNavigate();

  useEffect(() => {
    const checkStatus = async () => {
      setLoading(true);
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user) {
        setLoading(false);
        return;
      }
      const userId = userData.user.id;
      setUser(userData.user);

      const { data: sellerData } = await supabase.from("seller").select("*").eq("id", userId).single();
      if (sellerData) {
        setIsSeller(true);

        const { data: ratingData } = await supabase.from("rating").select("value").eq("seller_id", userId);
        const avgRating =
          ratingData?.length > 0
            ? ratingData.reduce((sum, r) => sum + r.value, 0) / ratingData.length
            : 0;

        const { data: salesData } = await supabase.from("order").select("id").eq("seller_id", userId);

        setStats({ rating: avgRating.toFixed(1), totalSales: salesData?.length || 0 });
      }

      const { data: pendingData } = await supabase.from("pending_seller").select("*").eq("id", userId).single();
      if (pendingData) setApplied(true);

      setLoading(false);
    };

    checkStatus();
  }, []);

  const handleApply = async () => {
    if (!user) return;
    const { data, error } = await supabase.from("pending_seller").insert({ id: user.id });
    if (!error) setApplied(true);
  };

  if (loading) return <h3>Loading...</h3>;

  if (!isSeller) {
    return (
      <div className="seller-container">
        <div className="form-container">
          <h2>You are not a seller</h2>
          <p>Click the button below to apply for becoming a seller.</p>
          <button
            className={`seller-button ${applied ? 'disabled' : ''}`}
            onClick={handleApply}
            disabled={applied}
          >
            Apply as Seller
          </button>
          {applied && <p>Application submitted. An admin will contact you soon.</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="seller-container">
      <h2>Seller Profile</h2>
      <p>Welcome, {user?.email || "Seller"}!</p>

      <div className="seller-stats">
        <p>⭐ Rating: <strong>{stats.rating}</strong></p>
        <p>📦 Total Sales: <strong>{stats.totalSales}</strong></p>
      </div>

      <div className="button-container">
        <button className="seller-button" onClick={() => navigate("/seller/products")}>Products</button>
        <button className="seller-button" onClick={() => navigate("/messenger")}>Messages</button>
        <button className="seller-button">Sales Report</button>
      </div>
    </div>
  );
}

export default Seller;
