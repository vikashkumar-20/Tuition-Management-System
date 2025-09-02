import React from 'react';
import axios from 'axios';

const PaymentButton = ({ userId, amount }) => {

  const loadRazorpay = (src) => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    const res = await loadRazorpay('https://checkout.razorpay.com/v1/checkout.js');

    if (!res) {
      alert('Razorpay SDK failed to load.');
      return;
    }

    try {
      // Step 1: Create order from backend
      const { data: order } = await axios.post('http://localhost:5000/create-order', {
        amount,
        userId,
      });

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'Your Company Name',
        description: 'Test Transaction',
        order_id: order.id,
        handler: async (response) => {
          // Step 2: Verify payment
          await axios.post('http://localhost:5000/payment-success', {
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
          });

          alert('Payment successful!');
        },
        prefill: {
          name: 'Test User',
          email: 'test@example.com',
          contact: '9999999999',
        },
        notes: {
          userId,
        },
        theme: {
          color: '#3399cc',
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error) {
      console.error('Payment Error:', error);
      alert('Payment failed. Try again.');
    }
  };

  return (
    <button onClick={handlePayment} className="bg-blue-500 text-white px-4 py-2 rounded">
      Pay Now
    </button>
  );
};

export default PaymentButton;
