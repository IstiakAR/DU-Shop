import { useEffect, useState } from "react";
import supabase from "../supabase";
import { getUserID } from "../fetch";
import "../styles/Product.css";

function ProductPage() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

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

  if (loading) {
    return <p>Loading products...</p>;
  }

  if (products.length === 0) {
    return <p>You have no products listed yet.</p>;
  }

  return (
    <div className="product-container">
      <h2>Your Products</h2>

      <input
        type="text"
        placeholder="Search products..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="search-input"
      />

      <table className="product-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.map((p) => (
            <tr key={p.id}>
              <td>{p.name}</td>
              <td>${p.price}</td>
              <td>{p.stock}</td>
              <td>
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(p.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {filteredProducts.length === 0 && (
            <tr>
              <td colSpan="4">No products match your search.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ProductPage;
