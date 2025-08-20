import { useState, useEffect } from "react";
import supabase from "../supabase";
import "../styles/Admin.css";

function TotalSellers() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchSellers = async () => {
      setLoading(true);

      // --- Try embedded join (works if FK seller.id -> user.id is defined in Supabase) ---
      const { data: embedded, error: embedErr } = await supabase
        .from("seller")
        .select(`
          id,
          income,
          rating,
          level,
          user:user (
            name,
            email
          )
        `);

      if (!embedErr && embedded) {
        setRows(
          embedded.map((s) => ({
            id: s.id,
            name: s.user?.name || "",
            email: s.user?.email || "",
            income: s.income ?? 0,
            rating: s.rating ?? "N/A",
            level: s.level ?? 0,
          }))
        );
        setLoading(false);
        return;
      }

      // --- Fallback: manual join in two queries ---
      const { data: sellers, error: sellersErr } = await supabase
        .from("seller")
        .select("id, income, rating, level");

      if (sellersErr) {
        console.error("Error fetching sellers:", sellersErr.message);
        setRows([]);
        setLoading(false);
        return;
      }

      const ids = sellers.map((s) => s.id);
      let usersById = {};
      if (ids.length) {
        const { data: users, error: usersErr } = await supabase
          .from("user")
          .select("id, name, email")
          .in("id", ids);

        if (!usersErr && users) {
          usersById = Object.fromEntries(users.map((u) => [u.id, u]));
        }
      }

      setRows(
        sellers.map((s) => ({
          id: s.id,
          name: usersById[s.id]?.name || "",
          email: usersById[s.id]?.email || "",
          income: s.income ?? 0,
          rating: s.rating ?? "N/A",
          level: s.level ?? 0,
        }))
      );

      setLoading(false);
    };

    fetchSellers();
  }, []);

  if (loading) return <h3>Loading sellers...</h3>;

  const filtered = rows.filter((r) => {
    const q = search.toLowerCase();
    return (
      (r.name || "").toLowerCase().includes(q) ||
      (r.email || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="admin-container">
      <h2 className="admin-title">Total Sellers ({filtered.length})</h2>

      <input
        type="text"
        placeholder="Search by name or email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: "100%",
          maxWidth: 320,
          padding: "8px 12px",
          margin: "10px 0 16px",
          border: "1px solid #ccc",
          borderRadius: 8,
        }}
      />

      {filtered.length === 0 ? (
        <p>No sellers found.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={th}>Name</th>
              <th style={th}>Email</th>
              <th style={th}>Rating</th>
              <th style={th}>Income</th>
              <th style={th}>Level</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s.id}>
                <td style={td}>{s.name || "N/A"}</td>
                <td style={td}>{s.email || "N/A"}</td>
                <td style={td}>{s.rating}</td>
                <td style={td}>{s.income}</td>
                <td style={td}>{s.level}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// quick inline styles (so you don't need an extra css file)
const th = {
  border: "1px solid #ddd",
  padding: "10px",
  background: "#f5f5f5",
  textAlign: "left",
};
const td = {
  border: "1px solid #eee",
  padding: "10px",
};

export default TotalSellers;
