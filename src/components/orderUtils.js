import supabase from "../supabase";

// Restock products by adding back the quantity to inventory
export const restockProducts = async (cartItems) => {
    try {
        for (const item of cartItems) {
            // First get the current stock
            const { data: productData, error: fetchError } = await supabase
                .from("product")
                .select("stock")
                .eq("id", item.id)
                .single();

            if (fetchError) {
                console.error(`Error fetching stock for product ${item.id}:`, fetchError);
                throw fetchError;
            }

            // Calculate new stock
            const newStock = productData.stock + item.quantity;

            // Update the stock
            const { error: updateError } = await supabase
                .from("product")
                .update({ stock: newStock })
                .eq("id", item.id);

            if (updateError) {
                console.error(`Error restocking product ${item.id}:`, updateError);
                throw updateError;
            }
        }
        console.log("Products restocked successfully");
        return true;
    } catch (error) {
        console.error("Error during restocking:", error);
        throw error;
    }
};

// Clean up expired order (delete order, order items, and update payment status)
export const cleanupExpiredOrder = async (orderId, paymentId, cartItems) => {
    try {
        // Update payment status to failed
        await supabase
            .from("payment")
            .update({ status: "failed" })
            .eq("pay_id", paymentId);

        // Delete order items
        await supabase
            .from("order_item")
            .delete()
            .eq("order_id", orderId);

        // Delete order
        await supabase
            .from("order")
            .delete()
            .eq("id", orderId);

        // Restock products
        await restockProducts(cartItems);

        console.log("Expired order cleaned up successfully");
        return true;
    } catch (error) {
        console.error("Error cleaning up expired order:", error);
        throw error;
    }
};

// Validate stock availability for cart items
export const validateStockAvailability = async (cartItems) => {
    try {
        const ids = cartItems.map(item => item.id);
        const { data, error } = await supabase
            .from("product")
            .select("id, stock, name")
            .in("id", ids);

        if (error) throw error;

        const outOfStockItems = cartItems.filter(cartItem => {
            const dbItem = data.find(d => d.id === cartItem.id);
            return !dbItem || cartItem.quantity > dbItem.stock;
        });

        return {
            isValid: outOfStockItems.length === 0,
            outOfStockItems,
            availableStock: data
        };
    } catch (error) {
        console.error("Error validating stock:", error);
        throw error;
    }
};
