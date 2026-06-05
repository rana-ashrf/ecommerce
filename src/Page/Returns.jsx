import { useNavigate } from "react-router-dom";
import "../styles/Returns.css";
import { useAuth } from "../Context/AuthContext";
import { useEffect, useState } from "react";
import axios from "axios";

function Returns() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [returnsList, setReturnsList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchReturns = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `http://localhost:5000/returns?userId=${user.id}`
        );

        const sorted = [...res.data].sort(
          (a, b) => new Date(b.orderDate) - new Date(a.orderDate)
        );

        setReturnsList(sorted);
      } catch (err) {
        console.error("Error fetching returns:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReturns();
  }, [user]);

  const getStatusStyle = (status) => {
    switch (status) {
      case "Return Requested":
        return "status-requested";
      case "Return Approved":
        return "status-approved";
      case "Return Received":
        return "status-received";
      case "Refund Initiated":
        return "status-refund";
      case "Refund Completed":
        return "status-completed";
      default:
        return "status-default";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Return Requested":
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 14L4 9l5-5" />
            <path d="M4 9h10.5a5.5 5.5 0 015.5 5.5v0a5.5 5.5 0 01-5.5 5.5H11" />
          </svg>
        );
      case "Return Approved":
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        );
      case "Return Received":
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
        );
      case "Refund Initiated":
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        );
      case "Refund Completed":
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
          </svg>
        );
      default:
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
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
      <div className="returns-empty-state">
        <div className="empty-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M13.8 12H3" />
          </svg>
        </div>
        <h2>Please login to view your returns</h2>
        <p>Sign in to track your return requests and refunds</p>
        <button className="empty-action-btn" onClick={() => navigate("/login")}>
          Sign In
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="returns-loading">
        <div className="spinner" />
        <p>Loading your returns...</p>
      </div>
    );
  }

  return (
    <div className="returns-page">
      <div className="returns-wrapper">
        {/* Header */}
        <div className="returns-header">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <h1>My Returns</h1>
          {returnsList.length > 0 && (
            <span className="returns-count">{returnsList.length} return{returnsList.length > 1 ? "s" : ""}</span>
          )}
        </div>

        {returnsList.length === 0 ? (
          <div className="returns-empty-state">
            <div className="empty-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
              </svg>
            </div>
            <h2>No returns yet</h2>
            <p>You haven't requested any returns. All your purchases are perfect!</p>
            <button className="empty-action-btn" onClick={() => navigate("/my-orders")}>
              View My Orders
            </button>
          </div>
        ) : (
          <div className="returns-list">
            {returnsList.map((item) => (
              <div className="return-card" key={item.id}>
                {/* Return Header */}
                <div className="return-card-header">
                  <div className="return-meta-group">
                    <div className="return-meta">
                      <span className="meta-label">Return ID</span>
                      <span className="meta-value">#{item.id}</span>
                    </div>
                    <div className="return-meta">
                      <span className="meta-label">Order ID</span>
                      <span className="meta-value">#{item.orderId}</span>
                    </div>
                    <div className="return-meta">
                      <span className="meta-label">Requested on</span>
                      <span className="meta-value">{formatDate(item.orderDate)}</span>
                    </div>
                  </div>
                  <div className={`status-badge ${getStatusStyle(item.status)}`}>
                    {getStatusIcon(item.status)}
                    <span>{item.status}</span>
                  </div>
                </div>

                {/* Return Timeline */}
                <div className="return-timeline">
                  <div className="timeline-steps">
                    <div className={`timeline-step ${["Return Requested", "Return Approved", "Return Received", "Refund Initiated", "Refund Completed"].includes(item.status) ? "completed" : ""}`}>
                      <div className="step-dot" />
                      <span className="step-label">Requested</span>
                    </div>
                    <div className={`timeline-step ${["Return Approved", "Return Received", "Refund Initiated", "Refund Completed"].includes(item.status) ? "completed" : ""}`}>
                      <div className="step-dot" />
                      <span className="step-label">Approved</span>
                    </div>
                    <div className={`timeline-step ${["Return Received", "Refund Initiated", "Refund Completed"].includes(item.status) ? "completed" : ""}`}>
                      <div className="step-dot" />
                      <span className="step-label">Received</span>
                    </div>
                    <div className={`timeline-step ${["Refund Initiated", "Refund Completed"].includes(item.status) ? "completed" : ""}`}>
                      <div className="step-dot" />
                      <span className="step-label">Refund</span>
                    </div>
                    <div className={`timeline-step ${item.status === "Refund Completed" ? "completed" : ""}`}>
                      <div className="step-dot" />
                      <span className="step-label">Completed</span>
                    </div>
                  </div>
                </div>

                {/* Product Details */}
                <div className="return-product">
                  <div className="product-image-wrapper">
                    <img src={item.image} alt={item.productName} />
                  </div>
                  <div className="product-details">
                    <h3 className="product-name">{item.productName}</h3>
                    <div className="product-meta">
                      <span>Size: {item.size}</span>
                      <span className="meta-separator">•</span>
                      <span>Qty: {item.qty}</span>
                    </div>
                    <div className="return-reason">
                      <span className="reason-label">Reason:</span>
                      <span className="reason-value">{item.reason}</span>
                    </div>
                  </div>
                </div>

                {/* Return Footer */}
                <div className="return-card-footer">
                  {item.refund ? (
                    <div className="refund-info">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                      </svg>
                      <span className="refund-amount">{item.refund}</span>
                    </div>
                  ) : (
                    <div className="refund-pending">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      <span>Refund pending</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Returns;