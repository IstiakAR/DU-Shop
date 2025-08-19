import { useNavigate } from "react-router-dom";
import "../styles/Admin.css";

function SellerManagement() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        height: "85vh",
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div className="admin-container">
        <h2 className="admin-title">Seller Management</h2>
        <div className="admin-grid">
          <button
            className="submit-btn"
            onClick={() => navigate("/admin/sellers/pending")}
          >
            Pending Sellers
          </button>
          <button
            className="submit-btn"
            onClick={() => navigate("/admin/sellers/total")}
          >
            Total Sellers
          </button>
        </div>
      </div>
    </div>
  );
}

export default SellerManagement;
