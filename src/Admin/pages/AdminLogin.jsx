import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "../../Context/AdminAuthContext";
import AdminAPI from "../../api/adminAxios";

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { adminLogin } = useAdminAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await AdminAPI.post("/admin/login/", {
        email,
        password,
      });

      adminLogin(res.data);
      navigate("/admin/dashboard", { replace: true });
    } catch (err) {
      console.error(err.response?.data || err);
      alert("Invalid admin credentials or admin blocked");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f5f5f5",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: "320px",
          padding: "30px",
          background: "#fff",
          borderRadius: "10px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
          Admin Login
        </h2>

        <input
          type="email"
          placeholder="Admin Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: "100%", padding: "10px", marginBottom: "15px" }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ width: "100%", padding: "10px", marginBottom: "20px" }}
        />

        <button
          type="submit"
          style={{
            width: "100%",
            padding: "10px",
            background: "black",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          Login
        </button>

        <p
          style={{
            textAlign: "center",
            marginTop: "18px",
            fontSize: "13px",
          }}
        >
          Don’t have an account?{" "}
          <span
            onClick={() => navigate("/admin/register")}
            style={{
              color: "black",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            Register
          </span>
        </p>
      </form>
    </div>
  );
}

export default AdminLogin;