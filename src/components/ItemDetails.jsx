import "../styles/ItemDetails.css";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import supabase from "../supabase";
import MessageBox from "./MessageBox";
import { getUserID } from "../fetch";
import { addToCart } from "./CartCondition";

function Star({ filled, onClick, size = 22 }) {
  return (
    <svg
      onClick={onClick}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      style={{ cursor: onClick ? "pointer" : "default", marginRight: 4 }}
      fill={filled ? "#f5b50a" : "none"}
      stroke="#f5b50a"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 15 9 22 9 17 14 19 21 12 17 5 21 7 14 2 9 9 9" />
    </svg>
  );
}

function StarRow({ value = 0, onChange }) {
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} filled={i <= value} onClick={onChange ? () => onChange(i) : undefined} />
      ))}
    </div>
  );
}

export default function ItemDetails() {
  const { id: productID } = useParams();
  const [currentImage, setCurrentImage] = useState(0);
  const [tabContent, setTabContent] = useState("");
  const [product, setProduct] = useState(null);
  const [images, setImages] = useState([]);
  const [details, setDetails] = useState({});
  const [reviews, setReviews] = useState([]);
  const [user, setUser] = useState(null);

  const [newReview, setNewReview] = useState("");
  const [rating, setRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  const storageBase =
    "https://ursffahpdyihjraagbuz.supabase.co/storage/v1/object/public/product-image";

  const getImageUrl = (filepath) => `${storageBase}/${filepath}`;
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (!error && user) {
          setUser(user);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (!productID) return;
    (async () => {
      const { data, error } = await supabase
        .from("product")
        .select("id, name, price, stock, status, seller_id")
        .eq("id", productID)
        .single();

      if (!error && data) {
        setProduct(data);
      }
    })();
  }, [productID]);

  // Images
  useEffect(() => {
    if (!product?.id) return;
    (async () => {
      const { data, error } = await supabase
        .from("product_image")
        .select("filepath, position")
        .eq("id", product.id)
        .order("position", { ascending: true });

      if (!error && data) setImages(data);
    })();
  }, [product?.id]);

  // Details/specs
  useEffect(() => {
    if (!product?.id) return;
    (async () => {
      const { data, error } = await supabase
        .from("product_details")
        .select("description, detail, specs")
        .eq("id", product.id)
        .single();

      if (!error && data) {
        setDetails(data);
        setTabContent(data?.detail || "");
      }
    })();
  }, [product?.id]);

  // Reviews
  useEffect(() => {
    if (!productID) return;
    (async () => {
      const { data, error } = await supabase
        .from("review")
        .select(
          `
          comment,
          rating,
          created_at,
          user:user_id(id, name, email)
        `
        )
        .eq("prod_id", productID)
        .order("created_at", { ascending: false });

      if (!error && data) setReviews(data);
    })();
  }, [productID]);

  const avgRating = useMemo(() => {
    if (!reviews.length) return 0;
    const sum = reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
    return Math.round((sum / reviews.length) * 10) / 10;
  }, [reviews]);

  async function handleAddReview() {
    if (!user) {
      alert("You must be logged in to leave a review.");
      return;
    }
    if (!newReview.trim()) {
      alert("Please write something before submitting.");
      return;
    }
    if (!rating) {
      alert("Please choose a rating.");
      return;
    }
    setSubmittingReview(true);
    const { error } = await supabase.from("review").insert([
      {
        prod_id: productID,
        user_id: user.id,
        comment: newReview.trim(),
        rating: rating,
      },
    ]);
    setSubmittingReview(false);

    if (error) {
      console.error("Error adding review:", error.message);
      alert(error.message);
      return;
    }

    setReviews((prev) => [
      {
        comment: newReview.trim(),
        rating,
        created_at: new Date().toISOString(),
        user: { id: user.id, name: user.user_metadata?.name || null, email: user.email },
      },
      ...prev,
    ]);
    setNewReview("");
    setRating(5);
  }

  async function handleAddToCart() {
    if (!user) {
      alert("You must be logged in to add items to cart.");
      return;
    }
    setAddingToCart(true);
    try {
      await addToCart(productID, 1, 'plus');
      alert("Item added to cart successfully!");
    } catch (error) {
      if (error.message.includes('your own product')) {
        alert('You cannot add your own product to the cart.');
      } else {
        console.error('Error adding to cart:', error);
        alert('Failed to add item to cart. Please try again.');
      }
    } finally {
      setAddingToCart(false);
    }
  }

  return (
    <div className="container">
      <div className="top-part">
        <div className="picture-container">
          <div className="picture-bar">
            {images.map((img, idx) => (
              <img
                key={`${img.filepath}-${idx}`}
                src={getImageUrl(img.filepath)}
                alt={`thumb-${idx}`}
                onClick={() => setCurrentImage(idx)}
              />
            ))}
          </div>

          <div className="picture-area">
            {images.length > 0 ? (
              <img
                src={getImageUrl(images[currentImage]?.filepath)}
                alt={product?.name || "Item"}
                className="main-picture"
              />
            ) : (
              <span style={{ color: "#888" }}>No image available</span>
            )}
          </div>
        </div>

        <div className="info-container">
          <h2>{product?.name || "Item"}</h2>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <StarRow value={Math.round(avgRating)} />
            <span style={{ color: "#555" }}>
              {avgRating ? `${avgRating}/5` : "No ratings yet"}
              {reviews.length ? ` • ${reviews.length} review${reviews.length > 1 ? "s" : ""}` : ""}
            </span>
          </div>

          <div className="price-stock-row">
            <span className="price">Price: ₹{product?.price ?? "-"}</span>
            <span className="divider"> | </span>
            <span className="stock">Stock: {product?.stock ?? "-"}</span>
            {product?.status && (
              <>
                <span className="divider"> | </span>
                <span className={`status-indicator status-${product.status}`}>
                  {product.status === 'out-of-stock' ? 'Out of Stock' : 
                   product.status === 'pending' ? 'Pending Approval' : 
                   'Available'}
                </span>
              </>
            )}
          </div>

          {/* Show warning if product is not active */}
          {product?.status === 'pending' && (
            <div style={{ 
              backgroundColor: '#fff3cd', 
              color: '#856404', 
              padding: '10px', 
              borderRadius: '5px', 
              margin: '10px 0',
              border: '1px solid #ffeaa7'
            }}>
              This product is pending approval and is not available for purchase.
            </div>
          )}
          
          {product?.status === 'out-of-stock' && (
            <div style={{ 
              backgroundColor: '#f8d7da', 
              color: '#721c24', 
              padding: '10px', 
              borderRadius: '5px', 
              margin: '10px 0',
              border: '1px solid #f5c6cb'
            }}>
              This product is currently out of stock.
            </div>
          )}

          <p style={{ marginTop: 8 }}>{details?.description || "Description will be here soon."}</p>

          {/* Add to Cart Button */}
          {user && product?.status === 'active' && product?.stock > 0 && (
            <button 
              className="add-cart-btn" 
              onClick={handleAddToCart}
              disabled={addingToCart || user.id === product?.seller_id}
              style={{
                backgroundColor: addingToCart || user.id === product?.seller_id ? '#ccc' : '#2d1972',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '6px',
                fontSize: '16px',
                fontWeight: '500',
                cursor: addingToCart || user.id === product?.seller_id ? 'not-allowed' : 'pointer',
                marginTop: '16px',
                marginBottom: '16px',
                opacity: addingToCart || user.id === product?.seller_id ? 0.6 : 1,
                transition: 'all 0.2s'
              }}
            >
              {addingToCart ? 'Adding...' : 'Add to Cart'}
            </button>
          )}

          {product?.seller_id && user && user.id !== product.seller_id && (
            <MessageBox
              productId={product.id}
              sellerId={product.seller_id}
              user={user}
              buttonLabel="Message Seller"
            />
          )}
        </div>
      </div>

      {/* Details / Specs */}
      <div className="details-container">
        <div className="tab-bar">
          <span onClick={() => setTabContent(details.detail || "No details available.")}>Details</span>
          <span onClick={() => setTabContent(details.specs || "No specifications available.")}>Specs</span>
        </div>
        <div className="tab-content">
          <span>{tabContent}</span>
        </div>
      </div>

      {/* Reviews */}
      <div className="review-container details-container">
        <h2>Reviews</h2>

        {user ? (
          <div className="add-review">
            <div style={{ marginBottom: 8 }}>
              <span style={{ marginRight: 8, fontWeight: 600 }}>Your rating:</span>
              <StarRow value={rating} onChange={setRating} />
            </div>
            <textarea
              value={newReview}
              onChange={(e) => setNewReview(e.target.value)}
              placeholder="Share your experience…"
              rows={4}
            />
            <button onClick={handleAddReview} disabled={submittingReview}>
              {submittingReview ? "Submitting…" : "Submit Review"}
            </button>
          </div>
        ) : (
          <p>You must be logged in to leave a review.</p>
        )}

        <div className="reviews-list">
          {reviews.length ? (
            reviews.map((r, idx) => {
              const displayName = r.user?.name || r.user?.email || r.user?.id?.slice(0, 6) || "User";
              return (
                <div key={idx} className="review-item">
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <StarRow value={r.rating || 0} />
                    <strong>{displayName}</strong>
                    <small style={{ color: "#777" }}>
                      {new Date(r.created_at).toLocaleString()}
                    </small>
                  </div>
                  <p style={{ whiteSpace: "pre-wrap" }}>{r.comment}</p>
                </div>
              );
            })
          ) : (
            <p>No reviews yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
