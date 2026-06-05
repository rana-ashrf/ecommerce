import { useNavigate } from "react-router-dom";
import "../styles/AddAddress.css";
import { useAuth } from "../Context/AuthContext";
import axios from "axios";

function AddAddress() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const saveAddress = async (e) => {
    e.preventDefault();
    if (!user) return;

    const data = Object.fromEntries(new FormData(e.target));

    try {
      const existingRes = await axios.get(
        `http://localhost:5000/addresses?userId=${user.id}`
      );
      const existing = existingRes.data[0];

      if (existing) {
        await axios.patch(
          `http://localhost:5000/addresses/${existing.id}`,
          {
            ...existing,
            ...data,
            isDefault: true,
          }
        );
      } else {
        await axios.post("http://localhost:5000/addresses", {
          ...data,
          userId: user.id,
          isDefault: true,
        });
      }

      navigate("/checkout");
    } catch (err) {
      console.error("Error saving address:", err);
      alert("Could not save address. Make sure json-server is running.");
    }
  };

  return (
    <div className="add-address-page">
      <div className="add-address-wrapper">
        {/* Header */}
        <div className="address-header">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <h1>Add Delivery Address</h1>
        </div>

        <form className="address-form" onSubmit={saveAddress}>
          {/* Contact Details */}
          <div className="form-section">
            <h2 className="section-label">Contact Details</h2>
            
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <div className="input-with-icon">
                <span className="country-code">+91</span>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="10-digit mobile number"
                  pattern="[0-9]{10}"
                  maxLength="10"
                  required
                />
              </div>
              <span className="input-hint">May be used to assist delivery</span>
            </div>
          </div>

          {/* Address Details */}
          <div className="form-section">
            <h2 className="section-label">Address</h2>
            
            <div className="form-group">
              <label htmlFor="house">House / Flat / Building</label>
              <input
                id="house"
                name="house"
                type="text"
                placeholder="House no., Building name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="area">Road / Area / Colony</label>
              <input
                id="area"
                name="area"
                type="text"
                placeholder="Road name, Area, Colony"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="city">City</label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  placeholder="City"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="state">State</label>
                <input
                  id="state"
                  name="state"
                  type="text"
                  placeholder="State"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="pincode">Pincode</label>
              <input
                id="pincode"
                name="pincode"
                type="text"
                placeholder="6-digit pincode"
                pattern="[0-9]{6}"
                maxLength="6"
                required
              />
            </div>
          </div>

          {/* Address Type */}
          <div className="form-section">
            <h2 className="section-label">Address Type</h2>
            <div className="address-type-options">
              <label className="type-option">
                <input type="radio" name="type" value="home" defaultChecked />
                <span className="type-box">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                  Home
                </span>
              </label>
              <label className="type-option">
                <input type="radio" name="type" value="work" />
                <span className="type-box">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                    <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
                  </svg>
                  Work
                </span>
              </label>
              <label className="type-option">
                <input type="radio" name="type" value="other" />
                <span className="type-box">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                  Other
                </span>
              </label>
            </div>
          </div>

          {/* Submit */}
          <button type="submit" className="save-address-btn">
            Save Address
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddAddress;