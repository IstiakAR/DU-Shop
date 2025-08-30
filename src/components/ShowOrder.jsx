import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../supabase';
import '../styles/Admin.css';

function ShowOrder() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeOrder, setActiveOrder] = useState(null);

  useEffect(() => {
    fetchUserOrders();
  }, []);

  const fetchUserOrders = async () => {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      
      if (!userData.user) {
        navigate('/login');
        return;
      }

      // Get orders with comprehensive details using the view
      const { data, error } = await supabase
        .from('order_details')
        .select('*')
        .eq('customer_email', userData.user.email)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      alert('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!confirm('Are you sure you want to cancel this order? This will automatically create a refund request.')) return;

    try {
      const { data: userData } = await supabase.auth.getUser();
      
      // Cancel the order
      const { data, error } = await supabase.rpc('cancel_customer_order', {
        p_order_id: orderId,
        p_user_id: userData.user.id
      });

      if (error) throw error;

      if (data.success) {
        // If order cancellation is successful, automatically create a refund request
        const { data: refundData, error: refundError } = await supabase.rpc('create_refund_request', {
          p_order_id: orderId,
          p_user_id: userData.user.id
        });

        if (refundError) {
          console.error('Error creating refund request:', refundError);
          alert('Order cancelled successfully, but failed to create refund request. Please contact support.');
        } else if (refundData.success) {
          alert('Order cancelled successfully and refund request created. You will be notified once the refund is processed.');
        } else {
          alert('Order cancelled successfully, but refund request failed: ' + (refundData.error || 'Unknown error'));
        }
        
        fetchUserOrders(); // Refresh the orders
      } else {
        alert(data.error || 'Failed to cancel order');
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      alert('Failed to cancel order');
    }
  };

  // Removed handleRequestRefund function since refunds now happen automatically when cancelling orders

  const getOrderStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#f39c12';
      case 'confirmed': return '#3498db';
      case 'partially_delivered': return '#e67e22';
      case 'delivered': return '#27ae60';
      case 'cancelled': return '#e74c3c';
      case 'refunded': return '#9b59b6';
      default: return '#95a5a6';
    }
  };

  const getDeliveryStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#f39c12';
      case 'on_the_way': return '#3498db';
      case 'delivered': return '#27ae60';
      case 'cancelled': return '#e74c3c';
      default: return '#95a5a6';
    }
  };

  const canCancelOrder = (order) => {
    return order.order_status === 'pending' || 
           (order.order_status === 'confirmed' && order.shipped_items === 0);
  };

  // Remove the separate refund function since refunds should only happen through cancellation
  // const canRequestRefund = (order) => {
  //   return order.order_status === 'delivered' || order.order_status === 'partially_delivered';
  // };

  if (loading) {
    return <div className="loading">Loading orders...</div>;
  }

  if (orders.length === 0) {
    return (
      <div className="seller-container">
        <div className="admin-title">
          <h2>No Orders Found</h2>
          <p>You haven't placed any orders yet.</p>
          <button onClick={() => navigate('/')} className="seller-button">
            Start Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="seller-container">
      <div className="orders-header">
        <h2 className="admin-title">My Orders</h2>
        <button onClick={() => navigate('/')} className="seller-button">
          Back to Shop
        </button>
      </div>

      <table className="order-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Date</th>
            <th>Items</th>
            <th>Total Amount</th>
            <th>Order Status</th>
            <th>Payment Status</th>
            <th>Progress</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <>
              <tr key={order.order_id}>
                <td>#{order.order_id.slice(-8).toUpperCase()}</td>
                <td>{new Date(order.created_at).toLocaleDateString()}</td>
                <td>{order.total_items} items</td>
                <td>{order.total_amount} TK</td>
                <td>
                  <span 
                    className={`status-badge status-${order.order_status.replace('_', '-')}`}
                  >
                    {order.order_status.replace('_', ' ')}
                  </span>
                </td>
                <td>
                  <span 
                    className={`status-badge status-${order.payment_status}`}
                  >
                    {order.payment_status}
                  </span>
                </td>
                <td>{order.delivered_items}/{order.total_items} delivered</td>
                <td>
                  {canCancelOrder(order) && (
                    <button 
                      onClick={() => handleCancelOrder(order.order_id)}
                      className="cancel-order-btn"
                      style={{ marginRight: '5px' }}
                    >
                      Cancel & Refund
                    </button>
                  )}
                  <button 
                    onClick={() => setActiveOrder(activeOrder === order.order_id ? null : order.order_id)}
                    className="seller-button"
                  >
                    {activeOrder === order.order_id ? 'Hide' : 'Details'}
                  </button>
                </td>
              </tr>
              {activeOrder === order.order_id && (
                <tr>
                  <td colSpan="8">
                    <div className="order-details-expanded">
                      <h4>Order Items</h4>
                      <table className="order-table" style={{ marginTop: '10px', width: '100%' }}>
                        <thead>
                          <tr>
                            <th>Product</th>
                            <th>Seller</th>
                            <th>Quantity</th>
                            <th>Price</th>
                            <th>Total</th>
                            <th>Status</th>
                            <th>Delivered Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {order.items.map((item, index) => (
                            <tr key={index}>
                              <td>{item.product_name}</td>
                              <td>{item.seller_name}</td>
                              <td>{item.quantity}</td>
                              <td>{item.price} TK</td>
                              <td>{item.quantity * item.price} TK</td>
                              <td>
                                <span 
                                  className={`status-badge status-${item.delivery_status.replace('_', '-')}`}
                                >
                                  {item.delivery_status.replace('_', ' ')}
                                </span>
                              </td>
                              <td>
                                {item.delivered_at 
                                  ? new Date(item.delivered_at).toLocaleDateString()
                                  : '-'
                                }
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </td>
                </tr>
              )}
            </>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ShowOrder;
