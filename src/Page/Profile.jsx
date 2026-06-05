import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Profile.css";
import { useAuth } from "../Context/AuthContext";
import axios from "axios";

function Profile() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);

  const [userState, setUserState] = useState({
    fullName: "",
    email: "",
    phone: "",
    gender: "",
    dob: ""
  });

  useEffect(() => {
    if (!user) return;

    setUserState({
      fullName: user.fullName || user.username || user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      gender: user.gender || "",
      dob: user.dob || ""
    });
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserState((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    try {
      const res = await axios.patch(
        `http://localhost:5000/users/${user.id}`,
        userState
      );

      login(res.data);
      setEditMode(false);
      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Failed to update profile", err);
      alert("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (!user) return;
    setUserState({
      fullName: user.fullName || user.username || user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      gender: user.gender || "",
      dob: user.dob || ""
    });
    setEditMode(false);
  };

  const userInitial = userState.fullName ? userState.fullName[0].toUpperCase() : "U";

  if (!user) {
    return (
      <div className="profile-empty-state">
        <div className="empty-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
        <h2>Please login to view your profile</h2>
        <button className="empty-action-btn" onClick={() => navigate("/login")}>
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-wrapper">
        {/* Header */}
        <div className="profile-header">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <h1>My Profile</h1>
        </div>

        {/* Profile Card */}
        <div className="profile-card">
          <div className="profile-avatar-section">
            <div className="profile-avatar">
              <span>{userInitial}</span>
            </div>
            <div className="profile-name-section">
              <h2>{userState.fullName || "Your Name"}</h2>
              <p>{userState.email || "No email added"}</p>
            </div>
          </div>

          {/* Edit Toggle */}
          {!editMode && (
            <button className="edit-toggle-btn" onClick={() => setEditMode(true)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Edit Profile
            </button>
          )}
        </div>

        {/* Form */}
        <div className={`profile-form ${editMode ? "editing" : ""}`}>
          <div className="form-section">
            <h3 className="section-label">Personal Information</h3>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="fullName">Full Name</label>
                <div className="input-wrapper">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <input
                    id="fullName"
                    type="text"
                    name="fullName"
                    value={userState.fullName}
                    onChange={handleChange}
                    disabled={!editMode}
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <div className="input-wrapper">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  <input
                    id="email"
                    type="email"
                    value={userState.email}
                    disabled
                    placeholder="your@email.com"
                  />
                </div>
                <span className="input-hint">Email cannot be changed</span>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <div className="input-wrapper">
                  <span className="country-code">+91</span>
                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    value={userState.phone}
                    onChange={handleChange}
                    disabled={!editMode}
                    placeholder="10-digit mobile number"
                    maxLength="10"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="gender">Gender</label>
                <div className="input-wrapper">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4M12 8h.01" />
                  </svg>
                  <select
                    id="gender"
                    name="gender"
                    value={userState.gender}
                    onChange={handleChange}
                    disabled={!editMode}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="dob">Date of Birth</label>
              <div className="input-wrapper">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <input
                  id="dob"
                  type="date"
                  name="dob"
                  value={userState.dob}
                  onChange={handleChange}
                  disabled={!editMode}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          {editMode && (
            <div className="form-actions">
              <button
                className="save-btn"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <div className="btn-spinner" />
                    Saving...
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    Save Changes
                  </>
                )}
              </button>
              <button className="cancel-btn" onClick={handleCancel}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Security Section - Read Only */}
        {!editMode && (
          <div className="form-section">
            <h3 className="section-label">Account Security</h3>
            <div className="security-card">
              <div className="security-item">
                <div className="security-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                </div>
                <div className="security-info">
                  <span className="security-title">Password</span>
                  <span className="security-desc">Last changed 3 months ago</span>
                </div>
                <button className="security-action" onClick={() => alert("Coming soon")}>
                  Change
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;