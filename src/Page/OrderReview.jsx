import { useState, useEffect } from "react";
import { useCart } from "../Context/CartContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "../styles/OrderReview.css";
import { useAuth } from "../Context/AuthContext";
import axios from "axios";
import Navbar from "./Navbar";

function OrderReview() {
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [coupons, setCoupons] = useState([]);

  const [address, setAddress] = useState(null);

  /* ================= LOAD COUPONS ================= */
  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const res = await axios.get("http://localhost:5000/coupons");
        setCoupons(res.data);
      } catch (err) {
        console.error("Failed to load coupons:", err);
      }
    };
    fetchCoupons();
  }, []);

  /* ================= LOAD ADDRESS ================= */
  useEffect(() => {
    if (!user) return;

    const fetchAddress = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/addresses?userId=${user.id}&isDefault=true`
        );
        setAddress(res.data[0] || null);
      } catch (err) {
        console.error("Failed to load address:", err);
      }
    };

    fetchAddress();
  }, [user]);

  /* ================= TOTAL ================= */
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const isExpired = (expiry) => new Date(expiry) < new Date();

  /* ================= APPLY COUPON ================= */
  const applyCoupon = () => {
    const coupon = coupons.find(
      (c) => c.code === couponCode.toUpperCase() && c.active
    );

    if (!coupon) return toast.error("Invalid coupon");
    if (coupon.used) return toast.error("Coupon already used");
    if (isExpired(coupon.expiry)) return toast.error("Coupon expired");

    if (total < coupon.minAmount) {
      return toast.error(`Minimum order ₹${coupon.minAmount} required`);
    }

    const discountAmount =
      coupon.type === "percentage"
        ? (total * coupon.value) / 100
        : coupon.value;

    if (discountAmount <= 0) return toast.error("Invalid discount");

    setDiscount(discountAmount);
    setAppliedCoupon(coupon.code);

    toast.success(`Coupon ${coupon.code} applied`);
  };

  /* ================= REMOVE COUPON ================= */
  const removeCoupon = () => {
    setDiscount(0);
    setAppliedCoupon(null);
    setCouponCode("");
  };

  const finalAmount = total - discount;

  /* ================= PLACE ORDER ================= */
  const placeOrder = async () => {
    if (cart.length === 0) return;

    if (!address) {
      toast.error("Please add a delivery address");
      return;
    }

    try {
      const today = new Date();
      const delivery = new Date();
      delivery.setDate(today.getDate() + 7);

      const newOrder = {
        userId: user.id,
        items: cart,
        status: "Placed",
        orderDate: today.toISOString(),
        deliveryDate: delivery.toISOString(),
        totalAmount: finalAmount,
        coupon: appliedCoupon,
        discount,
        address,
      };

      const res = await axios.post("http://localhost:5000/orders", newOrder);

      if (appliedCoupon) {
        const coupon = coupons.find((c) => c.code === appliedCoupon);
        if (coupon) {
          await axios.patch(
            `http://localhost:5000/coupons/${coupon.id}`,
            { used: true }
          );
          setCoupons(
            coupons.map((c) =>
              c.id === coupon.id ? { ...c, used: true } : c
            )
          );
        }
      }

      clearCart();
      toast.success(`Order #${res.data.id} placed successfully`);
      navigate("/order-success");
    } catch (err) {
      console.error("Place order error:", err);
      toast.error("Could not place order. Please try again.");
    }
  };

  return (
    <div className="checkout-page">
      <Navbar textColor="black" />

      <div className="checkout-wrapper">
        {/* LEFT COLUMN - Address + Items */}
        <div className="checkout-left">
          {/* DELIVERY ADDRESS */}
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
                  <div className="address-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </div>
                  <div className="address-details">
                    <p className="address-name">{address.name}</p>
                    <p className="address-line">
                      {address.house}, {address.area}
                    </p>
                    <p className="address-line">
                      {address.city}, {address.state} - {address.pincode}
                    </p>
                    <p className="address-phone">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                      </svg>
                      +91 {address.phone}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="address-empty-content">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  <span>Add a delivery address to continue</span>
                </div>
              )}
            </div>
          </div>

          {/* ORDER ITEMS */}
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
                    {item.size && <p className="item-meta">Size: {item.size}</p>}
                  </div>
                  <div className="item-price">₹{item.price * item.qty}</div>
                </div>
              ))}
            </div>
          </div>

          {/* MOBILE: Order Summary appears HERE on small screens */}
          <div className="mobile-summary">
            <div className="summary-card">
              <h2 className="summary-title">Order Summary</h2>

              {/* COUPON */}
              <div className="coupon-section">
                {appliedCoupon ? (
                  <div className="coupon-applied-box">
                    <div className="coupon-tag">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
                        <line x1="7" y1="7" x2="7.01" y2="7" />
                      </svg>
                      <span>{appliedCoupon}</span>
                    </div>
                    <button className="remove-coupon-btn" onClick={removeCoupon}>
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
                    />
                    <button className="apply-coupon-btn" onClick={applyCoupon}>
                      Apply
                    </button>
                  </div>
                )}
              </div>

              {/* PRICE BREAKDOWN */}
              <div className="price-breakdown">
                <div className="price-row">
                  <span>Subtotal</span>
                  <span>₹{total}</span>
                </div>
                {discount > 0 && (
                  <div className="price-row discount-row">
                    <span>Discount</span>
                    <span className="discount-amount">-₹{discount}</span>
                  </div>
                )}
                <div className="price-row shipping-row">
                  <span>Shipping</span>
                  <span className="free-shipping">Free</span>
                </div>
                <div className="price-divider" />
                <div className="price-row total-row">
                  <span>Total</span>
                  <span className="total-amount">₹{finalAmount}</span>
                </div>
              </div>

              {/* PAYMENT METHOD */}
              <div className="payment-section">
                <h3>Payment Method</h3>
                <label className="payment-option">
                  <div className="payment-radio">
                    <input type="radio" defaultChecked />
                    <span className="radio-custom" />
                  </div>
                  <div className="payment-info">
                    <span className="payment-name">Cash on Delivery</span>
                    <span className="payment-desc">Pay when you receive</span>
                  </div>
                </label>
              </div>

              {/* PLACE ORDER */}
              <button
                className="place-order-btn"
                onClick={placeOrder}
                disabled={cart.length === 0}
              >
                Place Order
              </button>

              <p className="secure-note">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
                Secure checkout. Your data is protected.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN - DESKTOP ONLY Order Summary */}
        <div className="checkout-right">
          <div className="summary-card">
            <h2 className="summary-title">Order Summary</h2>

            {/* COUPON */}
            <div className="coupon-section">
              {appliedCoupon ? (
                <div className="coupon-applied-box">
                  <div className="coupon-tag">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
                      <line x1="7" y1="7" x2="7.01" y2="7" />
                    </svg>
                    <span>{appliedCoupon}</span>
                  </div>
                  <button className="remove-coupon-btn" onClick={removeCoupon}>
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
                  />
                  <button className="apply-coupon-btn" onClick={applyCoupon}>
                    Apply
                  </button>
                </div>
              )}
            </div>

            {/* PRICE BREAKDOWN */}
            <div className="price-breakdown">
              <div className="price-row">
                <span>Subtotal</span>
                <span>₹{total}</span>
              </div>
              {discount > 0 && (
                <div className="price-row discount-row">
                  <span>Discount</span>
                  <span className="discount-amount">-₹{discount}</span>
                </div>
              )}
              <div className="price-row shipping-row">
                <span>Shipping</span>
                <span className="free-shipping">Free</span>
              </div>
              <div className="price-divider" />
              <div className="price-row total-row">
                <span>Total</span>
                <span className="total-amount">₹{finalAmount}</span>
              </div>
            </div>

            {/* PAYMENT METHOD */}
            <div className="payment-section">
              <h3>Payment Method</h3>
              <label className="payment-option">
                <div className="payment-radio">
                  <input type="radio" defaultChecked />
                  <span className="radio-custom" />
                </div>
                <div className="payment-info">
                  <span className="payment-name">Cash on Delivery</span>
                  <span className="payment-desc">Pay when you receive</span>
                </div>
              </label>
            </div>

            {/* PLACE ORDER */}
            <button
              className="place-order-btn"
              onClick={placeOrder}
              disabled={cart.length === 0}
            >
              Place Order
            </button>

            <p className="secure-note">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
              Secure checkout. Your data is protected.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderReview;