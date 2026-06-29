import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Profile.css";
import { useAuth } from "../Context/AuthContext";
import API from "../api/axios";

function Profile() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const [userState, setUserState] = useState({
    fullName: "",
    email: "",
    phone: "",
    gender: "",
    dob: "",
  });

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);

      const res = await API.get("/profile/");

      setUserState({
        fullName: res.data.fullName || res.data.username || "",
        email: res.data.email || "",
        phone: res.data.phone || "",
        gender: res.data.gender || "",
        dob: res.data.dob || "",
      });
    } catch (err) {
      console.error("Failed to load profile:", err.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setUserState((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const res = await API.patch("/profile/", {
        fullName: userState.fullName,
        phone: userState.phone,
        gender: userState.gender,
        dob: userState.dob || null,
      });

      const access = localStorage.getItem("access");
      const refresh = localStorage.getItem("refresh");

      login(
        {
          ...user,
          ...res.data,
        },
        access,
        refresh
      );

      setUserState({
        fullName: res.data.fullName || res.data.username || "",
        email: res.data.email || "",
        phone: res.data.phone || "",
        gender: res.data.gender || "",
        dob: res.data.dob || "",
      });

      setEditMode(false);
      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Failed to update profile:", err.response?.data || err);
      alert("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    fetchProfile();
    setEditMode(false);
  };

  const userInitial = userState.fullName
    ? userState.fullName[0].toUpperCase()
    : "U";

  if (!user) {
    return (
      <div className="profile-empty-state">
        <h2>Please login to view your profile</h2>

        <button className="empty-action-btn" onClick={() => navigate("/login")}>
          Sign In
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="profile-empty-state">
        <h2>Loading profile...</h2>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-wrapper">
        <div className="profile-header">
          <button className="back-btn" onClick={() => navigate(-1)}>
            ←
          </button>

          <h1>My Profile</h1>
        </div>

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

          {!editMode && (
            <button
              className="edit-toggle-btn"
              onClick={() => setEditMode(true)}
            >
              Edit Profile
            </button>
          )}
        </div>

        <div className={`profile-form ${editMode ? "editing" : ""}`}>
          <div className="form-section">
            <h3 className="section-label">Personal Information</h3>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="fullName">Full Name</label>

                <div className="input-wrapper">
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
                <input
                  id="dob"
                  type="date"
                  name="dob"
                  value={userState.dob || ""}
                  onChange={handleChange}
                  disabled={!editMode}
                />
              </div>
            </div>
          </div>

          {editMode && (
            <div className="form-actions">
              <button
                className="save-btn"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>

              <button className="cancel-btn" onClick={handleCancel}>
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;