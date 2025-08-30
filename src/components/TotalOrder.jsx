import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../supabase';
import '../styles/Admin.css';

function TotalOrder() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [refundRequests, setRefundRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      
      if (!userData.user) {
        navigate('/login');
        return;
      }

      // Verify admin access
      const { data: adminData, error: adminError } = await supabase
        .from('admin')
        .select('id')
        .eq('id', userData.user.id)
        .single();

      if (adminError) {
        alert('Admin access required');
        navigate('/');
        return;
      }

      // Fetch all orders with comprehensive details
      const { data: ordersData, error: ordersError } = await supabase
        .from('order_details')
        .select('*')
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // Fetch refund requests
      const { data: refundsData, error: refundsError } = await supabase
        .from('refund_request')
        .select(`
          refund_id,
          status,
          created_at,
          resolved_at,
          order:order (
            id,
            user:user (
              name,
              email
            )
          ),
          admin:admin (
            user:user (
              name
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (refundsError) throw refundsError;

      setOrders(ordersData || []);
      setRefundRequests(refundsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefundRequest = async (refundId, action) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      const { data, error } = await supabase.rpc('process_refund_request', {
        p_refund_id: refundId,
        p_admin_id: userData.user.id,
        p_action: action
      });

      if (error) throw error;

      if (data.success) {
        alert(`Refund request ${action} successfully`);
        fetchData(); // Refresh data
      } else {
        alert(data.error || `Failed to ${action} refund request`);
      }
    } catch (error) {
      console.error(`Error ${action}ing refund:`, error);
      alert(`Failed to ${action} refund request`);
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

  const getRefundStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#f39c12';
      case 'approved': return '#27ae60';
      case 'rejected': return '#e74c3c';
      default: return '#95a5a6';
    }
  };

  const filteredOrders = orders.filter(order =>
    order.order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customer_email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredRefunds = refundRequests.filter(refund =>
    refund.order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    refund.order.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    refund.order.user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="loading">Loading admin data...</div>;
  }

  return (
    <div className="seller-container">
      <div className="admin-header">
        <h2 className="admin-title">Order Management</h2>
        <button onClick={() => navigate('/admin')} className="seller-button">
          Back to Admin Dashboard
        </button>
      </div>

      <div className="admin-tabs" style={{ marginBottom: '20px' }}>
        <button 
          className={activeTab === 'orders' ? 'seller-button' : 'activate-btn'}
          onClick={() => setActiveTab('orders')}
          style={{ marginRight: '10px' }}
        >
          All Orders ({orders.length})
        </button>
        <button 
          className={activeTab === 'refunds' ? 'seller-button' : 'activate-btn'}
          onClick={() => setActiveTab('refunds')}
        >
          Refund Requests ({refundRequests.filter(r => r.status === 'pending').length})
        </button>
      </div>

      <input
        type="text"
        placeholder="Search by Order ID..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-input"
      />

      {activeTab === 'orders' && (
        <>
          <h3 className="admin-title">All Orders</h3>
          <table className="order-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Items</th>
                <th>Total Amount</th>
                <th>Order Status</th>
                <th>Payment Status</th>
                <th>Progress</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map(order => (
                  <tr key={order.order_id}>
                    <td>#{order.order_id.slice(-8).toUpperCase()}</td>
                    <td>{order.customer_name}<br/><small>{order.customer_email}</small></td>
                    <td>{new Date(order.created_at).toLocaleDateString()}</td>
                    <td>{order.total_items}</td>
                    <td>{order.total_amount} TK</td>
                    <td>
                      <span className={`status-badge status-${order.order_status.replace('_', '-')}`}>
                        {order.order_status.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge status-${order.payment_status}`}>
                        {order.payment_status} ({order.payment_method})
                      </span>
                    </td>
                    <td>{order.delivered_items}/{order.total_items} delivered</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center" }}>No orders found</td>
                </tr>
              )}
            </tbody>
          </table>
        </>
      )}

      {activeTab === 'refunds' && (
        <>
          <h3 className="admin-title">Refund Requests</h3>
          <table className="order-table">
            <thead>
              <tr>
                <th>Refund ID</th>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Status</th>
                <th>Request Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRefunds.length > 0 ? (
                filteredRefunds.map(refund => (
                  <tr key={refund.refund_id}>
                    <td>#{refund.refund_id.slice(-8).toUpperCase()}</td>
                    <td>#{refund.order.id.slice(-8).toUpperCase()}</td>
                    <td>{refund.order.user.name}<br/><small>{refund.order.user.email}</small></td>
                    <td>
                      <span className={`status-badge status-${refund.status}`}>
                        {refund.status}
                      </span>
                    </td>
                    <td>{new Date(refund.created_at).toLocaleDateString()}</td>
                    <td>
                      {refund.status === 'pending' ? (
                        <>
                          <button 
                            onClick={() => handleRefundRequest(refund.refund_id, 'approved')}
                            className="approve-btn"
                            style={{ marginRight: '5px' }}
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => handleRefundRequest(refund.refund_id, 'rejected')}
                            className="cancel-order-btn"
                          >
                            Reject
                          </button>
                        </>
                      ) : (
                        <span>
                          {refund.status}
                          {refund.resolved_at && (
                            <>
                              <br/>
                              <small>{new Date(refund.resolved_at).toLocaleDateString()}</small>
                            </>
                          )}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center" }}>No refund requests found</td>
                </tr>
              )}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

export default TotalOrder;
