import { useEffect, useState } from "react";
import axios from "axios";
import AdminSidebar from "../components/AdminSidebar";

function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [viewUser, setViewUser] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  useEffect(() => {
    fetchUsers();
  }, []);

  const API_URL = "http://127.0.0.1:8000/api/admin/users/";

  const fetchUsers = async () => {
    try {
      const res = await axios.get(API_URL, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminAccessToken")}`,
        },
      });

      const formatted = res.data.map((u) => ({
        ...u,
        status: u.is_blocked ? "Blocked" : "Active",
      }));

      setUsers(formatted);
    } catch (err) {
      console.error(err);
    }
  };

  const totalUsers = users.length;
  const activeUsers = users.filter((u) => !u.is_blocked).length;
  const blockedUsers = users.filter((u) => u.is_blocked).length;

  const filteredUsers = users.filter(
    (u) =>
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const indexOfLast = currentPage * usersPerPage;
  const indexOfFirst = indexOfLast - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const toggleBlock = async (user) => {
    try {
      await axios.patch(
        `http://127.0.0.1:8000/api/admin/users/${user.id}/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminAccessToken")}`,
          },
        }
      );

      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <AdminSidebar />

      <main style={main}>
        <h2 style={heading}>Customers</h2>

        <div style={statsGrid}>
          <StatCard label="Total Users" value={totalUsers} icon="👥" bg="#eef2ff" />
          <StatCard label="Active Users" value={activeUsers} icon="✅" bg="#dcfce7" />
          <StatCard
            label="Blocked Users"
            value={blockedUsers}
            icon="🚫"
            bg="#fee2e2"
          />
        </div>

        <input
          placeholder="Search customers..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          style={searchInput}
        />

        <div style={{ overflowX: "auto" }}>
          <table style={table}>
            <thead style={thead}>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Orders</th>
                <th>Total Spent</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {currentUsers.map((u) => (
                <tr
                  key={u.id}
                  style={row}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#f9fafb")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <td>{u.username}</td>
                  <td>{u.email}</td>
                  <td align="center">{u.ordersCount}</td>
                  <td align="center">₹{u.totalSpent}</td>
                  <td align="center">
                    <span
                      style={{
                        ...badge,
                        background: u.is_blocked ? "#fee2e2" : "#dcfce7",
                        color: u.is_blocked ? "#991b1b" : "#166534",
                      }}
                    >
                      {u.status}
                    </span>
                  </td>

                  <td align="center">
                    <button style={viewBtn} onClick={() => setViewUser(u)}>
                      View
                    </button>
                    <button style={blockBtn} onClick={() => toggleBlock(u)}>
                      {u.is_blocked ? "Unblock" : "Block"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={pagination}>
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            style={navBtn}
          >
            Previous
          </button>

          <div style={pageNumberWrap}>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                style={{
                  ...pageBtn,
                  background: currentPage === i + 1 ? "#6366f1" : "#e5e7eb",
                  color: currentPage === i + 1 ? "white" : "#111",
                }}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <button
            disabled={currentPage === totalPages || totalPages === 0}
            onClick={() => setCurrentPage((p) => p + 1)}
            style={navBtn}
          >
            Next
          </button>
        </div>

        {viewUser && <ViewUserModal user={viewUser} onClose={() => setViewUser(null)} />}
      </main>
    </div>
  );
}

export default ManageUsers;

/* COMPONENTS */

const StatCard = ({ label, value, icon, bg }) => (
  <div style={{ ...stat, background: bg }}>
    <div style={iconCircle}>{icon}</div>
    <p>{label}</p>
    <h2>{value}</h2>
  </div>
);

const ViewUserModal = ({ user, onClose }) => (
  <div style={overlay}>
    <div style={modal}>
      <h2>User Details</h2>
      <p>
        <b>Name:</b> {user.username}
      </p>
      <p>
        <b>Email:</b> {user.email}
      </p>
      <p>
        <b>Phone:</b> {user.phone}
      </p>
      <p>
        <b>Orders:</b> {user.ordersCount}
      </p>
      <p>
        <b>Total Spent:</b> ₹{user.totalSpent}
      </p>
      <button style={closeBtn} onClick={onClose}>
        Close
      </button>
    </div>
  </div>
);

/* STYLES */

const main = {
  marginLeft: 260,
  padding: 30,
  width: "100%",
  background: "#f1f5f9",
};

const heading = {
  fontSize: 24,
  fontWeight: 700,
};

const statsGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
  gap: 20,
  margin: "20px 0",
};

const stat = {
  padding: 10,
  borderRadius: 18,
  textAlign: "center",
  boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
};

const iconCircle = {
  fontSize: 28,
  width: 50,
  height: 50,
  borderRadius: "50%",
  background: "rgba(255,255,255,0.7)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  margin: "0 auto 8px",
};

const searchInput = {
  padding: "10px 14px",
  width: "100%",
  maxWidth: 320,
  borderRadius: 10,
  border: "1px solid #d1d5db",
  marginBottom: 20,
};

const table = {
  width: "100%",
  minWidth: 750,
  background: "white",
  borderRadius: 14,
  borderCollapse: "collapse",
  boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
};

const thead = {
  background: "#e0e7ff",
  height: "50px",
};

const row = {
  transition: "background 0.2s",
  height: "50px",
};

const badge = {
  padding: "4px 12px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 600,
};

const viewBtn = {
  padding: "6px 12px",
  borderRadius: 8,
  border: "none",
  background: "#6366f1",
  color: "white",
  cursor: "pointer",
};

const blockBtn = {
  padding: "6px 12px",
  borderRadius: 8,
  border: "none",
  marginLeft: 8,
  background: "#f59e0b",
  color: "white",
  cursor: "pointer",
};

const pagination = {
  marginTop: 30,
  display: "flex",
  justifyContent: "center",
  gap: 14,
  flexWrap: "wrap",
};

const navBtn = {
  padding: "8px 16px",
  borderRadius: 10,
  border: "1px solid #d1d5db",
  background: "white",
  cursor: "pointer",
};

const pageBtn = {
  padding: "6px 12px",
  borderRadius: 8,
  border: "none",
  cursor: "pointer",
};

const pageNumberWrap = {
  display: "flex",
  gap: 6,
};

const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(15,23,42,0.6)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const modal = {
  background: "white",
  padding: 30,
  borderRadius: 16,
  width: "90%",
  maxWidth: 420,
  boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
};

const closeBtn = {
  marginTop: 16,
  padding: "8px 16px",
  borderRadius: 10,
  border: "none",
  background: "#2563eb",
  color: "white",
  cursor: "pointer",
};