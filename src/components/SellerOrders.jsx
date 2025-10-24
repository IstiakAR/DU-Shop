import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../supabase';
import '../styles/Admin.css';

function SellerOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeItem, setActiveItem] = useState(null);

  useEffect(() => {
    fetchSellerOrders();
  }, []);

  const fetchSellerOrders = async () => {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      
      if (!userData.user) {
        navigate('/login');
        return;
      }

      // Get seller ID and check if banned
      const { data: sellerData, error: sellerError } = await supabase
        .from('seller')
        .select('id, level')
        .eq('id', userData.user.id)
        .single();

      if (sellerError) throw sellerError;

      if (sellerData.level === -1) {
        alert('Your seller account has been banned. You cannot access order management.');
        setLoading(false);
        return;
      }

      // Get order items for this seller with comprehensive details
      const { data, error } = await supabase
        .from('order_item')
        .select(`
          id,
          quantity,
          price_at_purchase,
          delivery_status,
          delivered_at,
          order_id,
          order:order (
            id,
            created_at,
            status,
            user:user (
              name,
              email
            ),
            payment:payment (
              status,
              method
            )
          ),
          product:product (
            name,
            price
          )
        `)
        .eq('seller_id', sellerData.id);

      if (error) throw error;

      // Sort the data by order creation date (most recent first)
      const sortedData = data.sort((a, b) => {
        return new Date(b.order.created_at) - new Date(a.order.created_at);
      });

      // Group items by order for better display
      const groupedOrders = {};
      sortedData.forEach(item => {
        const orderId = item.order.id;
        if (!groupedOrders[orderId]) {
          groupedOrders[orderId] = {
            order_id: orderId,
            order_info: item.order,
            items: []
          };
        }
        groupedOrders[orderId].items.push({
          item_id: item.id,
          product_name: item.product.name,
          quantity: item.quantity,
          price: item.price_at_purchase,
          delivery_status: item.delivery_status,
          delivered_at: item.delivered_at,
          total: item.quantity * item.price_at_purchase
        });
      });

      setOrders(Object.values(groupedOrders));
    } catch (error) {
      console.error('Error fetching seller orders:', error);
      alert('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const updateItemStatus = async (itemId, newStatus) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const { data: sellerData } = await supabase
        .from('seller')
        .select('id')
        .eq('id', userData.user.id)
        .single();

      const { data, error } = await supabase.rpc('update_item_delivery_status', {
        p_item_id: itemId,
        p_new_status: newStatus,
        p_seller_id: sellerData.id
      });

      if (error) throw error;

      if (data.success) {
        alert('Item status updated successfully');
        fetchSellerOrders(); // Refresh the data
      } else {
        alert(data.error || 'Failed to update item status');
      }
    } catch (error) {
      console.error('Error updating item status:', error);
      alert('Failed to update item status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#f39c12';
      case 'on_the_way': return '#3498db';
      case 'delivered': return '#27ae60';
      case 'cancelled': return '#e74c3c';
      default: return '#95a5a6';
    }
  };

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

  if (loading) {
    return <div className="loading">Loading orders...</div>;
  }

  if (orders.length === 0) {
    return (
      <div className="seller-container">
        <div className="admin-title">
          <h3>No Orders Found</h3>
          <button onClick={() => navigate('/seller')} className="seller-button">
            Back to Seller Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="seller-container">
      <div className="seller-header">
        <h2 className="admin-title">My Order Items</h2>
        <button onClick={() => navigate('/seller')} className="seller-button">
          Back to Dashboard
        </button>
      </div>

      <table className="order-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Date</th>
            <th>Product</th>
            <th>Quantity</th>
            <th>Price</th>
            <th>Total</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => 
            order.items.map(item => (
              <tr key={`${order.order_id}-${item.item_id}`}>
                <td>#{order.order_id.slice(-8).toUpperCase()}</td>
                <td>
                  {order.order_info.user.name}
                  <br/>
                  <small>{order.order_info.user.email}</small>
                </td>
                <td>{new Date(order.order_info.created_at).toLocaleDateString()}</td>
                <td>{item.product_name}</td>
                <td>{item.quantity}</td>
                <td>{item.price} TK</td>
                <td>{item.total} TK</td>
                <td>
                  <span className={`status-badge status-${item.delivery_status.replace('_', '-')}`}>
                    {item.delivery_status.replace('_', ' ')}
                  </span>
                  {item.delivered_at && (
                    <>
                      <br/>
                      <small>Delivered: {new Date(item.delivered_at).toLocaleDateString()}</small>
                    </>
                  )}
                </td>
                <td>
                  {item.delivery_status === 'pending' && (
                    <button 
                      onClick={() => updateItemStatus(item.item_id, 'on_the_way')}
                      className="ship-order-btn"
                    >
                      Mark Shipped
                    </button>
                  )}
                  {item.delivery_status === 'on_the_way' && (
                    <button 
                      onClick={() => updateItemStatus(item.item_id, 'delivered')}
                      className="delivered-btn"
                    >
                      Mark Delivered
                    </button>
                  )}
                  {item.delivery_status === 'delivered' && (
                    <span className="approve-btn" style={{ cursor: 'default' }}>Completed</span>
                  )}
                  {item.delivery_status === 'cancelled' && (
                    <span className="cancel-order-btn" style={{ cursor: 'default' }}>Cancelled</span>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default SellerOrders;
