import { useState, useEffect } from "react";
import supabase from "../supabase";
import "../styles/Admin.css";

function TotalSellers() {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSellers = async () => {
      const { data, error } = await supabase
        .from("seller")
        .select("id, income, rating, level");

      if (error) console.error(error.message);
      setSellers(data || []);
      setLoading(false);
    };

    fetchSellers();
  }, []);

  if (loading) return <h3>Loading sellers...</h3>;

  return (
    <div className="admin-container">
      <h2 className="admin-title">Total Sellers</h2>
      {sellers.length === 0 ? (
        <p>No sellers found.</p>
      ) : (
        <ul>
          {sellers.map((seller) => (
            <li key={seller.id}>
              {seller.id} - Rating: {seller.rating || "N/A"}, Income:{" "}
              {seller.income || 0}, Level: {seller.level || 0}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default TotalSellers;
