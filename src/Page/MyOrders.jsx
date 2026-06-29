import { useNavigate } from "react-router-dom";
import "../styles/MyOrders.css";
import { useAuth } from "../Context/AuthContext";
import { useEffect, useState } from "react";
import API from "../api/axios";

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

        const res = await API.get("/orders/");
        setOrders(res.data);
      } catch (err) {
        console.error("Error fetching orders:", err.response?.data || err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const cancelOrder = async (orderId) => {
    try {
      const res = await API.patch(`/orders/${orderId}/`, {
        status: "Cancelled",
      });

      setOrders(
        orders.map((o) => (o.id === orderId ? res.data : o))
      );
    } catch (err) {
      console.error("Cancel error:", err.response?.data || err);
    }
  };

  const handleReturn = async (order, item) => {
    const reason = prompt("Enter return reason:", "Size issue");

    if (!reason) return;

    try {
      await API.post("/returns/", {
        orderId: order.id,
        productId: item.productId,
        size: item.size,
        reason: reason,
      });

      setOrders(
        orders.map((o) =>
          o.id === order.id
            ? {
              ...o,
              items: o.items.map((i) =>
                i.productId === item.productId && i.size === item.size
                  ? { ...i, returnStatus: "Returned" }
                  : i
              ),
            }
            : o
        )
      );

      alert("Return request submitted successfully");
    } catch (err) {
      console.error("Return error:", err.response?.data || err);
      alert(err.response?.data?.error || "Could not request return");
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
        return "✓";
      case "Placed":
        return "📄";
      case "Cancelled":
        return "✕";
      default:
        return "🚚";
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
        <h2>Please login to view your orders</h2>
        <p>Sign in to track your deliveries and manage returns</p>

        <button
          className="empty-action-btn"
          onClick={() => navigate("/login")}
        >
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
        <h2>No orders yet</h2>
        <p>You haven't placed any orders. Start shopping now!</p>

        <button
          className="empty-action-btn"
          onClick={() => navigate("/")}
        >
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

          <span className="orders-count">
            {orders.length} order{orders.length > 1 ? "s" : ""}
          </span>
        </div>

        <div className="orders-list">
          {orders.map((order) => (
            <div className="order-card" key={order.id}>
              <div className="order-card-header">
                <div className="order-meta-group">
                  <div className="order-id">
                    <span className="order-label">Order ID</span>
                    <span className="order-value">#{order.id}</span>
                  </div>

                  <div className="order-date">
                    <span className="order-label">Placed on</span>
                    <span className="order-value">
                      {formatDate(order.orderDate)}
                    </span>
                  </div>
                </div>

                <div>
                  <div className={`status-badge ${getStatusColor(order.status)}`}>
                    <span>{getStatusIcon(order.status)}</span>
                    <span>{order.status}</span>
                  </div>

                  {order.paymentMethod === "ONLINE" &&
                    (order.paymentStatus === "Refund Initiated" ||
                      order.paymentStatus === "Refunded") && (
                      <div className="refund-status">
                        {order.paymentStatus}
                      </div>
                    )}
                </div>
              </div>

              <div className="delivery-timeline">
                <div className="timeline-track">
                  <div
                    className={`timeline-dot ${order.status !== "Cancelled" ? "active" : ""
                      }`}
                  />
                  <div
                    className={`timeline-line ${order.status === "Shipped" ||
                      order.status === "Delivered"
                      ? "active"
                      : ""
                      }`}
                  />
                  <div
                    className={`timeline-dot ${order.status === "Shipped" ||
                      order.status === "Delivered"
                      ? "active"
                      : ""
                      }`}
                  />
                  <div
                    className={`timeline-line ${order.status === "Delivered" ? "active" : ""
                      }`}
                  />
                  <div
                    className={`timeline-dot ${order.status === "Delivered" ? "active" : ""
                      }`}
                  />
                </div>

                <div className="timeline-labels">
                  <span>Ordered</span>
                  <span>Shipped</span>
                  <span>Delivered</span>
                </div>
              </div>

              <div className="order-items">
                {order.items.map((item) => (
                  <div
                    className="order-product"
                    key={`${item.productId}-${item.size}`}
                  >
                    <div className="order-product-img">
                      <img src={item.image} alt={item.title} />
                    </div>

                    <div className="order-product-content">
                      <h3 className="order-product-name">{item.title}</h3>

                      <div className="order-product-details">
                        <span>Size: {item.size}</span>
                        <span>•</span>
                        <span>Qty: {item.qty}</span>
                      </div>

                      <p className="order-product-amount">
                        ₹{Number(item.price) * item.qty}
                      </p>
                    </div>

                    <div className="product-actions">
                      {item.returnStatus === "Returned" ? (
                        <span className="returned-badge">Returned</span>
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

              <div className="order-card-footer">
                <div className="delivery-info">
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

              {order.status === "Placed" && (
                <div className="order-actions">
                  <button
                    className="cancel-order-btn"
                    onClick={() => cancelOrder(order.id)}
                  >
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