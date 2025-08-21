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

  const deleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      const { error } = await supabase.from("product").delete().eq("id", id);
      if (error) throw error;

      setProducts(products.filter(p => p.id !== id));
    } catch (err) {
      console.error("Error deleting product:", err);
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
                <td>{p.type}</td>
                <td>{p.sellerName}</td>
                <td>{new Date(p.created_at).toLocaleDateString()}</td>
                <td>
                  <button onClick={() => deleteProduct(p.id)}>Delete</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" style={{ textAlign: "center" }}>
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
