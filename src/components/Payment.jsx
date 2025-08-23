import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import supabase from "../supabase";
import { clearCart } from "./CartCondition";
import "../styles/Payment.css";

const paymentOptions = [
  { label: "bKash", value: "bkash" },
  { label: "Nagad", value: "nagad" },
  { label: "Debit Card", value: "debit_card" },
  { label: "Credit Card", value: "credit_card" },
];

function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId, paymentId, total } = location.state || {};

  const [selected, setSelected] = useState("bkash");
  const [phone, setPhone] = useState("");
  const [bankId, setBankId] = useState("");
  const [address, setAddress] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300);
  const [paymentExpired, setPaymentExpired] = useState(false);

  useEffect(() => {
    if (!orderId || paymentComplete || paymentExpired) return;

    const checkOrderStatus = async () => {
      try {
        const { data } = await supabase
          .from('order')
          .select('id')
          .eq('id', orderId)
          .single();

        if (!data) {
          setPaymentExpired(true);
          alert("Your session expired and the order was automatically cancelled. Stock has been restored.");
          return;
        }

        const { data: paymentData } = await supabase
          .from('payment')
          .select('status')
          .eq('pay_id', paymentId)
          .single();

        if (paymentData?.status === 'failed') {
          setPaymentExpired(true);
          alert("Payment session expired. Order was cancelled and stock restored.");
        }
      } catch (error) {
        console.error("Error checking order status:", error);
      }
    };

    checkOrderStatus();
    const statusInterval = setInterval(checkOrderStatus, 15000);

    return () => clearInterval(statusInterval);
  }, [orderId, paymentId, paymentComplete, paymentExpired]);

  useEffect(() => {
    if (!orderId || paymentComplete || paymentExpired) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handlePaymentTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [orderId, paymentComplete, paymentExpired]);

  useEffect(() => {
    if (!orderId || paymentComplete || paymentExpired) return;

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = 'Your payment is in progress. Are you sure you want to leave?';
      return e.returnValue;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [orderId, paymentComplete, paymentExpired]);

  const handlePaymentTimeout = async () => {
    setPaymentExpired(true);
    alert("Payment time expired. Order has been cancelled and stock has been restored.");
    navigate("/");
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    
    try {
      const { data: orderCheck } = await supabase
        .from('order')
        .select('id')
        .eq('id', orderId)
        .single();

      if (!orderCheck) {
        alert("Order has expired. Please try again.");
        navigate("/");
        return;
      }

      const { error: paymentError } = await supabase
        .from("payment")
        .update({
          status: "completed",
          method: selected,
          bank_id: bankId
        })
        .eq("pay_id", paymentId);

      if (paymentError) throw paymentError;

      const { error: deliveryError } = await supabase
        .from("delivery")
        .insert({
          order_id: orderId,
          address: address,
          phone: phone,
          delivery_status: "pending"
        });

      if (deliveryError) throw deliveryError;

      await clearCart();

      setTimeout(() => {
        setIsProcessing(false);
        setPaymentComplete(true);
      }, 2000);

    } catch (error) {
      console.error("Payment error:", error);
      alert("Payment failed. Please try again.");
      setIsProcessing(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!orderId || !paymentId) {
    navigate("/");
    return null;
  }

  if (paymentExpired) {
    return (
      <div className="payment-center">
        <div className="payment-container">
          <div className="payment-expired">
            <h2>Payment Expired!</h2>
            <p>Your payment session has expired. The order has been cancelled and stock has been restored.</p>
            <button onClick={() => navigate("/")} className="submit-btn">
              Return to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (paymentComplete) {
    return (
      <div className="payment-center">
        <div className="payment-container">
          <div className="payment-success">
            <h2>Payment Successful!</h2>
            <p>Your payment has been processed successfully.</p>
            <p>Order Total: {total?.toFixed(2)} TK</p>
            <button onClick={() => navigate("/")} className="submit-btn">
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

    return (
      <div className="payment-center">
        <div className="payment-container">
          <div className={`payment-timer ${timeLeft <= 60 ? 'warning' : ''}`}>
            <h3>Time remaining: {formatTime(timeLeft)}</h3>
            <p>Complete your payment before time expires</p>
          </div>        <form className="payment-form" onSubmit={handlePayment}>
          <div className="payment-field">
            <label className="field-label">Payment Method</label>
            <div className="payment-options-horizontal">
              {paymentOptions.map(option => (
                <label key={option.value} className="payment-option-label">
                  <input
                    type="radio"
                    name="payment"
                    value={option.value}
                    checked={selected === option.value}
                    onChange={() => setSelected(option.value)}
                    className="payment-radio"
                    required
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div className="payment-field">
            <label className="field-label">
              {selected === 'bkash' || selected === 'nagad' ? 'Account Number' : 'Card Number'}
            </label>
            <input required
              type="text"
              placeholder={selected === 'bkash' || selected === 'nagad' ? "Enter account number" : "Enter card number"}
              value={bankId}
              onChange={e => setBankId(e.target.value)}
              className="payment-input"
            />
          </div>
          
          <div className="payment-field">
            <label className="field-label">Phone Number</label>
            <input required
              type="text"
              placeholder="Enter phone number"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="payment-input"
            />
          </div>
          
          <div className="payment-field">
            <label className="field-label">Delivery Address</label>
            <input required
              type="text"
              placeholder="Enter address"
              value={address}
              onChange={e => setAddress(e.target.value)}
              className="payment-input"
            />
          </div>

          <div className="payment-summary">
            <h3>Order Summary</h3>
            <p>Total Amount: {total?.toFixed(2)} TK</p>
          </div>
          
          <button 
            type="submit" 
            className="submit-btn"
            disabled={isProcessing || timeLeft <= 0}
          >
            {isProcessing ? "Processing..." : "Proceed to Pay"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Payment;