import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/Coupons.css";

function Coupons() {
  const [copiedCode, setCopiedCode] = useState(null);
  const [coupons, setCoupons] = useState([]);
  const [activeTab, setActiveTab] = useState("available");

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const res = await axios.get("http://localhost:5000/coupons");
        setCoupons(res.data);
      } catch (err) {
        console.error("Error fetching coupons:", err);
      }
    };
    fetchCoupons();
  }, []);

  const isExpired = (expiry) => new Date(expiry) < new Date();

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 1500);
  };

  const availableCoupons = coupons.filter(
    (c) => c.active && !c.used && !isExpired(c.expiry)
  );

  const usedCoupons = coupons.filter((c) => c.used);
  const expiredCoupons = coupons.filter(
    (c) => !c.used && (isExpired(c.expiry) || !c.active)
  );

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getDaysLeft = (expiry) => {
    const diff = new Date(expiry) - new Date();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days <= 0) return "Expired";
    if (days === 1) return "1 day left";
    return `${days} days left`;
  };

  return (
    <div className="coupons-page">
      <div className="coupons-wrapper">
        {/* Header */}
        <div className="coupons-header">
          <h1>My Coupons</h1>
          <span className="coupons-count">
            {availableCoupons.length} available
          </span>
        </div>

        {/* Tabs */}
        <div className="coupons-tabs">
          <button
            className={`tab-btn ${activeTab === "available" ? "active" : ""}`}
            onClick={() => setActiveTab("available")}
          >
            Available
            {availableCoupons.length > 0 && (
              <span className="tab-badge">{availableCoupons.length}</span>
            )}
          </button>
          <button
            className={`tab-btn ${activeTab === "used" ? "active" : ""}`}
            onClick={() => setActiveTab("used")}
          >
            Used
            {usedCoupons.length > 0 && (
              <span className="tab-badge">{usedCoupons.length}</span>
            )}
          </button>
          <button
            className={`tab-btn ${activeTab === "expired" ? "active" : ""}`}
            onClick={() => setActiveTab("expired")}
          >
            Expired
            {expiredCoupons.length > 0 && (
              <span className="tab-badge">{expiredCoupons.length}</span>
            )}
          </button>
        </div>

        {/* Content */}
        <div className="coupons-content">
          {activeTab === "available" && (
            <>
              {availableCoupons.length === 0 ? (
                <div className="coupons-empty">
                  <div className="empty-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
                      <line x1="7" y1="7" x2="7.01" y2="7" />
                    </svg>
                  </div>
                  <h3>No coupons available</h3>
                  <p>Check back later for exclusive offers and discounts</p>
                </div>
              ) : (
                <div className="coupons-grid">
                  {availableCoupons.map((coupon) => (
                    <div className="coupon-card available" key={coupon.id}>
                      <div className="coupon-ribbon">
                        <span>{getDaysLeft(coupon.expiry)}</span>
                      </div>
                      <div className="coupon-body">
                        <div className="coupon-value">
                          {coupon.type === "percentage" ? (
                            <>
                              <span className="value-number">{coupon.value}%</span>
                              <span className="value-label">OFF</span>
                            </>
                          ) : (
                            <>
                              <span className="value-currency">₹</span>
                              <span className="value-number">{coupon.value}</span>
                              <span className="value-label">OFF</span>
                            </>
                          )}
                        </div>
                        <div className="coupon-divider" />
                        <div className="coupon-info">
                          <div className="coupon-code-row">
                            <span className="code-label">Code:</span>
                            <span className="code-value">{coupon.code}</span>
                          </div>
                          <p className="coupon-desc">
                            {coupon.type === "percentage"
                              ? `Save ${coupon.value}% on your order`
                              : `Save ₹${coupon.value} on your order`}
                          </p>
                          <div className="coupon-footer">
                            <span className="expiry-date">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="12 6 12 12 16 14" />
                              </svg>
                              Expires {formatDate(coupon.expiry)}
                            </span>
                            <button
                              className={`copy-btn ${copiedCode === coupon.code ? "copied" : ""}`}
                              onClick={() => handleCopy(coupon.code)}
                            >
                              {copiedCode === coupon.code ? (
                                <>
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <path d="M20 6L9 17l-5-5" />
                                  </svg>
                                  Copied
                                </>
                              ) : (
                                <>
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                                  </svg>
                                  Copy
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === "used" && (
            <>
              {usedCoupons.length === 0 ? (
                <div className="coupons-empty">
                  <div className="empty-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                  </div>
                  <h3>No used coupons</h3>
                  <p>Coupons you've used will appear here</p>
                </div>
              ) : (
                <div className="coupons-grid">
                  {usedCoupons.map((coupon) => (
                    <div className="coupon-card used" key={coupon.id}>
                      <div className="coupon-body">
                        <div className="coupon-value">
                          {coupon.type === "percentage" ? (
                            <>
                              <span className="value-number">{coupon.value}%</span>
                              <span className="value-label">OFF</span>
                            </>
                          ) : (
                            <>
                              <span className="value-currency">₹</span>
                              <span className="value-number">{coupon.value}</span>
                              <span className="value-label">OFF</span>
                            </>
                          )}
                        </div>
                        <div className="coupon-divider" />
                        <div className="coupon-info">
                          <div className="coupon-code-row">
                            <span className="code-label">Code:</span>
                            <span className="code-value">{coupon.code}</span>
                          </div>
                          <span className="used-badge">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path d="M20 6L9 17l-5-5" />
                            </svg>
                            Used
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === "expired" && (
            <>
              {expiredCoupons.length === 0 ? (
                <div className="coupons-empty">
                  <div className="empty-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  </div>
                  <h3>No expired coupons</h3>
                  <p>Expired or inactive coupons will appear here</p>
                </div>
              ) : (
                <div className="coupons-grid">
                  {expiredCoupons.map((coupon) => (
                    <div className="coupon-card expired" key={coupon.id}>
                      <div className="coupon-body">
                        <div className="coupon-value">
                          {coupon.type === "percentage" ? (
                            <>
                              <span className="value-number">{coupon.value}%</span>
                              <span className="value-label">OFF</span>
                            </>
                          ) : (
                            <>
                              <span className="value-currency">₹</span>
                              <span className="value-number">{coupon.value}</span>
                              <span className="value-label">OFF</span>
                            </>
                          )}
                        </div>
                        <div className="coupon-divider" />
                        <div className="coupon-info">
                          <div className="coupon-code-row">
                            <span className="code-label">Code:</span>
                            <span className="code-value">{coupon.code}</span>
                          </div>
                          <span className="expired-badge">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="10" />
                              <line x1="15" y1="9" x2="9" y2="15" />
                              <line x1="9" y1="9" x2="15" y2="15" />
                            </svg>
                            {isExpired(coupon.expiry) ? "Expired" : "Inactive"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Coupons;