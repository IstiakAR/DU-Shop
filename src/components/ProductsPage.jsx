import { useEffect, useState } from "react";
import supabase from "../supabase";
import { getUserID } from "../fetch";
import "../styles/Product.css";

function ProductPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const userId = await getUserID();

      // Get sellerId linked to userId
      const { data: sellerData, error: sellerError } = await supabase
        .from("seller")
        .select("id")
        .eq("id", userId) // seller.id is same as user.id if you designed like that
        .single();

      if (sellerError || !sellerData) {
        console.error("Seller not found", sellerError);
        setLoading(false);
        return;
      }

      // Fetch products for that seller
      const { data: productData, error: productError } = await supabase
        .from("product")
        .select("id, name, price, stock")
        .eq("seller_id", sellerData.id);

      if (productError) {
        console.error("Error fetching products", productError);
      } else {
        setProducts(productData);
      }
      setLoading(false);
    };

    fetchProducts();
  }, []);

  if (loading) {
    return <p>Loading products...</p>;
  }

  if (products.length === 0) {
    return <p>You have no products listed yet.</p>;
  }

  return (
    <div className="product-container">
      <h2>Your Products</h2>
      <table className="product-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Price</th>
            <th>Stock</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td>{p.name}</td>
              <td>${p.price}</td>
              <td>{p.stock}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ProductPage;
