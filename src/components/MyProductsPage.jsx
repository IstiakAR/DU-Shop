import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../supabase";
import { getUserID } from "../fetch";
import "../styles/Product.css";
import "../styles/Admin.css";
import "../styles/MyProductsPage.css";

function ProductPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ price: "", stock: "" });

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const userId = await getUserID();

      const { data: sellerData, error: sellerError } = await supabase
        .from("seller")
        .select("id, level")
        .eq("id", userId)
        .single();

      if (sellerError || !sellerData) {
        setLoading(false);
        return;
      }

      // Check if seller is banned
      if (sellerData.level === -1) {
        alert("Your seller account has been banned. You cannot access product management.");
        setLoading(false);
        return;
      }

      const { data: productData, error: productError } = await supabase
        .from("product")
        .select("id, name, price, stock, status")
        .eq("seller_id", sellerData.id);

      if (productError) {
        console.error("Error fetching products", productError);
      } else {
        setProducts(productData);
        setFilteredProducts(productData);
      }
      setLoading(false);
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const filtered = products.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [search, products]);

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'out-of-stock' ? 'active' : 'out-of-stock';
    const action = newStatus === 'out-of-stock' ? 'mark as out of stock' : 'mark as available';
    
    if (!window.confirm(`Are you sure you want to ${action}?`)) return;

    const { error } = await supabase
      .from("product")
      .update({ status: newStatus })
      .eq("id", id);
      
    if (error) {
      console.error("Status update error:", error);
      alert("Failed to update product status.");
    } else {
      const updated = products.map((p) => 
        p.id === id ? { ...p, status: newStatus } : p
      );
      setProducts(updated);
      setFilteredProducts(updated);
    }
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setEditForm({ price: product.price, stock: product.stock });
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({ price: "", stock: "" });
  };

  const handleSave = async (id) => {
    const newStock = parseInt(editForm.stock);
    const currentProduct = products.find(p => p.id === id);
    let newStatus = currentProduct.status;
    
    // Only automatically change status in specific cases:
    // 1. If stock becomes 0, mark as out-of-stock
    // 2. If stock increases from 0 and current status is out-of-stock, mark as active
    if (newStock === 0) {
      newStatus = 'out-of-stock';
    } else if (newStock > 0 && currentProduct.status === 'out-of-stock') {
      // Only change to active if it was out-of-stock due to no stock
      // If admin manually marked it out-of-stock, they need to manually change it back
      newStatus = 'active';
    }

    const { error } = await supabase
      .from("product")
      .update({
        price: editForm.price,
        stock: editForm.stock,
        status: newStatus
      })
      .eq("id", id);

    if (error) {
      console.error("Update error:", error);
      alert("Failed to update product.");
    } else {
      const updated = products.map((p) =>
        p.id === id ? { ...p, price: editForm.price, stock: editForm.stock, status: newStatus } : p
      );
      setProducts(updated);
      setFilteredProducts(updated);
      setEditingId(null);
      setEditForm({ price: "", stock: "" });
    }
  };

  if (loading) {
    return (
      <div className="my-products-loading-wrapper">
        <div className="admin-container">
          <h2 className="admin-title">Loading products...</h2>
        </div>
      </div>
    );
  }
  return (
    <div className="my-products-page-wrapper">
      <div className="admin-container">
        <h2 className="my-products-header">My Products</h2>
        
        <div className="my-products-stats">
          <div className="stat-card">
            <h3>{products.length}</h3>
            <p>Total Products</p>
          </div>
          <div 
            className="stat-card add-product-card"
            onClick={() => navigate('/add-product')}
          >
            <h3>+</h3>
            <p>Add Product</p>
          </div>
        </div>
        
        <div className="my-products-search-section">
          <div className="search-wrapper">
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <div className="products-table-container">
          <table className="product-table">
            <thead>
              <tr>
                <th className="product-name-column">Product</th>
                <th className="product-price-column">Price</th>
                <th className="product-stock-column">Stock</th>
                <th className="product-status-column">Status</th>
                <th className="actions-column">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => (
                <tr key={p.id}>
                  <td className="product-name-cell">{p.name}</td>
                  <td className="product-price-cell">${p.price}</td>
                  <td className="product-stock-cell">{p.stock}</td>
                  <td className="product-status-cell">
                    <span className={`status-badge status-${p.status}`}>
                      {p.status || 'pending'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="edit-btn"
                        onClick={() => navigate(`/update-product/${p.id}`)}
                      >
                        Edit
                      </button>
                      <button
                        className={`toggle-status-btn ${p.status === 'out-of-stock' ? 'activate-btn' : 'deactivate-btn'}`}
                        onClick={() => handleToggleStatus(p.id, p.status)}
                      >
                        {p.status === 'out-of-stock' ? 'Mark Available' : 'Mark Out of Stock'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan="5" className="no-products-message">No products match your search.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ProductPage;
