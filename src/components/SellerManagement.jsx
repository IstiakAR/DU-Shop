import { useNavigate } from "react-router-dom";
import "../styles/Admin.css";
import "../styles/SellerManagement.css";

function SellerManagement() {
  const navigate = useNavigate();

  return (
    <div className="management-container">
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