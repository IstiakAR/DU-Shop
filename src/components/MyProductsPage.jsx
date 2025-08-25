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
        .select("id")
        .eq("id", userId)
        .single();

      if (sellerError || !sellerData) {
        setLoading(false);
        return;
      }

      const { data: productData, error: productError } = await supabase
        .from("product")
        .select("id, name, price, stock")
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

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    const { error } = await supabase.from("product").delete().eq("id", id);
    if (error) {
      console.error("Delete error:", error);
      alert("Failed to delete product.");
    } else {
      const updated = products.filter((p) => p.id !== id);
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
    const { error } = await supabase
      .from("product")
      .update({
        price: editForm.price,
        stock: editForm.stock,
      })
      .eq("id", id);

    if (error) {
      console.error("Update error:", error);
      alert("Failed to update product.");
    } else {
      const updated = products.map((p) =>
        p.id === id ? { ...p, price: editForm.price, stock: editForm.stock } : p
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
                <th className="actions-column">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => (
                <tr key={p.id}>
                  <td className="product-name-cell">{p.name}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="edit-btn"
                        onClick={() => navigate(`/update-product/${p.id}`)}
                      >
                        Edit
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(p.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan="2" className="no-products-message">No products match your search.</td>
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
