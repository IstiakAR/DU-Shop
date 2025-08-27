import '../styles/Cart.css';
import CartItem from './CartItem';
import closeIcon from '../assets/exit.svg';
import { useState, useEffect } from 'react';
import { getUserID } from '../fetch';
import supabase from '../supabase';
import { useNavigate } from 'react-router-dom';

function Cart({handleCart}){
    const [cartItems, setCartItems] = useState([]);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [cartTotal, setCartTotal] = useState(0);
    const navigate = useNavigate();
    
    useEffect(() => {
        fetchCartItems();
        const interval = setInterval(fetchCartItems, 2000);
        return () => clearInterval(interval);
    }, [refreshTrigger]);

    const fetchCartItems = async () => {
        const userId = await getUserID();
        const {data: cartData, error: cartError} = await supabase
            .from('cart')
            .select('cart_id')
            .eq('user_id', userId)
            .eq('status', 'active');
        
        if (!cartData || cartData.length === 0) {
            const { data: newCart, error: createError } = await supabase
                .from('cart')
                .insert([
                    { user_id: userId, status: 'active' }
                ])
                .select('cart_id');
            
            setCartItems([]);
            setCartTotal(0);
            return;
        }
        
        const cartId = cartData[0].cart_id;
        
        const { data: cartItemsData, error: itemsError } = await supabase
            .from('cart_item')
            .select('prod_id, quantity')
            .eq('cart_id', cartId);

        if (!cartItemsData || cartItemsData.length === 0) {
            setCartItems([]);
            setCartTotal(0);
            return;
        }

        const productIds = cartItemsData.map(item => item.prod_id);
        const { data: productsData } = await supabase
            .from('product')
            .select('id, name, price, status')
            .in('id', productIds)
            .eq('status', 'active'); // Only get active products

        const { data: imagesData } = await supabase
            .from('product_image')
            .select('id, filepath')
            .in('id', productIds);

        const productsMap = {};
        if (productsData) {
            productsData.forEach(product => {
                productsMap[product.id] = product;
            });
        }

        const imagesMap = {};
        if (imagesData) {
            imagesData.forEach(img => {
                if (!imagesMap[img.id]) {
                    imagesMap[img.id] = img.filepath;
                }
            });
        }

        const combinedItems = cartItemsData.map(item => {
            const product = productsMap[item.prod_id] || { name: 'Unknown', price: 0 };
            return {
                id: item.prod_id,
                quantity: item.quantity,
                name: product.name,
                price: product.price,
                image: imagesMap[item.prod_id] 
                    ? `https://ursffahpdyihjraagbuz.supabase.co/storage/v1/object/public/product-image/${imagesMap[item.prod_id]}`
                    : "/DU-Shop.png"
            };
        });

        setCartItems(combinedItems);
        
        const total = combinedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        setCartTotal(total);
    }

    const handleCartUpdate = () => {
        setRefreshTrigger(prev => prev + 1);
    };
    
    const handleCheckout = () => {
        if(cartItems.length === 0) return;
        navigate("/order", { state: { cartItems } });
        handleCart();
    };

    return (
        <div className='cart-sidebar-container'>
            <div className='cart-sidebar'>
                <div className='cart-header'>
                    <h2>Cart</h2>
                    <div className='cart-close-button'>
                        <button className='cart-close-btn' onClick={handleCart}>
                            <img src={closeIcon} alt="Close Cart" style={{width: 30, height: 30}} />
                        </button>
                    </div>
                </div>
                <hr className="cart-divider" />
                <div>
                    {cartItems.map(item => (
                        <CartItem 
                            key={item.id} 
                            item={item}
                            onCartUpdate={handleCartUpdate}
                        />
                    ))}
                </div>
                <hr className="cart-divider" />
                <div className='total-container'>
                    <span className='total'>Total: {cartTotal.toFixed(2)} TK</span>
                </div>
                <hr className="cart-divider" />
                <div className='checkout'>
                    <button className='checkout-btn yellow-button' onClick={handleCheckout}>Checkout</button>
                </div>
            </div>
        </div>
    )
}

export default Cart;