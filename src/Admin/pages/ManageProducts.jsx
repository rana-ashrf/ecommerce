import { useEffect, useState } from "react";
import axios from "axios";
import AdminSidebar from "../components/AdminSidebar";

const PRODUCT_API = "http://127.0.0.1:8000/api/admin/products/";
const CATEGORY_API = "http://127.0.0.1:8000/api/categories/";
const SUBCATEGORY_API = "http://127.0.0.1:8000/api/subcategories/";

const EMPTY_FORM = {
  name: "",
  price: "",
  discount: 0,
  color: "",
  stock: 10,
  category: "",
  subcategory: "",
  image: null,
};

function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);

  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingProduct, setEditingProduct] = useState(null);

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 10;

  const authHeaders = {
    Authorization: `Bearer ${localStorage.getItem("adminAccessToken")}`,
  };

  useEffect(() => {
    fetchAllProducts();
    fetchCategories();
    fetchSubcategories();
  }, []);

  const fetchAllProducts = async () => {
    try {
      const res = await axios.get(PRODUCT_API, {
        headers: authHeaders,
      });
      setProducts(res.data);
    } catch (err) {
      console.error("Failed to fetch products:", err.response?.data || err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get(CATEGORY_API);
      setCategories(res.data);
    } catch (err) {
      console.error("Failed to fetch categories:", err.response?.data || err);
    }
  };

  const fetchSubcategories = async () => {
    try {
      const res = await axios.get(SUBCATEGORY_API);
      setSubcategories(res.data);
    } catch (err) {
      console.error("Failed to fetch subcategories:", err.response?.data || err);
    }
  };

  const getFilteredSubcategories = () => {
    return subcategories.filter(
      (sub) => String(sub.category) === String(form.category)
    );
  };

  const totalCount = products.length;
  const activeCount = products.filter((p) => p.is_active).length;
  const outOfStockCount = products.filter((p) => !p.is_active).length;

  const filteredProducts = products.filter((p) => {
    const matchSearch = p.name?.toLowerCase().includes(search.toLowerCase());

    const matchCategory =
      selectedCategory === "all" ||
      String(p.category) === String(selectedCategory);

    return matchSearch && matchCategory;
  });

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const indexOfLast = currentPage * productsPerPage;
  const indexOfFirst = indexOfLast - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirst, indexOfLast);

  const handleAddProduct = async () => {
    if (
      !form.name ||
      !form.price ||
      !form.color ||
      !form.category ||
      !form.subcategory ||
      !form.image
    ) {
      alert("All fields required");
      return;
    }

    try {
      const data = new FormData();

      data.append("name", form.name);
      data.append("price", form.price);
      data.append("discount", form.discount);
      data.append("color", form.color);
      data.append("stock", form.stock);
      data.append("category", form.category);
      data.append("subcategory", form.subcategory);
      data.append("is_active", true);
      data.append("image", form.image);

      await axios.post(PRODUCT_API, data, {
        headers: {
          ...authHeaders,
          "Content-Type": "multipart/form-data",
        },
      });

      setShowAdd(false);
      setForm(EMPTY_FORM);
      fetchAllProducts();
    } catch (err) {
      console.error("Failed to add product:", err.response?.data || err);
      alert("Failed to add product. Check console.");
    }
  };

  const openEditModal = (product) => {
    setEditingProduct(product);

    setForm({
      name: product.name,
      price: product.price,
      discount: product.discount,
      color: product.color,
      stock: product.stock,
      category: product.category,
      subcategory: product.subcategory,
      image: null,
    });

    setShowEdit(true);
  };

  const handleEditProduct = async () => {
    try {
      const data = new FormData();

      data.append("name", form.name);
      data.append("price", form.price);
      data.append("discount", form.discount);
      data.append("color", form.color);
      data.append("stock", form.stock);
      data.append("category", form.category);
      data.append("subcategory", form.subcategory);

      // only append image if new image selected
      if (form.image) {
        data.append("image", form.image);
      }

      await axios.patch(`${PRODUCT_API}${editingProduct.id}/`, data, {
        headers: {
          ...authHeaders,
          "Content-Type": "multipart/form-data",
        },
      });

      setShowEdit(false);
      setEditingProduct(null);
      setForm(EMPTY_FORM);
      fetchAllProducts();
    } catch (err) {
      console.error("Failed to edit product:", err.response?.data || err);
      alert("Failed to edit product. Check console.");
    }
  };

  const toggleStatus = async (product) => {
    try {
      const data = new FormData();
      data.append("is_active", !product.is_active);

      await axios.patch(`${PRODUCT_API}${product.id}/`, data, {
        headers: {
          ...authHeaders,
          "Content-Type": "multipart/form-data",
        },
      });

      fetchAllProducts();
    } catch (err) {
      console.error("Failed to update status:", err.response?.data || err);
      alert("Failed to update status. Check console.");
    }
  };

  const handleDeleteProduct = async (product) => {
    if (!window.confirm(`Delete "${product.name}"?`)) return;

    try {
      await axios.delete(`${PRODUCT_API}${product.id}/`, {
        headers: authHeaders,
      });

      fetchAllProducts();
    } catch (err) {
      console.error("Failed to delete product:", err.response?.data || err);
    }
  };

  return (
    <div style={{ display: "flex" }}>
      <AdminSidebar />

      <main
        style={{
          marginLeft: 260,
          padding: 30,
          width: "100%",
          background: "#f1f5f9",
          minHeight: "100vh",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <h2>Manage Products</h2>

          <button
            onClick={() => {
              setForm(EMPTY_FORM);
              setShowAdd(true);
            }}
            style={btnPrimary}
          >
            + Add Product
          </button>
        </div>

        <div style={statsGrid}>
          <StatCard label="Total Products" value={totalCount} icon="📦" bg="#eef2ff" />
          <StatCard label="Active Products" value={activeCount} icon="✅" bg="#dcfce7" />
          <StatCard label="Inactive Products" value={outOfStockCount} icon="🚫" bg="#fee2e2" />
        </div>

        <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
          <input
            placeholder="Search products..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            style={inputStyle}
          />

          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentPage(1);
            }}
            style={inputStyle}
          >
            <option value="all">All Categories</option>

            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <table width="100%" cellPadding="12" style={tableStyle}>
          <thead style={{ background: "#f3f4f6", height: "50px" }}>
            <tr>
              <th align="left">Product</th>
              <th>Category</th>
              <th>Subcategory</th>
              <th>Price</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {currentProducts.map((p) => (
              <tr key={p.id}>
                <td style={{ display: "flex", gap: 12 }}>
                  <img
                    src={p.image}
                    alt={p.name}
                    style={{
                      width: 50,
                      height: 60,
                      objectFit: "cover",
                      borderRadius: 6,
                    }}
                  />
                  {p.name}
                </td>

                <td align="center">{p.categoryName}</td>
                <td align="center">{p.subcategoryName}</td>
                <td align="center">₹{p.price}</td>

                <td align="center">
                  <span
                    style={{
                      padding: "4px 10px",
                      borderRadius: 999,
                      background: p.is_active ? "#dcfce7" : "#fee2e2",
                      color: p.is_active ? "#166534" : "#991b1b",
                      fontSize: 12,
                    }}
                  >
                    {p.is_active ? "Active" : "Inactive"}
                  </span>
                </td>

                <td align="center">
                  <button onClick={() => openEditModal(p)}>Edit</button>

                  <button
                    onClick={() => toggleStatus(p)}
                    style={{ marginLeft: 8 }}
                  >
                    {p.is_active ? "Disable" : "Enable"}
                  </button>

                  <button
                    onClick={() => handleDeleteProduct(p)}
                    style={deleteBtn}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={pagination}>
          <button
            onClick={() => setCurrentPage((p) => p - 1)}
            disabled={currentPage === 1}
            style={pageNavBtn}
          >
            Previous
          </button>

          <span>
            Page {currentPage} of {totalPages || 1}
          </span>

          <button
            onClick={() => setCurrentPage((p) => p + 1)}
            disabled={currentPage === totalPages || totalPages === 0}
            style={pageNavBtn}
          >
            Next
          </button>
        </div>

        {showAdd && (
          <Modal
            title="Add Product"
            form={form}
            setForm={setForm}
            categories={categories}
            subcategories={getFilteredSubcategories()}
            onSave={handleAddProduct}
            onClose={() => setShowAdd(false)}
          />
        )}

        {showEdit && (
          <Modal
            title="Edit Product"
            form={form}
            setForm={setForm}
            categories={categories}
            subcategories={getFilteredSubcategories()}
            onSave={handleEditProduct}
            onClose={() => setShowEdit(false)}
          />
        )}
      </main>
    </div>
  );
}

export default ManageProducts;

const Modal = ({
  title,
  form,
  setForm,
  categories,
  subcategories,
  onSave,
  onClose,
}) => (
  <div style={modalOverlay}>
    <div style={modalBox}>
      <h3>{title}</h3>

      <input
        placeholder="Name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />

      <input
        type="number"
        placeholder="Price"
        value={form.price}
        onChange={(e) => setForm({ ...form, price: e.target.value })}
      />

      <input
        type="number"
        placeholder="Discount"
        value={form.discount}
        onChange={(e) => setForm({ ...form, discount: e.target.value })}
      />

      <input
        placeholder="Color"
        value={form.color}
        onChange={(e) => setForm({ ...form, color: e.target.value })}
      />

      <input
        type="number"
        placeholder="Stock"
        value={form.stock}
        onChange={(e) => setForm({ ...form, stock: e.target.value })}
      />

      <select
        value={form.category}
        onChange={(e) =>
          setForm({
            ...form,
            category: e.target.value,
            subcategory: "",
          })
        }
      >
        <option value="">Select Category</option>

        {categories.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.name}
          </option>
        ))}
      </select>

      <select
        value={form.subcategory}
        onChange={(e) => setForm({ ...form, subcategory: e.target.value })}
      >
        <option value="">Select Subcategory</option>

        {subcategories.map((sub) => (
          <option key={sub.id} value={sub.id}>
            {sub.name}
          </option>
        ))}
      </select>

      <input
        type="file"
        accept="image/*"
        onChange={(e) =>
          setForm({
            ...form,
            image: e.target.files[0],
          })
        }
      />

      <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
        <button onClick={onSave} style={btnPrimary}>
          Save
        </button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  </div>
);

