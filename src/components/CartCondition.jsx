import { getUserID } from "../fetch";
import supabase from "../supabase";

export const addToCart = async (id, value, type='plus') => {
    const userId = await getUserID();
    let cartId;
    const {data: cartData, error: cartError} = await supabase
        .from('cart')
        .select('cart_id')
        .eq('user_id', userId)
        .eq('status', 'active');
    
    if (cartError) throw new Error(`Cart query error: ${cartError.message}`);
    
    if (!cartData || cartData.length === 0) {
        const { data: newCart, error: createError } = await supabase
            .from('cart')
            .insert([{ user_id: userId, status: 'active' }])
            .select('cart_id');
        
        if (createError) throw new Error(`Create cart error: ${createError.message}`);
        if (!newCart || newCart.length === 0) throw new Error('No cart ID returned after creation');
        
        cartId = newCart[0].cart_id;
    } else {
        cartId = cartData[0].cart_id;
    }
    
    const {data: existingItem, error: checkError} = await supabase
        .from('cart_item')
        .select('quantity')
        .eq('cart_id', cartId)
        .eq('prod_id', id)
        .single();
    
    let newQuantity;
    if (!checkError && existingItem) {
        if (type === 'plus') {
            newQuantity = existingItem.quantity + value;
        } else if (type === 'minus') {
            newQuantity = Math.max(0, existingItem.quantity - value);
        } else if (type === 'set') {
            newQuantity = value;
        }
        if(newQuantity==0){
            const { error: deleteError } = await supabase
                .from('cart_item')
                .delete()
                .eq('cart_id', cartId)
                .eq('prod_id', id);
            if (deleteError) throw new Error(`Delete error: ${deleteError.message}`);
            console.log(`Removed item from cart`);
        }
        const { error: updateError } = await supabase
            .from('cart_item')
            .update({ quantity: newQuantity })
            .eq('cart_id', cartId)
            .eq('prod_id', id);
        
        if (updateError) throw new Error(`Update error: ${updateError.message}`);
        console.log(`Updated item quantity to ${newQuantity}`);
    } else {
        const { error: insertError } = await supabase
            .from('cart_item')
            .insert([{ cart_id: cartId, prod_id: id, quantity: value }]);
        
        if (insertError) throw new Error(`Insert error: ${insertError.message}`);
        console.log(`Added new item with quantity ${value}`);
    }
    
    return true;
};

export const clearCart = async () => {
    const userId = await getUserID();
    
    const {data: cartData, error: cartError} = await supabase
        .from('cart')
        .select('cart_id')
        .eq('user_id', userId)
        .eq('status', 'active');
    
    if (cartData && cartData.length > 0) {
        const cartId = cartData[0].cart_id;
        
        const { error: deleteItemsError } = await supabase
            .from('cart_item')
            .delete()
            .eq('cart_id', cartId);
        
        const { error: updateCartError } = await supabase
            .from('cart')
            .update({ status: 'completed' })
            .eq('cart_id', cartId);
        
        console.log('Cart cleared successfully');
        return true;
    }
    
    return false;
};