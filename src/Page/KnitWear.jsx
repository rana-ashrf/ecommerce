import { useEffect, useState } from "react";
import API from "../api/axios";
import { useWishlist } from "../Context/WishlistContext";
import "../styles/Dresses.css";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "./Navbar";
import { getFinalPrice } from "../utils/price";

const categories = ["All"];

const colors = [
  "Black", "White", "Red", "Green", "Blue", "Pink",
  "Brown", "Grey", "Cream", "Yellow", "Purple",
  "Burgundy", "Navy", "Violet"
];

const sizes = ["S", "M", "L", "XL"];

function KnitWear() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [tops, setTops] = useState([]);
  const { toggleWishlist } = useWishlist();

  const category = searchParams.get("category") || "All";
  const sort = searchParams.get("sort") || "";
  const color = searchParams.get("color") || "";
  const size = searchParams.get("size") || "";
  const min = Number(searchParams.get("min")) || 0;
  const max = searchParams.get("max")
    ? Number(searchParams.get("max"))
    : 5000;

  useEffect(() => {
    API.get("/products/?category=Knitwear")
      .then((res) => setTops(res.data))
      .catch((err) => console.error(err));
  }, []);

  const updateParam = (key, value) => {
    const params = Object.fromEntries(searchParams.entries());

    if (!value || value === "All") {
      delete params[key];
    } else {
      params[key] = value;
    }

    setSearchParams(params);
  };

  let filtered = tops.filter(
    (item) =>
      (category === "All" || item.subcategoryName === category) &&
      (!color || item.color === color) &&
      (!size || item.size?.includes(size)) &&
      Number(item.price) >= min &&
      Number(item.price) <= max
  );

  if (sort === "low-high") {
    filtered.sort(
      (a, b) =>
        getFinalPrice(a.price, a.discount) -
        getFinalPrice(b.price, b.discount)
    );
  }

  if (sort === "high-low") {
    filtered.sort(
      (a, b) =>
        getFinalPrice(b.price, b.discount) -
        getFinalPrice(a.price, a.discount)
    );
  }

  const activeFilterCount =
    [color, size].filter(Boolean).length +
    (min > 0 || max < 5000 ? 1 : 0);

  const clearFilters = () => {
    setSearchParams({});
  };

  return (
    <div className="dresses-page">
      <Navbar textColor="black" />

      <div className="dresses-wrapper">
        <div className="page-header">
          <h1>Knitwear</h1>

          <span className="item-count">
            {filtered.length} {filtered.length === 1 ? "item" : "items"}
          </span>
        </div>

        <div className="filter-bar">
          <div className="category-pills">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`category-pill ${
                  category === cat ? "active" : ""
                }`}
                onClick={() => updateParam("category", cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <select
            className="filter-select"
            value={sort}
            onChange={(e) => updateParam("sort", e.target.value)}
          >
            <option value="">Sort by</option>
            <option value="low-high">Price: Low to High</option>
            <option value="high-low">Price: High to Low</option>
          </select>

          <select
            className="filter-select"
            value={color}
            onChange={(e) => updateParam("color", e.target.value)}
          >
            <option value="">Color</option>
            {colors.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            className="filter-select"
            value={size}
            onChange={(e) => updateParam("size", e.target.value)}
          >
            <option value="">Size</option>
            {sizes.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <div className="price-inputs">
            <input
              className="price-input"
              type="number"
              placeholder="Min"
              value={min || ""}
              onChange={(e) => updateParam("min", e.target.value)}
            />

            <span className="price-separator">—</span>

            <input
              className="price-input"
              type="number"
              placeholder="Max"
              value={max === 5000 ? "" : max}
              onChange={(e) => updateParam("max", e.target.value)}
            />
          </div>
        </div>

        {activeFilterCount > 0 && (
          <div className="active-filters">
            {color && (
              <span className="filter-tag">
                Color: {color}
                <button onClick={() => updateParam("color", "")}>
                  ×
                </button>
              </span>
            )}

            {size && (
              <span className="filter-tag">
                Size: {size}
                <button onClick={() => updateParam("size", "")}>
                  ×
                </button>
              </span>
            )}

            {(min > 0 || max < 5000) && (
              <span className="filter-tag">
                ₹{min} — ₹{max}
                <button
                  onClick={() => {
                    updateParam("min", "");
                    updateParam("max", "");
                  }}
                >
                  ×
                </button>
              </span>
            )}

            <button className="clear-all" onClick={clearFilters}>
              Clear All
            </button>
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="products-empty">
            <h3>No items found</h3>
            <p>Try adjusting your filters to see more results</p>

            <button className="reset-btn" onClick={clearFilters}>
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="product-grid">
            {filtered.map((item) => {
              const hasDiscount = Number(item.discount) > 0;
              const finalPrice = getFinalPrice(
                item.price,
                item.discount
              );

              return (
                <div
                  key={item.id}
                  className="product-card"
                  onClick={() =>
                    navigate(
                      `/knitwear/${item.id}?${searchParams.toString()}`
                    )
                  }
                >
                  <div className="image-wrapper">
                    {hasDiscount && (
                      <span className="discount-badge">
                        {item.discount}% OFF
                      </span>
                    )}

                    <img src={item.image} alt={item.name} />

                    <button
                      className="wishlist-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(item);
                      }}
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                      </svg>
                    </button>

                    <div className="image-overlay">
                      <button className="quick-btn">Quick View</button>
                    </div>
                  </div>

                  <div className="product-info">
                    <h3 className="product-name">{item.name}</h3>

                    <div className="price-row">
                      {hasDiscount ? (
                        <>
                          <span className="current-price">
                            ₹{finalPrice}
                          </span>
                          <span className="original-price">
                            ₹{item.price}
                          </span>
                          <span className="discount-text">
                            {item.discount}% off
                          </span>
                        </>
                      ) : (
                        <span className="normal-price">
                          ₹{item.price}
                        </span>
                      )}
                    </div>

                    {item.size && (
                      <div className="size-tags">
                        {item.size.map((s) => (
                          <span key={s} className="size-tag">
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default KnitWear;