import { useAdminAuth } from "../../Context/AdminAuthContext";

function AdminHeader() {
  const { admin } = useAdminAuth();

  return (
    <div style={header}>
      <div>
        <h2 style={{ margin: 0 }}>
          Hello, {admin?.username || "Admin"} 👋
        </h2>
      </div>

      <div style={rightSection}>
        <div style={profile}>
          <img
            src="https://cdn-icons-png.flaticon.com/512/4159/4159471.png"
            alt="admin"
            style={avatar}
          />
          <span style={{ fontSize: 14 }}>
            {admin?.username || "Admin"}
          </span>
        </div>
      </div>
    </div>
  );
}

export default AdminHeader;

const header = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "20px",
  background: "white",
  padding: "16px 24px",
  borderRadius: "16px",
  boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
  flexWrap: "wrap",
};

const rightSection = {
  display: "flex",
  alignItems: "center",
  gap: "16px",
};

const profile = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  background: "#f9fafb",
  padding: "6px 12px",
  borderRadius: "999px",
};

const avatar = {
  width: 36,
  height: 36,
  borderRadius: "50%",
};