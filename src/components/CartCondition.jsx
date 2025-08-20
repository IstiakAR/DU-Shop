import { getUserID } from "../fetch";
import supabase from "../supabase";

function CartCondition({ id, value }) {
}

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
            newQuantity = Math.max(1, existingItem.quantity - value);
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

export default CartCondition;
