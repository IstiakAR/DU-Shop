import supabase from './supabase.jsx';

export async function fetchCategories() {
    const { data, error } = await supabase
        .from('category')
        .select('id, name');
    if (error) throw error;
    return data;
}

export async function fetchSubcategories(categoryId) {
    if (!categoryId) return [];
    const { data, error } = await supabase
        .from('subcategory')
        .select('id, name')
        .eq('cat_id', categoryId);
    if (error) throw error;
    return data;
}