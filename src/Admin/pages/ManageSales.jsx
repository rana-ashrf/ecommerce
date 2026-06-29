import { useEffect, useState } from "react";
import axios from "axios";
import AdminSidebar from "../components/AdminSidebar";

// const CATEGORIES = ["dresses", "Tops", "bottoms", "knitwear", "outerwear"];

function ManageSales() {
  const [products, setProducts] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 10;

  const [showCouponModal, setShowCouponModal] = useState(false);
  const [couponForm, setCouponForm] = useState({
    code: "",
    type: "percentage",
    value: "",
    minAmount: "",
    expiry: "",
  });

  useEffect(() => {
    loadProducts();
    loadCoupons();
  }, []);

  /* =========== PRODUCTS (unchanged) =========== */
  const loadProducts = async () => {
    try {
      const token = localStorage.getItem("adminToken");

      const res = await axios.get(
        "http://127.0.0.1:8000/api/admin/products/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setProducts(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const updateDiscount = async (product, value) => {
    try {
      const token = localStorage.getItem("adminToken");

      await axios.patch(
        `http://127.0.0.1:8000/api/admin/products/${product.id}/`,
        {
          discount: Number(value),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      loadProducts();
    } catch (error) {
      console.log(error);
    }
  };

  /* =========== COUPONS NOW FROM JSON-SERVER =========== */
  const loadCoupons = async () => {
    try {
      const token = localStorage.getItem("adminAccessToken");

      const res = await axios.get(
        "http://127.0.0.1:8000/api/admin/coupons/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCoupons(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const saveCoupon = async () => {
    if (!couponForm.code || !couponForm.value || !couponForm.expiry) {
      alert("All fields required");
      return;
    }

    // const newCoupon = {
    //   ...couponForm,
    //   code: couponForm.code.toUpperCase(),
    //   value: Number(couponForm.value),
    //   minAmount: Number(couponForm.minAmount) || 0,
    //   used: false,
    //   active: true,
    // };

    const token = localStorage.getItem("adminAccessToken");

    await axios.post(
      "http://127.0.0.1:8000/api/admin/coupons/",
      {
        code: couponForm.code.toUpperCase(),
        type: couponForm.type,
        value: couponForm.value,
        minAmount: couponForm.minAmount || 0,
        expiry: couponForm.expiry,
        active: true,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // reload from server
    await loadCoupons();

    // reset form + close
    setCouponForm({
      code: "",
      type: "percentage",
      value: "",
      minAmount: "",
      expiry: "",
    });
    setShowCouponModal(false);
  };

  const toggleCoupon = async (coupon) => {
    const token = localStorage.getItem("adminAccessToken");

    await axios.patch(
      `http://127.0.0.1:8000/api/admin/coupons/${coupon.id}/`,
      {
        active: !coupon.active,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    loadCoupons();
  };

  const deleteCoupon = async (coupon) => {
    if (!window.confirm("Do you want to delete this coupon?")) return;
    const token = localStorage.getItem("adminAccessToken");

    await axios.delete(
      `http://127.0.0.1:8000/api/admin/coupons/${coupon.id}/`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    loadCoupons();
  };

  /* =========== PRODUCT TABLE FILTER/PAGINATION =========== */
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredProducts.length / perPage);
  const start = (page - 1) * perPage;
  const currentProducts = filteredProducts.slice(start, start + perPage);

  return (
    <div style={wrapper}>
      <AdminSidebar />

      <main style={main}>
        <h2 style={title}>Manage Sales</h2>

        {/* PRODUCT DISCOUNTS */}
        {/* <section style={card}>
          <h3 style={sectionTitle}>Product Discounts</h3>

          <input
            placeholder="🔍 Search product..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            style={searchInput}
          />

          <table style={table}>
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Discount (%)</th>
              </tr>
            </thead>
            <tbody>
              {currentProducts.map((p) => (
                <tr key={`${p.category}-${p.id}`}>
                  <td>{p.name}</td>
                  <td>{p.category}</td>
                  <td>₹{p.price}</td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      max="90"
                      value={p.discount}
                      onChange={(e) => updateDiscount(p, e.target.value)}
                      style={discountInput}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={pagination}>
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              style={{ ...navBtn, opacity: page === 1 ? 0.5 : 1 }}
            >
              Previous
            </button>

            <span style={{ fontWeight: 600 }}>
              Page {page} of {totalPages || 1}
            </span>

            <button
              disabled={page === totalPages || totalPages === 0}
              onClick={() => setPage(page + 1)}
              style={{
                ...navBtn,
                opacity:
                  page === totalPages || totalPages === 0 ? 0.5 : 1,
              }}
            >
              Next
            </button>
          </div>
        </section> */}

        {/* COUPONS */}
        <section style={{ ...card, marginTop: 40 }}>
          <div style={flexBetween}>
            <h3 style={sectionTitle}>Coupons</h3>
            <button
              onClick={() => setShowCouponModal(true)}
              style={btnPrimary}
            >
              + Add Coupon
            </button>
          </div>

          {coupons.map((c) => (
            <div key={c.id} style={couponCard}>
              <div>
                <b style={{ fontSize: 18 }}>{c.code}</b>
                <p style={{ margin: "6px 0" }}>
                  {c.type === "percentage"
                    ? `${c.value}% off`
                    : `₹${c.value} off`}
                </p>
                <small>Min Order: ₹{c.minAmount}</small>
                <br />
                <small>Expires: {c.expiry}</small>
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => toggleCoupon(c)}
                  style={{
                    ...btnPrimary,
                    background: c.active
                      ? "linear-gradient(135deg,#ef4444,#dc2626)"
                      : "linear-gradient(135deg,#22c55e,#16a34a)",
                  }}
                >
                  {c.active ? "Disable" : "Enable"}
                </button>

                <button
                  onClick={() => deleteCoupon(c)}
                  style={btnGrey}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </section>

        {/* COUPON MODAL */}
        {showCouponModal && (
          <div style={overlay}>
            <div style={modal}>
              <h3 style={{ marginBottom: 10 }}>Add Coupon</h3>

              <input
                placeholder="Coupon Code"
                value={couponForm.code}
                onChange={(e) =>
                  setCouponForm({ ...couponForm, code: e.target.value })
                }
                style={inputFull}
              />

              <select
                value={couponForm.type}
                onChange={(e) =>
                  setCouponForm({ ...couponForm, type: e.target.value })
                }
                style={inputFull}
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Flat ₹</option>
              </select>

              <input
                type="number"
                placeholder="Discount Value"
                value={couponForm.value}
                onChange={(e) =>
                  setCouponForm({ ...couponForm, value: e.target.value })
                }
                style={inputFull}
              />

              <input
                type="number"
                placeholder="Minimum Order Amount (₹)"
                value={couponForm.minAmount}
                onChange={(e) =>
                  setCouponForm({ ...couponForm, minAmount: e.target.value })
                }
                style={inputFull}
              />

              <input
                type="date"
                value={couponForm.expiry}
                onChange={(e) =>
                  setCouponForm({ ...couponForm, expiry: e.target.value })
                }
                style={inputFull}
              />

              <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                <button style={btnPrimary} onClick={saveCoupon}>
                  Save
                </button>
                <button
                  style={btnGrey}
                  onClick={() => setShowCouponModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default ManageSales;

/* ================= STYLES ================= */

const wrapper = {
  display: "flex",
  minHeight: "100vh",
  background: "linear-gradient(135deg,#fdf2f8,#eef2ff)",
};

const main = {
  marginLeft: 260,
  padding: 30,
  width: "100%",
};

const title = {
  fontSize: 26,
  fontWeight: 700,
  marginBottom: 20,
};

const card = {
  background: "#fff",
  padding: 24,
  borderRadius: 16,
  boxShadow: "0 15px 30px rgba(0,0,0,0.08)",
};

const sectionTitle = {
  fontSize: 20,
  fontWeight: 600,
};

const table = {
  width: "100%",
  marginTop: 16,
  borderCollapse: "collapse",
};

const discountInput = {
  width: 70,
  padding: 6,
  borderRadius: 6,
  border: "1px solid #ccc",
};

const btnPrimary = {
  background: "linear-gradient(135deg,#6366f1,#2563eb)",
  color: "#fff",
  padding: "8px 14px",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
};

const btnGrey = {
  background: "#6b7280",
  color: "#fff",
  padding: "8px 14px",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
};

const pagination = {
  display: "flex",
  justifyContent: "space-between",
  marginTop: 16,
  alignItems: "center",
};

const navBtn = {
  padding: "6px 14px",
  borderRadius: 8,
  border: "1px solid #ddd",
};

const searchInput = {
  padding: 12,
  width: 280,
  marginTop: 12,
  borderRadius: 10,
  border: "1px solid #ddd",
};

const flexBetween = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const couponCard = {
  display: "flex",
  justifyContent: "space-between",
  background: "linear-gradient(135deg,#f1f5f9,#e0e7ff)",
  padding: 18,
  borderRadius: 14,
  marginTop: 14,
};

const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.45)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const modal = {
  background: "#fff",
  padding: 24,
  borderRadius: 16,
  width: 360,
  boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
};

const inputFull = {
  width: "100%",
  padding: 12,
  borderRadius: 10,
  border: "1px solid #ddd",
  marginBottom: 10,
};