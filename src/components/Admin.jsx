import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Admin.css";

function Admin() {
    const navigate = useNavigate();

    return (
        <div style={{ height: "85vh", width: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
            <div className="admin-container">
                <h2 className="admin-title">Admin Dashboard</h2>
                <div className="admin-grid">
                    <button className="submit-btn" onClick={() => navigate("/admin/totalProducts")}>Products</button>
                    <button className="submit-btn" onClick={() => navigate("/admin/sellers")}>Sellers</button>
                    <button className="submit-btn" onClick={() => navigate("/admin/categories")}>Categories</button>
                    <button className="submit-btn" onClick={() => navigate("/admin/totalOrders")}>Orders</button>
                </div>
            </div>
        </div>
    );
}

export default Admin;
