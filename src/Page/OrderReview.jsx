import { useState, useEffect } from "react";
import { useCart } from "../Context/CartContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "../styles/OrderReview.css";
import { useAuth } from "../Context/AuthContext";
import Navbar from "./Navbar";
import API from "../api/axios";

function OrderReview() {
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [address, setAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("COD");

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    if (!user) return;

    API.get("/addresses/?isDefault=true")
      .then((res) => setAddress(res.data[0] || null))
      .catch((err) => console.error("Failed to load address:", err));
  }, [user]);

  const total = cart.reduce(
    (sum, item) => sum + Number(item.price) * item.qty,
    0
  );

  const finalAmount = total - discount;

  const applyCoupon = async () => {
    const code = couponCode.trim().toUpperCase();

    if (!code) {
      toast.error("Enter coupon code");
      return;
    }

    try {
      const res = await API.post("/validate-coupon/", {
        code,
        cart_total: total,
      });

      setDiscount(Number(res.data.discount));
      setAppliedCoupon(res.data.coupon);
      toast.success(res.data.message);
    } catch (err) {
      toast.error(err.response?.data?.error || "Invalid coupon");
    }
  };

  const removeCoupon = () => {
    setDiscount(0);
    setAppliedCoupon(null);
    setCouponCode("");
  };

  const placeOrder = async () => {
    if (cart.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    if (!address) {
      toast.error("Please add a delivery address");
      return;
    }

    try {
      const orderRes = await API.post("/orders/", {
        address,
        coupon: appliedCoupon,
        payment_method: paymentMethod,
      });

      const order = orderRes.data;

      if (paymentMethod === "COD") {
        clearCart();
        toast.success(`Order #${order.id} placed successfully`);
        navigate("/order-success");
        return;
      }

      const razorpayRes = await API.post("/create-razorpay-order/", {
        order_id: order.id,
      });

      const data = razorpayRes.data;

      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: "Fashion Store",
        description: "Order Payment",
        order_id: data.razorpay_order_id,

        handler: async function (response) {
          try {
            await API.post("/verify-razorpay-payment/", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            clearCart();
            toast.success("Payment successful");
            navigate("/order-success");
          } catch (err) {
            console.error("Payment verification error:", err);
            toast.error("Payment verification failed");
          }
        },

        prefill: {
          name: address?.name || user?.username || "",
          email: user?.email || "",
          contact: address?.phone || "",
        },

        theme: {
          color: "#000000",
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

      razorpay.on("payment.failed", function () {
        toast.error("Payment failed");
      });
    } catch (err) {
      console.error("Place order error:", err.response?.data || err);
      toast.error(
        err.response?.data?.error || "Could not place order. Please try again."
      );
    }
  };

  return (
    <div className="checkout-page">
      <Navbar textColor="black" />

      <div className="checkout-wrapper">
        <div className="checkout-left">
          <div className="checkout-section">
            <div className="section-header">
              <div className="section-title-group">
                <h2>Delivery Address</h2>
                {address?.type && (
                  <span className="address-type-badge">{address.type}</span>
                )}
              </div>

              <button
                className="change-link"
                onClick={() => navigate("/add-address")}
              >
                {address ? "Change" : "Add New"}
              </button>
            </div>

            <div
              className={`address-card ${!address ? "address-empty" : ""}`}
              onClick={() => navigate("/add-address")}
            >
              {address ? (
                <div className="address-content">
                  <div className="address-details">
                    <p className="address-name">{address.name}</p>
                    <p className="address-line">
                      {address.house}, {address.area}
                    </p>
                    <p className="address-line">
                      {address.city}, {address.state} - {address.pincode}
                    </p>
                    <p className="address-phone">+91 {address.phone}</p>
                  </div>
                </div>
              ) : (
                <div className="address-empty-content">
                  <span>Add a delivery address to continue</span>
                </div>
              )}
            </div>
          </div>

          <div className="checkout-section">
            <div className="section-header">
              <h2>Order Items ({cart.length})</h2>
            </div>

            <div className="order-items-list">
              {cart.map((item) => (
                <div className="order-item" key={`${item.id}-${item.size}`}>
                  <div className="item-image-wrapper">
                    <img src={item.image} alt={item.title} />
                  </div>

                  <div className="item-details">
                    <h3 className="item-title">{item.title}</h3>
                    <p className="item-meta">Qty: {item.qty}</p>
                    {item.size && (
                      <p className="item-meta">Size: {item.size}</p>
                    )}
                  </div>

                  <div className="item-price">
                    ₹{(Number(item.price) * item.qty).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="checkout-right">
          <div className="summary-card">
            <h2 className="summary-title">Order Summary</h2>

            <div className="coupon-section">
              {appliedCoupon ? (
                <div className="coupon-applied-box">
                  <div className="coupon-tag">
                    <span>{appliedCoupon}</span>
                  </div>

                  <button
                    className="remove-coupon-btn"
                    onClick={removeCoupon}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="coupon-input-wrapper">
                  <input
                    type="text"
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="coupon-input"
                    autoComplete="off"
                  />

                  <button
                    className="apply-coupon-btn"
                    onClick={applyCoupon}
                  >
                    Apply
                  </button>
                </div>
              )}
            </div>

            <div className="price-breakdown">
              <div className="price-row">
                <span>Subtotal</span>
                <span>₹{total.toFixed(2)}</span>
              </div>

              {discount > 0 && (
                <div className="price-row discount-row">
                  <span>Discount</span>
                  <span className="discount-amount">
                    -₹{discount.toFixed(2)}
                  </span>
                </div>
              )}

              <div className="price-row shipping-row">
                <span>Shipping</span>
                <span className="free-shipping">Free</span>
              </div>

              <div className="price-divider" />

              <div className="price-row total-row">
                <span>Total</span>
                <span className="total-amount">
                  ₹{finalAmount.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="payment-section">
              <h3>Payment Method</h3>

              <label className="payment-option">
                <div className="payment-radio">
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === "COD"}
                    onChange={() => setPaymentMethod("COD")}
                  />
                  <span className="radio-custom" />
                </div>

                <div className="payment-info">
                  <span className="payment-name">Cash on Delivery</span>
                  <span className="payment-desc">Pay when you receive</span>
                </div>
              </label>

              <label className="payment-option">
                <div className="payment-radio">
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === "ONLINE"}
                    onChange={() => setPaymentMethod("ONLINE")}
                  />
                  <span className="radio-custom" />
                </div>

                <div className="payment-info">
                  <span className="payment-name">Online Payment</span>
                  <span className="payment-desc">
                    Pay using UPI, Card, NetBanking
                  </span>
                </div>
              </label>
            </div>

            <button
              className="place-order-btn"
              onClick={placeOrder}
              disabled={cart.length === 0}
            >
              {paymentMethod === "ONLINE" ? "Pay Now" : "Place Order"}
            </button>

            <p className="secure-note">
              Secure checkout. Your data is protected.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderReview;