import { useEffect, useState } from "react";
import supabase from "../supabase";
import "../styles/Admin.css";

function TotalProduct() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      // 1️⃣ Fetch all products
      const { data: productsData, error: prodError } = await supabase
        .from("product")
        .select(`
          id,
          name,
          price,
          stock,
          status,
          type,
          created_at,
          seller_id
        `);

      if (prodError) throw prodError;

      if (!productsData || productsData.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }

      // 2️⃣ Fetch user info for sellers
      const sellerIds = productsData.map(p => p.seller_id);

      const { data: usersData, error: userError } = await supabase
        .from("user")
        .select("id, name")
        .in("id", sellerIds);

      if (userError) throw userError;

      // 3️⃣ Map products with seller name
      const productsWithSeller = productsData.map(p => {
        const sellerUser = usersData.find(u => u.id === p.seller_id);
        return {
          ...p,
          sellerName: sellerUser?.name || "Unknown"
        };
      });

      setProducts(productsWithSeller);
    } catch (err) {
      console.error("Error fetching products:", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleProductStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'out-of-stock' ? 'active' : 'out-of-stock';
    const action = newStatus === 'out-of-stock' ? 'mark as out of stock' : 'mark as available';
    
    if (!window.confirm(`Are you sure you want to ${action}?`)) return;

    try {
      const { error } = await supabase
        .from("product")
        .update({ status: newStatus })
        .eq("id", id);
        
      if (error) throw error;

      setProducts(products.map(p => 
        p.id === id ? { ...p, status: newStatus } : p
      ));
    } catch (err) {
      console.error("Error updating product status:", err);
      alert("Failed to update product status.");
    }
  };

  const approveProduct = async (id) => {
    if (!window.confirm("Are you sure you want to approve this product?")) return;

    try {
      const { error } = await supabase
        .from("product")
        .update({ status: 'active' })
        .eq("id", id);
        
      if (error) throw error;

      setProducts(products.map(p => 
        p.id === id ? { ...p, status: 'active' } : p
      ));
      
      alert("Product approved successfully!");
    } catch (err) {
      console.error("Error approving product:", err);
      alert("Failed to approve product.");
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.type?.toLowerCase().includes(search.toLowerCase()) ||
      p.sellerName?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <p>Loading products...</p>;

  return (
    <div className="seller-container">
      <h2 className="admin-title">Total Products</h2>
      <input
        type="text"
        placeholder="Search by name, type, or seller"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="search-input"
      />
      <table className="order-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Status</th>
            <th>Type</th>
            <th>Seller</th>
            <th>Created</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.length > 0 ? (
            filteredProducts.map(p => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>${p.price}</td>
                <td>{p.stock}</td>
                <td>
                  <span className={`status-badge status-${p.status || 'pending'}`}>
                    {p.status || 'pending'}
                  </span>
                </td>
                <td>{p.type}</td>
                <td>{p.sellerName}</td>
                <td>{new Date(p.created_at).toLocaleDateString()}</td>
                <td>
                  {(p.status === 'pending') ? (
                    <button 
                      className="approve-btn"
                      onClick={() => approveProduct(p.id)}
                    >
                      Approve
                    </button>
                  ) : (
                    <button 
                      className={`${(p.status === 'out-of-stock') ? 'activate-btn' : 'deactivate-btn'}`}
                      onClick={() => toggleProductStatus(p.id, p.status)}
                    >
                      {p.status === 'out-of-stock' ? 'Mark Available' : 'Mark Out of Stock'}
                    </button>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" style={{ textAlign: "center" }}>
                No products found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default TotalProduct;
