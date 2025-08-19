import { useState } from "react";
import supabase from "../supabase";
import "../styles/Admin.css";

function CategoriesPage() {
  const [categoryName, setCategoryName] = useState("");
  const [subcategories, setSubcategories] = useState([""]);
  const [loading, setLoading] = useState(false);

  const addSubcategoryField = () => {
    setSubcategories([...subcategories, ""]);
  };

  const handleSubcategoryChange = (index, value) => {
    const updated = [...subcategories];
    updated[index] = value;
    setSubcategories(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!categoryName.trim()) {
      alert("Category name is required");
      return;
    }

    setLoading(true);

    try {
      const { data: existingCategory, error: fetchError } = await supabase
        .from("category")
        .select("id")
        .eq("name", categoryName)
        .single();

      let categoryId;
      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

      if (existingCategory) {
        categoryId = existingCategory.id;
      } else {
        const { data: newCategory, error: addError } = await supabase
          .from("category")
          .insert([{ name: categoryName }])
          .select("id")
          .single();
        if (addError) throw addError;
        categoryId = newCategory.id;
      }

      const validSubs = subcategories.filter((s) => s.trim() !== "");
      if (validSubs.length > 0) {
        const subRows = validSubs.map((name) => ({
          name,
          cat_id: categoryId,
        }));

        const { error: subError } = await supabase
          .from("subcategory")
          .insert(subRows);

        if (subError) throw subError;
      }

      alert(existingCategory ? "Subcategories added successfully!" : "Category and subcategories added successfully!");

      setCategoryName("");
      setSubcategories([""]);
    } catch (err) {
      console.error("Error adding category:", err.message);
      alert("Failed to add category or subcategory. See console for details.");
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
