import { useNavigate } from "react-router-dom";
import "../styles/AddAddress.css";
import { useAuth } from "../Context/AuthContext";
import API from "../api/axios";

function AddAddress() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const saveAddress = async (e) => {
    e.preventDefault();

    if (!user) {
      alert("Please login first");
      return;
    }

    const data = Object.fromEntries(new FormData(e.target));

    try {
      const existingRes = await API.get("/addresses/?isDefault=true");
      const existing = existingRes.data[0];

      if (existing) {
        await API.patch(`/addresses/${existing.id}/`, {
          ...data,
          isDefault: true,
        });
      } else {
        await API.post("/addresses/", {
          ...data,
          isDefault: true,
        });
      }

      localStorage.setItem("selectedAddress", JSON.stringify(data));

      navigate("/checkout");
    } catch (err) {
      console.error("Error saving address:", err.response?.data || err);
      alert("Could not save address");
    }
  };

  return (
    <div className="add-address-page">
      <div className="add-address-wrapper">
        <div className="address-header">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>

          <h1>Add Delivery Address</h1>
        </div>

        <form className="address-form" onSubmit={saveAddress}>
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

          <div className="form-section">
            <h2 className="section-label">Address Type</h2>

            <div className="address-type-options">
              <label className="type-option">
                <input type="radio" name="type" value="home" defaultChecked />
                <span className="type-box">Home</span>
              </label>

              <label className="type-option">
                <input type="radio" name="type" value="work" />
                <span className="type-box">Work</span>
              </label>

              <label className="type-option">
                <input type="radio" name="type" value="other" />
                <span className="type-box">Other</span>
              </label>
            </div>
          </div>

          <button type="submit" className="save-address-btn">
            Save Address
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddAddress;