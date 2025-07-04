import '../styles/Cart.css';
import CartItem from './CartItem';
import closeIcon from '../assets/exit.svg';


function Cart({handleCart}){
    return (
        <div className='cart-sidebar-container'>
            <div className='cart-sidebar'>
                <div className='cart-header'>
                    <h2>Cart</h2>
                    <div className='close-button'>
                        <button className='close-btn' onClick={handleCart}>
                            <img src={closeIcon} alt="Close Cart" style={{width: 30, height: 30}} />
                        </button>
                    </div>
                </div>
                <hr className="cart-divider" />
                <div>
                    <CartItem
                        image="/DU-Shop.png"
                        title="Sample Item"
                        price="9.99"
                        quantity={2}
                    />
                </div>
                <hr className="cart-divider" />
                <div className='total-container'>
                    <span className='total'>Total: $0.00</span>
                </div>
                <hr className="cart-divider" />
                <div className='checkout'>
                    <button className='checkout-btn yellow-button'>Checkout</button>
                </div>
            </div>
        </div>
    )
}

export default Cart;