import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminAPI from "../../api/adminAxios";

function AdminRegister() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    phone: "",
    secretCode: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (form.secretCode !== "ADMIN2025") {
      alert("Invalid Admin Secret Code");
      return;
    }

    try {
      await AdminAPI.post("/admin/register/", {
        username: form.username,
        email: form.email,
        password: form.password,
        phone: form.phone,
      });

      alert("Admin registered successfully");
      navigate("/admin/login");
    } catch (err) {
      console.error(err.response?.data || err);
      alert("Admin registration failed");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f8f8f8, #eaeaea)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <form
        onSubmit={handleRegister}
        style={{
          width: "380px",
          background: "#fff",
          padding: "35px",
          borderRadius: "14px",
          boxShadow: "0 15px 40px rgba(0,0,0,0.1)",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: "5px" }}>
          Admin Registration
        </h2>

        <p
          style={{
            textAlign: "center",
            fontSize: "13px",
            color: "gray",
            marginBottom: "25px",
          }}
        >
          Authorized personnel only
        </p>

        <input
          type="text"
          name="username"
          placeholder="Admin Username"
          value={form.username}
          onChange={handleChange}
          required
          style={inputStyle}
        />

        <input
          type="email"
          name="email"
          placeholder="Admin Email"
          value={form.email}
          onChange={handleChange}
          required
          style={inputStyle}
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
          style={inputStyle}
        />

        <input
          type="text"
          name="phone"
          placeholder="Phone Number"
          value={form.phone}
          onChange={handleChange}
          required
          style={inputStyle}
        />

        <input
          type="password"
          name="secretCode"
          placeholder="Admin Secret Code"
          value={form.secretCode}
          onChange={handleChange}
          required
          style={inputStyle}
        />

        <button
          type="submit"
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "8px",
            border: "none",
            background: "black",
            color: "white",
            fontWeight: "bold",
            cursor: "pointer",
            marginTop: "5px",
          }}
        >
          Register Admin
        </button>

        <p
          style={{
            textAlign: "center",
            marginTop: "18px",
            fontSize: "13px",
          }}
        >
          Already an admin?{" "}
          <span
            onClick={() => navigate("/admin/login")}
            style={{
              color: "black",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            Login
          </span>
        </p>
      </form>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "12px",
  marginBottom: "15px",
  borderRadius: "8px",
  border: "1px solid #ccc",
  outline: "none",
};

export default AdminRegister;