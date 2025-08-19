import { useEffect, useState } from "react";
import supabase from "../supabase";

function Seller() {
  const [isSeller, setIsSeller] = useState(false);
  const [applied, setApplied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkStatus = async () => {
      setLoading(true);
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user) {
        console.error("User not logged in");
        setLoading(false);
        return;
      }
      const userId = userData.user.id;
      setUser(userData.user);

      // Check seller
      const { data: sellerData } = await supabase
        .from("seller")
        .select("*")
        .eq("id", userId)
        .single();
      if (sellerData) setIsSeller(true);

      // Check pending
      const { data: pendingData } = await supabase
        .from("pending_seller")
        .select("*")
        .eq("id", userId)
        .single();
      if (pendingData) setApplied(true);

      setLoading(false);
    };

    checkStatus();
  }, []);

  const handleApply = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("pending_seller")
      .insert({ id: user.id });

    if (error) {
      console.error("Error applying:", error.message);
    } else {
      setApplied(true);
      console.log("Application submitted:", data);
    }
  };

  if (loading) return <h3>Loading...</h3>;

  if (!isSeller)
    return (
      <div className="seller-container">
        <div className="form-container">
          <h2>You are not a seller</h2>
          <p>Click the button below to apply for becoming a seller.</p>
          <button
            className="submit-btn"
            onClick={handleApply}
            disabled={applied}
            style={{
              backgroundColor: applied ? "grey" : "",
              cursor: applied ? "not-allowed" : "pointer",
            }}
          >
            Apply as Seller
          </button>
          {applied && <p>Application submitted. An admin will contact you soon.</p>}
        </div>
      </div>
    );

  return (
    <div className="seller-container">
      <h2>Seller Profile</h2>
      <p>Welcome, {user?.email || "Seller"}!</p>
    </div>
  );
}

export default Seller;
