import { useNavigate } from "react-router-dom";
import "../styles/MyOrders.css";
import { useAuth } from "../Context/AuthContext";
import { useEffect, useState } from "react";
import axios from "axios";

function MyOrders() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `http://localhost:5000/orders?userId=${user.id}`
        );

        const sorted = [...res.data].sort(
          (a, b) => new Date(b.orderDate) - new Date(a.orderDate)
        );

        setOrders(sorted);
      } catch (err) {
        console.error("Error fetching orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const cancelOrder = async (orderId) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    try {
      const res = await axios.patch(
        `http://localhost:5000/orders/${orderId}`,
        { status: "Cancelled" }
      );
      setOrders(orders.map((o) => (o.id === orderId ? res.data : o)));
    } catch (err) {
      console.error("Cancel error:", err);
    }
  };

  const handleReturn = async (order, item) => {
    try {
      const returnData = {
        userId: user.id,
        orderId: order.id,
        productId: item.productId,
        productName: item.title,
        image: item.image,
        size: item.size,
        qty: item.qty,
        orderDate: order.orderDate,
        reason: "Size issue",
        status: "Return Requested",
        refund: null,
      };

      await axios.post("http://localhost:5000/returns", returnData);

      const updatedOrder = {
        ...order,
        items: order.items.map((i) =>
          i.productId === item.productId && i.size === item.size
            ? { ...i, returnStatus: "Returned" }
            : i
        ),
      };

      await axios.put(
        `http://localhost:5000/orders/${order.id}`,
        updatedOrder
      );

      setOrders(orders.map((o) => (o.id === order.id ? updatedOrder : o)));

      navigate("/returns");
    } catch (err) {
      console.error("Return error:", err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Delivered":
        return "status-delivered";
      case "Placed":
        return "status-placed";
      case "Cancelled":
        return "status-cancelled";
      case "Shipped":
        return "status-shipped";
      default:
        return "status-default";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Delivered":
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        );
      case "Placed":
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
        );
      case "Cancelled":
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        );
      default:
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="1" y="3" width="15" height="13" />
            <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
            <circle cx="5.5" cy="18.5" r="2.5" />
            <circle cx="18.5" cy="18.5" r="2.5" />
          </svg>
        );
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (!user) {
    return (
      <div className="orders-empty-state">
        <div className="empty-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M13.8 12H3" />
          </svg>
        </div>
        <h2>Please login to view your orders</h2>
        <p>Sign in to track your deliveries and manage returns</p>
        <button className="empty-action-btn" onClick={() => navigate("/login")}>
          Sign In
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="orders-loading">
        <div className="spinner" />
        <p>Loading your orders...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="orders-empty-state">
        <div className="empty-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
            <line x1="12" y1="22.08" x2="12" y2="12" />
          </svg>
        </div>
        <h2>No orders yet</h2>
        <p>You haven't placed any orders. Start shopping now!</p>
        <button className="empty-action-btn" onClick={() => navigate("/")}>
          Start Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <div className="orders-wrapper">
        <div className="orders-header">
          <h1>My Orders</h1>
          <span className="orders-count">{orders.length} order{orders.length > 1 ? "s" : ""}</span>
        </div>

        <div className="orders-list">
          {orders.map((order) => (
            <div className="order-card" key={order.id}>
              {/* Order Header */}
              <div className="order-card-header">
                <div className="order-meta-group">
                  <div className="order-id">
                    <span className="order-label">Order ID</span>
                    <span className="order-value">#{order.id}</span>
                  </div>
                  <div className="order-date">
                    <span className="order-label">Placed on</span>
                    <span className="order-value">{formatDate(order.orderDate)}</span>
                  </div>
                </div>
                <div className={`status-badge ${getStatusColor(order.status)}`}>
                  {getStatusIcon(order.status)}
                  <span>{order.status}</span>
                </div>
              </div>

              {/* Delivery Timeline */}
              <div className="delivery-timeline">
                <div className="timeline-track">
                  <div className={`timeline-dot ${order.status !== "Cancelled" ? "active" : ""}`} />
                  <div className={`timeline-line ${order.status === "Shipped" || order.status === "Delivered" ? "active" : ""}`} />
                  <div className={`timeline-dot ${order.status === "Shipped" || order.status === "Delivered" ? "active" : ""}`} />
                  <div className={`timeline-line ${order.status === "Delivered" ? "active" : ""}`} />
                  <div className={`timeline-dot ${order.status === "Delivered" ? "active" : ""}`} />
                </div>
                <div className="timeline-labels">
                  <span>Ordered</span>
                  <span>Shipped</span>
                  <span>Delivered</span>
                </div>
              </div>

              {/* Order Items */}
              <div className="order-items">
                {order.items.map((item) => (
                  <div className="order-product" key={item.productId + item.size}>
                    <div className="product-image-wrapper">
                      <img src={item.image} alt={item.title} />
                    </div>
                    <div className="product-info">
                      <h3 className="product-title">{item.title}</h3>
                      <div className="product-meta">
                        <span>Size: {item.size}</span>
                        <span className="meta-separator">•</span>
                        <span>Qty: {item.qty}</span>
                      </div>
                      <p className="product-price">₹{item.price * item.qty}</p>
                    </div>
                    <div className="product-actions">
                      {item.returnStatus === "Returned" ? (
                        <span className="returned-badge">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M20 6L9 17l-5-5" />
                          </svg>
                          Returned
                        </span>
                      ) : (
                        order.status === "Delivered" && (
                          <button
                            className="return-btn"
                            onClick={() => handleReturn(order, item)}
                          >
                            Return
                          </button>
                        )
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Footer */}
              <div className="order-card-footer">
                <div className="delivery-info">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="1" y="3" width="15" height="13" />
                    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                    <circle cx="5.5" cy="18.5" r="2.5" />
                    <circle cx="18.5" cy="18.5" r="2.5" />
                  </svg>
                  <span>
                    {order.status === "Delivered"
                      ? `Delivered on ${formatDate(order.deliveryDate)}`
                      : `Expected by ${formatDate(order.deliveryDate)}`}
                  </span>
                </div>
                <div className="order-total">
                  <span>Total</span>
                  <span>₹{order.totalAmount}</span>
                </div>
              </div>

              {/* Cancel Button */}
              {order.status === "Placed" && (
                <div className="order-actions">
                  <button
                    className="cancel-order-btn"
                    onClick={() => cancelOrder(order.id)}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="15" y1="9" x2="9" y2="15" />
                      <line x1="9" y1="9" x2="15" y2="15" />
                    </svg>
                    Cancel Order
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MyOrders;