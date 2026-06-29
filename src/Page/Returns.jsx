import { useNavigate } from "react-router-dom";
import "../styles/Returns.css";
import { useAuth } from "../Context/AuthContext";
import { useEffect, useState } from "react";
import API from "../api/axios";

function Returns() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [returnsList, setReturnsList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchReturns = async () => {
      try {
        setLoading(true);

        const res = await API.get("/returns/");

        const sorted = [...res.data].sort(
          (a, b) => new Date(b.orderDate) - new Date(a.orderDate)
        );

        setReturnsList(sorted);
      } catch (err) {
        console.error("Error fetching returns:", err.response?.data || err);
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
        <h2>Please login to view your returns</h2>
        <p>Sign in to track your return requests and refunds</p>

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
      <div className="returns-loading">
        <div className="spinner" />
        <p>Loading your returns...</p>
      </div>
    );
  }

  return (
    <div className="returns-page">
      <div className="returns-wrapper">
        <div className="returns-header">
          <button className="back-btn" onClick={() => navigate(-1)}>
            ←
          </button>

          <h1>My Returns</h1>

          {returnsList.length > 0 && (
            <span className="returns-count">
              {returnsList.length} return{returnsList.length > 1 ? "s" : ""}
            </span>
          )}
        </div>

        {returnsList.length === 0 ? (
          <div className="returns-empty-state">
            <h2>No returns yet</h2>
            <p>You haven't requested any returns.</p>

            <button
              className="empty-action-btn"
              onClick={() => navigate("/orders")}
            >
              View My Orders
            </button>
          </div>
        ) : (
          <div className="returns-list">
            {returnsList.map((item) => (
              <div className="return-card" key={item.id}>
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
                      <span className="meta-value">
                        {formatDate(item.orderDate)}
                      </span>
                    </div>
                  </div>

                  <div className={`status-badge ${getStatusStyle(item.status)}`}>
                    <span>{item.status}</span>
                  </div>
                </div>

                <div className="return-timeline">
                  <div className="timeline-steps">
                    <div
                      className={`timeline-step ${
                        [
                          "Return Requested",
                          "Return Approved",
                          "Return Received",
                          "Refund Initiated",
                          "Refund Completed",
                        ].includes(item.status)
                          ? "completed"
                          : ""
                      }`}
                    >
                      <div className="step-dot" />
                      <span className="step-label">Requested</span>
                    </div>

                    <div
                      className={`timeline-step ${
                        [
                          "Return Approved",
                          "Return Received",
                          "Refund Initiated",
                          "Refund Completed",
                        ].includes(item.status)
                          ? "completed"
                          : ""
                      }`}
                    >
                      <div className="step-dot" />
                      <span className="step-label">Approved</span>
                    </div>

                    <div
                      className={`timeline-step ${
                        [
                          "Return Received",
                          "Refund Initiated",
                          "Refund Completed",
                        ].includes(item.status)
                          ? "completed"
                          : ""
                      }`}
                    >
                      <div className="step-dot" />
                      <span className="step-label">Received</span>
                    </div>

                    <div
                      className={`timeline-step ${
                        ["Refund Initiated", "Refund Completed"].includes(
                          item.status
                        )
                          ? "completed"
                          : ""
                      }`}
                    >
                      <div className="step-dot" />
                      <span className="step-label">Refund</span>
                    </div>

                    <div
                      className={`timeline-step ${
                        item.status === "Refund Completed" ? "completed" : ""
                      }`}
                    >
                      <div className="step-dot" />
                      <span className="step-label">Completed</span>
                    </div>
                  </div>
                </div>

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

                {/* <div className="return-card-footer">
                  {item.refund ? (
                    <div className="refund-info">
                      <span className="refund-amount">{item.refund}</span>
                    </div>
                  ) : (
                    <div className="refund-pending">
                      <span>Refund pending</span>
                    </div>
                  )}
                </div> */}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Returns;