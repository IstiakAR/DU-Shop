import '../styles/OrderItem.css';
function OrderItem({ item }) {
  return (
    <div className="order-item-container">
        <div className="left-side">
            <img src={item.image} alt={item.name} />
            <span>{item.name}</span>
        </div>
        <div className="right-side">
            <span>{item.quantity} x {item.price} = {item.quantity * item.price} TK</span>
        </div>
    </div>
  );
}

export default OrderItem;
