import { useState } from "react";
import supabase from "../supabase";
import "../styles/Admin.css";

function CategoriesPage() {
  const [categoryName, setCategoryName] = useState("");
  const [subcategories, setSubcategories] = useState([""]);
  const [loading, setLoading] = useState(false);

  // Add another subcategory input
  const addSubcategoryField = () => {
    setSubcategories([...subcategories, ""]);
  };

  // Handle subcategory text change
  const handleSubcategoryChange = (index, value) => {
    const updated = [...subcategories];
    updated[index] = value;
    setSubcategories(updated);
  };

  // Save category + subcategories
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!categoryName.trim()) {
      alert("Category name is required");
      return;
    }

    setLoading(true);

    try {
      // Insert category first
      const { data: categoryData, error: categoryError } = await supabase
        .from("category")
        .insert([{ name: categoryName }])
        .select("id")
        .single();

      if (categoryError) throw categoryError;

      const categoryId = categoryData.id;

      // Insert subcategories if provided
      const validSubs = subcategories.filter((s) => s.trim() !== "");
      if (validSubs.length > 0) {
        const subRows = validSubs.map((name) => ({
          name,
          category_id: categoryId,
        }));

        const { error: subError } = await supabase
          .from("subcategory")
          .insert(subRows);

        if (subError) throw subError;
      }

      alert("Category and subcategories added successfully!");

      // Reset form
      setCategoryName("");
      setSubcategories([""]);
    } catch (err) {
      console.error("Error adding category:", err.message);
      alert("Failed to add category. See console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-container">
      <h2 className="admin-title">Add New Category</h2>
      <form onSubmit={handleSubmit} className="admin-form">
        <div>
          <label>Category Name</label>
          <input
            type="text"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            placeholder="Enter category name"
            required
          />
        </div>

        <div>
          <label>Subcategories</label>
          {subcategories.map((sub, index) => (
            <input
              key={index}
              type="text"
              value={sub}
              onChange={(e) => handleSubcategoryChange(index, e.target.value)}
              placeholder={`Subcategory ${index + 1}`}
              style={{ marginBottom: "5px" }}
            />
          ))}
          <button
            type="button"
            className="submit-btn"
            onClick={addSubcategoryField}
            style={{ marginTop: "15px", padding: "8px 16px" }}
          >
            + Add Subcategory
          </button>
        </div>

        <button className="submit-btn" type="submit" disabled={loading}
        style={{ marginTop: "15px", padding: "8px 16px" }}
        >
          {loading ? "Saving..." : "Save Category"}
        </button>
      </form>
    </div>
  );
}

export default CategoriesPage;
