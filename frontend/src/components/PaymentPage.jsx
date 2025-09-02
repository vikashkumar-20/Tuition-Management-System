import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const PaymentPage = () => {
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const location = useLocation();
  const navigate = useNavigate();
  const auth = getAuth();
  const user = auth.currentUser;

  // Extract state from location or localStorage fallback
  const paymentData = {
    ...(location.state || {}),
    ...(localStorage.getItem('paymentData') ? JSON.parse(localStorage.getItem('paymentData')) : {}),
  };
  
  const { materialId, type, pathname = '/', materialData = {} } = paymentData;
  const { className, subject } = materialData;

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handlePayment = async () => {
    setLoading(true);
    setErrorMessage("");
  
    try {
      if (!className || !subject) {
        setErrorMessage('Missing class or subject. Please try again from the material page.');
        setLoading(false);
        return;
      }
  
      const { data } = await axios.post('http://localhost:5000/api/payment/create-order', { amount: 1 });
      const { amount, orderId, currency } = data;
  
      const generatedMaterialId = materialId || uuidv4();
      console.log("Generated Material ID:", generatedMaterialId);
  
      if (!window.Razorpay) {
        setErrorMessage("Razorpay SDK not loaded. Please refresh and try again.");
        setLoading(false);
        return;
      }
  
      const options = {
        key: "rzp_test_L14lNpKp0ynJuc", // Razorpay test key
        amount,
        currency,
        order_id: orderId,
        name: "CK Study Classes",
        description: "Download PDF Access",
        handler: async function (response) {
          setLoading(true);
  
          const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = response;
  
          if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
            setErrorMessage('Incomplete payment details received. Please try again.');
            setLoading(false);
            return;
          }
  
          const paymentDetails = {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            userId: user.uid,
            materialId: generatedMaterialId,
            type,
            className,
            subject,
          };
  
          try {
            const successResponse = await axios.post(
              'http://localhost:5000/api/payment/payment-success',
              paymentDetails,
              { headers: { 'Content-Type': 'application/json' } }
            );
  
            if (successResponse.status === 200) {
              setPaymentSuccess(true);
              navigate(pathname, {
                state: {
                  materialId: generatedMaterialId,
                  type,
                  resumeDownload: true,
                },
              });
            } else {
              setPaymentSuccess(false);
              navigate(pathname, {
                state: {
                  materialId: generatedMaterialId,
                  type,
                  resumeDownload: true,
                },
              });
              setErrorMessage('Payment verification failed. Please try again.');
            }
            
          } catch (error) {
            console.error("Payment success handler failed:", error);
            setErrorMessage('An error occurred while verifying the payment. Please try again.');
          } finally {
            setLoading(false);
          }
        },
        theme: { color: "#F37254" },
        prefill: {
          name: user.displayName || '',
          email: user.email || '',
          contact: user.phoneNumber || '',
        },
        onPaymentFailed: function (response) {
          console.log('Payment failed:', response);
          setErrorMessage('Payment failed. Please try again.');
          setLoading(false); // Ensure loading is stopped
  
          // Reset Razorpay state and navigate back or reload
          window.location.reload(); // Optionally reload the page
          // Or navigate back
          navigate(-1);  // Redirect user to the previous page
        },
      };
  
      // Initialize Razorpay and open the payment popup
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Payment initiation error:", err);
      setErrorMessage('An error occurred while initiating the payment. Please try again.');
      setLoading(false);
    }
  };
  
        

  return (
    <div style={{ padding: '20px' }}>
      <h2>Payment Page</h2>
      <p>Please pay ₹1 to continue</p>
      <button onClick={handlePayment} disabled={loading}>
        {loading ? "Processing..." : "Pay Now"}
      </button>

      {paymentSuccess && (
        <p style={{ color: 'green' }}>
          ✅ Payment successful! Redirecting to your download...
        </p>
      )}
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
    </div>
  );
};

export default PaymentPage;

