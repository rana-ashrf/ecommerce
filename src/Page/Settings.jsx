import { useState } from "react";
import "../styles/Settings.css";
import API from "../api/axios";
import { useAuth } from "../Context/AuthContext";
import { useNavigate } from "react-router-dom";

function Settings() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      await API.post("/settings/change-password/", passwordData);

      alert("Password changed successfully. Please login again.");

      logout();
      navigate("/login");
    } catch (err) {
      console.error("Password change error:", err.response?.data || err);
      alert(err.response?.data?.error || "Could not change password");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone."
    );

    if (!confirmDelete) return;

    try {
      setLoading(true);

      await API.delete("/settings/delete-account/");

      alert("Your account has been deleted");

      logout();
      navigate("/register");
    } catch (err) {
      console.error("Delete account error:", err.response?.data || err);
      alert(err.response?.data?.error || "Could not delete account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings-container">
      <h2>Settings</h2>

      <div className="settings-card">
        <div className="settings-header">
          <h3>Change Password</h3>

          <button onClick={() => setShowPasswordForm(!showPasswordForm)}>
            {showPasswordForm ? "Cancel" : "Change"}
          </button>
        </div>

        {showPasswordForm && (
          <form className="password-form" onSubmit={handlePasswordSubmit}>
            <input
              type="password"
              name="currentPassword"
              placeholder="Current Password"
              value={passwordData.currentPassword}
              onChange={handleChange}
              required
            />

            <input
              type="password"
              name="newPassword"
              placeholder="New Password"
              value={passwordData.newPassword}
              onChange={handleChange}
              required
            />

            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm New Password"
              value={passwordData.confirmPassword}
              onChange={handleChange}
              required
            />

            <button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        )}
      </div>

      <div className="settings-card disabled">
        <h3>Language</h3>
        <select disabled>
          <option>English</option>
        </select>
      </div>

      <div className="settings-card danger">
        <button onClick={handleDeleteAccount} disabled={loading}>
          {loading ? "Deleting..." : "Delete My Account"}
        </button>
      </div>
    </div>
  );
}

export default Settings;