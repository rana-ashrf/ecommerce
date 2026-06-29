import { useNavigate } from "react-router-dom";
import "../styles/Address.css";
import { useAuth } from "../Context/AuthContext";
import { useEffect, useState } from "react";
import API from "../api/axios";

function ChangeAddress() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    fetchAddresses();
  }, [user]);

  const fetchAddresses = async () => {
    try {
      setLoading(true);

      const res = await API.get("/addresses/");
      setAddresses(res.data);
    } catch (err) {
      console.error("Error fetching addresses:", err.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeliverHere = async (addr) => {
    try {
      await API.patch(`/addresses/${addr.id}/`, {
        isDefault: true,
      });

      navigate("/checkout");
    } catch (err) {
      console.error("Default address error:", err.response?.data || err);
      alert("Could not select this address");
    }
  };

  if (!user) {
    return (
      <div className="address-container">
        <h3>Please login to select address</h3>

        <button
          className="add-address-btn"
          onClick={() => navigate("/login")}
        >
          Login
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="address-container">
        <h3>Loading addresses...</h3>
      </div>
    );
  }

  return (
    <div className="address-container">
      <h3>Select Delivery Address</h3>

      {addresses.length === 0 ? (
        <p>No address added yet.</p>
      ) : (
        addresses.map((addr) => (
          <div
            key={addr.id}
            className={`address-box ${addr.isDefault ? "active" : ""}`}
          >
            <p>
              <b>{addr.name}</b>{" "}
              {addr.isDefault && <span>(Default)</span>}
            </p>

            <p>
              {addr.house}, {addr.area}, {addr.city}, {addr.state} -{" "}
              {addr.pincode}
            </p>

            <p>📞 {addr.phone}</p>

            <button onClick={() => handleDeliverHere(addr)}>
              Deliver Here
            </button>
          </div>
        ))
      )}

      <button
        className="add-address-btn"
        onClick={() => navigate("/add-address")}
      >
        + Add New Address
      </button>
    </div>
  );
}

export default ChangeAddress;