const StatCard = ({ label, value, icon, bg }) => (
  <div style={{ ...stat, background: bg }}>
    <div style={iconCircle}>{icon}</div>
    <p style={statLabel}>{label}</p>
    <h2>{value}</h2>
  </div>
);

const btnPrimary = {
  background: "linear-gradient(135deg, #6366f1, #2563eb)",
  color: "#fff",
  padding: "10px 18px",
  border: "none",
  borderRadius: 10,
  fontWeight: 600,
  cursor: "pointer",
};

const deleteBtn = {
  marginLeft: 8,
  background: "linear-gradient(135deg, #ef4444, #dc2626)",
  color: "white",
  border: "none",
  padding: "6px 12px",
  borderRadius: 8,
  cursor: "pointer",
};

const inputStyle = {
  padding: "10px 14px",
  borderRadius: 10,
  border: "1px solid #e5e7eb",
  width: 250,
};

const tableStyle = {
  background: "white",
  borderRadius: 14,
  overflow: "hidden",
};

const statsGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(3,1fr)",
  gap: 20,
  margin: "30px 0",
};

const stat = {
  padding: 22,
  borderRadius: 16,
  textAlign: "center",
};

const iconCircle = {
  fontSize: 30,
};

const statLabel = {
  color: "#475569",
};

const pagination = {
  marginTop: 30,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: 18,
};

const pageNavBtn = {
  padding: "8px 16px",
  borderRadius: 10,
  border: "1px solid #d1d5db",
  background: "#fff",
  cursor: "pointer",
};

const modalOverlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(15,23,42,0.6)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 50,
};

const modalBox = {
  background: "white",
  padding: 30,
  borderRadius: 18,
  width: 420,
  display: "flex",
  flexDirection: "column",
  gap: 12,
};