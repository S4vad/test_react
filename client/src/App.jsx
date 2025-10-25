import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_PUBLISH_KEY);

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!stripe || !elements || !amount || parseFloat(amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        import.meta.env.VITE_FRONT_URL + "/create-payment-intent",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: parseFloat(amount) }),
        }
      );

      const data = await response.json();

      if (data.error) {
        setError(data.error);
        setLoading(false);
        return;
      }

      const { error: stripeError, paymentIntent } =
        await stripe.confirmCardPayment(data.clientSecret, {
          payment_method: {
            card: elements.getElement(CardElement),
          },
        });

      if (stripeError) {
        setError(stripeError.message);
      } else if (paymentIntent.status === "succeeded") {
        setSuccess(true);
      }
      setLoading(false);
    } catch (err) {
      setError("Payment failed");
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ padding: "40px", maxWidth: "400px" }}>
        <h2 style={{ fontSize: "24px", marginBottom: "20px" }}>
          Payment Successful!
        </h2>
        <p style={{ marginBottom: "20px" }}>Amount: ${amount}</p>
        <button
          onClick={() => {
            setSuccess(false);
            setAmount("");
            setError("");
            elements.getElement(CardElement).clear();
          }}
          style={{
            border: "1px solid #ccc",
            padding: "8px 16px",
            cursor: "pointer",
          }}
        >
          New Payment
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: "40px", maxWidth: "400px" }}>
      <h1 style={{ fontSize: "24px", marginBottom: "20px" }}>Payment</h1>

      <div style={{ marginBottom: "20px" }}>
        <label style={{ display: "block", marginBottom: "8px" }}>Amount</label>
        <input
          type="number"
          step="0.01"
          value={amount}
          onChange={(e) => {
            setAmount(e.target.value);
            setError("");
          }}
          placeholder="Enter amount"
          style={{ width: "100%", border: "1px solid #ccc", padding: "8px" }}
        />
      </div>

      <div style={{ marginBottom: "20px" }}>
        <label style={{ display: "block", marginBottom: "8px" }}>Card</label>
        <div style={{ border: "1px solid #ccc", padding: "8px" }}>
          <CardElement />
        </div>
      </div>

      {error && (
        <div
          style={{
            marginBottom: "20px",
            padding: "8px",
            border: "1px solid #ccc",
          }}
        >
          {error}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{
          width: "100%",
          border: "1px solid #ccc",
          padding: "8px",
          cursor: loading ? "not-allowed" : "pointer",
          opacity: loading ? 0.5 : 1,
        }}
      >
        {loading ? "Processing..." : "Pay"}
      </button>
    </div>
  );
};

export const App = () => {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  );
};
