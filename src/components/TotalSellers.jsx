import { useState, useEffect } from "react";
import supabase from "../supabase";
import "../styles/Admin.css";

function TotalSellers() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchSellers();
  }, []);

  const fetchSellers = async () => {
    setLoading(true);

    // Try embedded join (FK seller.id -> user.id)
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

    console.error("Error fetching sellers:", embedErr?.message);
    setRows([]);
    setLoading(false);
  };

  // Ban/Unban seller
  const toggleSellerBan = async (sellerId, currentLevel) => {
    const isBanned = currentLevel === -1;
    const action = isBanned ? "unban" : "ban";
    const newLevel = isBanned ? 1 : -1;
    
    const confirmAction = window.confirm(`Are you sure you want to ${action} this seller?`);
    if (!confirmAction) return;

    const { error } = await supabase
      .from("seller")
      .update({ level: newLevel })
      .eq("id", sellerId);

    if (error) {
      console.error(`Error ${action}ning seller:`, error);
      alert(`Failed to ${action} seller`);
    } else {
      // Update the local state
      setRows(rows.map(s => 
        s.id === sellerId 
          ? { ...s, level: newLevel }
          : s
      ));
    }
  };

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

      {/* Search input */}
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
              <th style={th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s.id} style={{
                opacity: s.level === -1 ? 0.6 : 1,
                backgroundColor: s.level === -1 ? '#ffebee' : 'transparent'
              }}>
                <td style={td}>{s.name || "N/A"}</td>
                <td style={td}>{s.email || "N/A"}</td>
                <td style={td}>{s.rating}</td>
                <td style={td}>{s.income}</td>
                <td style={td}>
                  <span style={{
                    color: s.level === -1 ? '#d32f2f' : '#2e7d32',
                    fontWeight: s.level === -1 ? 'bold' : 'normal'
                  }}>
                    {s.level === -1 ? 'BANNED' : s.level}
                  </span>
                </td>
                <td style={td}>
                  <button
                    className={`seller-button ${s.level === -1 ? 'unban-btn' : 'ban-btn'}`}
                    onClick={() => toggleSellerBan(s.id, s.level)}
                    style={{
                      backgroundColor: s.level === -1 ? '#2e7d32' : '#d32f2f',
                    }}
                  >
                    {s.level === -1 ? 'Unban' : 'Ban'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// Inline styles for table cells
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
