import { useCart } from "../Context/CartContext";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Cart.css";
import Navbar from "./Navbar";

function Cart() {
  const { cart, removeFromCart, updateQty } = useCart();
  const navigate = useNavigate();

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  const itemCount = cart.reduce((sum, item) => sum + item.qty, 0);

  if (cart.length === 0) {
    return (
      <div className="cart-empty-page">
        <Navbar textColor="black" />
        <div className="cart-empty-state">
          <div className="empty-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
          </div>
          <h2>Your cart is empty</h2>
          <p>Looks like you haven't added anything to your cart yet</p>
          <button className="empty-action-btn" onClick={() => navigate("/")}>
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <Navbar textColor="black" />

      <div className="cart-wrapper">
        {/* Header */}
        <div className="cart-header">
          <h1>Shopping Cart</h1>
          <span className="item-count">{itemCount} item{itemCount > 1 ? "s" : ""}</span>
        </div>

        <div className="cart-layout">
          {/* LEFT - Cart Items (always first in DOM order) */}
          <div className="cart-left">
            {cart.map((item) => (
              <div className="cart-item-card" key={`${item.productId}-${item.size}`}>
                {/* Product Image */}
                <Link
                  to={`${item.url}/${item.productId}`}
                  className="product-image-link"
                >
                  <div className="product-image-wrapper">
                    <img src={item.image} alt={item.title} />
                  </div>
                </Link>

                {/* Product Details */}
                <div className="product-details">
                  <div className="product-header">
                    <Link
                      to={`${item.url}/${item.productId}`}
                      className="product-title-link"
                    >
                      <h3 className="product-title">{item.title}</h3>
                    </Link>
                    <button
                      className="remove-btn"
                      onClick={() => removeFromCart(item.productId, item.size)}
                      title="Remove item"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>

                  <p className="product-size">Size: {item.size}</p>

                  {/* Price */}
                  <div className="product-price-row">
                    {item.originalPrice && item.originalPrice !== item.price ? (
                      <>
                        <span className="current-price">₹{item.price}</span>
                        <span className="original-price">₹{item.originalPrice}</span>
                        <span className="discount-badge">
                          {Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}% OFF
                        </span>
                      </>
                    ) : (
                      <span className="current-price">₹{item.price}</span>
                    )}
                  </div>

                  {/* Quantity & Total */}
                  <div className="product-actions">
                    <div className="quantity-selector">
                      <button
                        className="qty-btn"
                        onClick={() => {
                          if (item.qty > 1) {
                            updateQty(item.productId, item.size, item.qty - 1);
                          }
                        }}
                        disabled={item.qty <= 1}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                      </button>
                      <span className="qty-value">{item.qty}</span>
                      <button
                        className="qty-btn"
                        onClick={() => updateQty(item.productId, item.size, item.qty + 1)}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <line x1="12" y1="5" x2="12" y2="19" />
                          <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                      </button>
                    </div>
                    <span className="item-total">₹{item.price * item.qty}</span>
                  </div>
                </div>
              </div>
            ))}

            {/* MOBILE: Move summary and promo here on small screens */}
            <div className="mobile-summary">
              <div className="summary-card">
                <h2 className="summary-title">Order Summary</h2>

                <div className="summary-row">
                  <span>Subtotal ({itemCount} items)</span>
                  <span>₹{subtotal}</span>
                </div>

                <div className="summary-row">
                  <span>Shipping</span>
                  <span className="free-text">Free</span>
                </div>

                <div className="summary-row">
                  <span>Taxes</span>
                  <span>Calculated at checkout</span>
                </div>

                <div className="summary-divider" />

                <div className="summary-row total">
                  <span>Estimated Total</span>
                  <span className="total-amount">₹{subtotal}</span>
                </div>

                <button
                  className="checkout-btn"
                  onClick={() => navigate("/checkout")}
                >
                  Proceed to Checkout
                </button>

                <div className="secure-note">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                  Secure checkout. Your data is protected.
                </div>
              </div>

              <div className="promo-card">
                <h3>Have a coupon?</h3>
                <p>You can apply coupons at checkout</p>
                <button className="promo-link" onClick={() => navigate("/coupons")}>
                  View Coupons
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT - Order Summary (desktop only, hidden on mobile) */}
          <div className="cart-right">
            <div className="summary-card">
              <h2 className="summary-title">Order Summary</h2>

              <div className="summary-row">
                <span>Subtotal ({itemCount} items)</span>
                <span>₹{subtotal}</span>
              </div>

              <div className="summary-row">
                <span>Shipping</span>
                <span className="free-text">Free</span>
              </div>

              <div className="summary-row">
                <span>Taxes</span>
                <span>Calculated at checkout</span>
              </div>

              <div className="summary-divider" />

              <div className="summary-row total">
                <span>Estimated Total</span>
                <span className="total-amount">₹{subtotal}</span>
              </div>

              <button
                className="checkout-btn"
                onClick={() => navigate("/checkout")}
              >
                Proceed to Checkout
              </button>

              <div className="secure-note">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
                Secure checkout. Your data is protected.
              </div>
            </div>

            <div className="promo-card">
              <h3>Have a coupon?</h3>
              <p>You can apply coupons at checkout</p>
              <button className="promo-link" onClick={() => navigate("/coupons")}>
                View Coupons
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;