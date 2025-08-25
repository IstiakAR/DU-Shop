import { useState, useEffect } from "react";
import supabase from "../supabase";
import "../styles/Admin.css";
import "../styles/CategoriesPage.css";

function CategoriesPage() {
  const [categoryName, setCategoryName] = useState("");
  const [subcategories, setSubcategories] = useState([""]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categorySubcategories, setCategorySubcategories] = useState([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("category")
        .select("*")
        .order("name");
      
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      alert("Failed to load categories");
    }
  };

  const fetchSubcategories = async (categoryId) => {
    try {
      const { data, error } = await supabase
        .from("subcategory")
        .select("*")
        .eq("cat_id", categoryId)
        .order("name");
      
      if (error) throw error;
      setCategorySubcategories(data || []);
    } catch (error) {
      console.error("Error fetching subcategories:", error);
      alert("Failed to load subcategories");
    }
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    fetchSubcategories(category.id);
  };

  const deleteCategory = async (categoryId) => {
    if (!window.confirm("Are you sure you want to delete this category? This will also delete all its subcategories.")) {
      return;
    }

    try {
      setLoading(true);
      
      // First delete all subcategories
      const { error: subError } = await supabase
        .from("subcategory")
        .delete()
        .eq("cat_id", categoryId);
      
      if (subError) throw subError;

      // Then delete the category
      const { error: catError } = await supabase
        .from("category")
        .delete()
        .eq("id", categoryId);
      
      if (catError) throw catError;

      alert("Category deleted successfully!");
      fetchCategories();
      
      // Clear selection if deleted category was selected
      if (selectedCategory && selectedCategory.id === categoryId) {
        setSelectedCategory(null);
        setCategorySubcategories([]);
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      alert("Failed to delete category");
    } finally {
      setLoading(false);
    }
  };

  const deleteSubcategory = async (subcategoryId) => {
    if (!window.confirm("Are you sure you want to delete this subcategory?")) {
      return;
    }

    try {
      setLoading(true);
      
      const { error } = await supabase
        .from("subcategory")
        .delete()
        .eq("id", subcategoryId);
      
      if (error) throw error;

      alert("Subcategory deleted successfully!");
      
      // Refresh subcategories for current category
      if (selectedCategory) {
        fetchSubcategories(selectedCategory.id);
      }
    } catch (error) {
      console.error("Error deleting subcategory:", error);
      alert("Failed to delete subcategory");
    } finally {
      setLoading(false);
    }
  };

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
      fetchCategories();
    } catch (err) {
      console.error("Error adding category:", err.message);
      alert("Failed to add category or subcategory. See console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-container categories-page-container">
      <h2 className="admin-title">Manage Categories</h2>
      
      <div className="add-category-section">
        <h3>Add New Category</h3>
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

      <div className="categories-management">
        <div className="categories-list">
          <h3>Existing Categories</h3>
          <div className="list-container">
            {categories.length === 0 ? (
              <p className="empty-message">No categories found</p>
            ) : (
              categories.map((category) => (
                <div 
                  key={category.id} 
                  className={`category-item ${selectedCategory?.id === category.id ? 'selected' : ''}`}
                  onClick={() => handleCategorySelect(category)}
                >
                  <span className="category-name">
                    {category.name}
                  </span>
                  <button
                    className="delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteCategory(category.id);
                    }}
                    disabled={loading}
                  >
                    Delete
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="subcategories-list">
          <h3>Subcategories {selectedCategory && `(${selectedCategory.name})`}</h3>
          <div className="list-container">
            {!selectedCategory ? (
              <p className="empty-message">Select a category to view subcategories</p>
            ) : categorySubcategories.length === 0 ? (
              <p className="empty-message">No subcategories found</p>
            ) : (
              categorySubcategories.map((subcategory) => (
                <div 
                  key={subcategory.id} 
                  className="subcategory-item"
                >
                  <span className="subcategory-name">{subcategory.name}</span>
                  <button
                    className="delete-btn"
                    onClick={() => deleteSubcategory(subcategory.id)}
                    disabled={loading}
                  >
                    Delete
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CategoriesPage;
