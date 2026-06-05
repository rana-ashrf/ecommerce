import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/Dresses.css";
import { useNavigate } from "react-router-dom";
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
  const [tops, setTops] = useState([]);
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("");
  const [color, setColor] = useState("");
  const [size, setSize] = useState("");
  const [price, setPrice] = useState([0, 5000]);

  useEffect(() => {
    axios.get("http://localhost:5000/knitwear")
      .then(res => setTops(res.data))
      .catch(err => console.error(err));
  }, []);

  let filtered = tops.filter(item =>
    item.active !== false &&
    (category === "All" || item.category === category) &&
    (!color || item.color === color) &&
    (!size || item.size.includes(size)) &&
    item.price >= price[0] &&
    item.price <= price[1]
  );

  if (sort === "low-high") {
    filtered.sort((a, b) => getFinalPrice(a.price, a.discount) - getFinalPrice(b.price, b.discount));
  }
  if (sort === "high-low") {
    filtered.sort((a, b) => getFinalPrice(b.price, b.discount) - getFinalPrice(a.price, a.discount));
  }

  const activeFilterCount = [color, size].filter(Boolean).length + (price[0] > 0 || price[1] < 5000 ? 1 : 0);

  const clearFilters = () => {
    setCategory("All");
    setSort("");
    setColor("");
    setSize("");
    setPrice([0, 5000]);
  };

  return (
    <div className="dresses-page">
      <Navbar textColor="black" />
      <div className="dresses-wrapper">
        <div className="page-header">
          <h1>Knitwear</h1>
          <span className="item-count">{filtered.length} {filtered.length === 1 ? 'item' : 'items'}</span>
        </div>

        <div className="filter-bar">
          <div className="category-pills">
            {categories.map(cat => (
              <button
                key={cat}
                className={`category-pill ${category === cat ? 'active' : ''}`}
                onClick={() => setCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <select className="filter-select" value={sort} onChange={e => setSort(e.target.value)}>
            <option value="">Sort by</option>
            <option value="low-high">Price: Low to High</option>
            <option value="high-low">Price: High to Low</option>
          </select>

          <select className="filter-select" value={color} onChange={e => setColor(e.target.value)}>
            <option value="">Color</option>
            {colors.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <select className="filter-select" value={size} onChange={e => setSize(e.target.value)}>
            <option value="">Size</option>
            {sizes.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <div className="price-inputs">
            <input className="price-input" type="number" placeholder="Min" value={price[0] || ""} onChange={e => setPrice([+e.target.value || 0, price[1]])} />
            <span className="price-separator">—</span>
            <input className="price-input" type="number" placeholder="Max" value={price[1] === 5000 ? "" : price[1]} onChange={e => setPrice([price[0], +e.target.value || 5000])} />
          </div>
        </div>

        {activeFilterCount > 0 && (
          <div className="active-filters">
            {color && (
              <span className="filter-tag">
                Color: {color}
                <button onClick={() => setColor("")}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>
              </span>
            )}
            {size && (
              <span className="filter-tag">
                Size: {size}
                <button onClick={() => setSize("")}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>
              </span>
            )}
            {(price[0] > 0 || price[1] < 5000) && (
              <span className="filter-tag">
                ₹{price[0]} — ₹{price[1]}
                <button onClick={() => setPrice([0, 5000])}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>
              </span>
            )}
            <button className="clear-all" onClick={clearFilters}>Clear All</button>
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="products-empty">
            <div className="empty-icon-large">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            </div>
            <h3>No items found</h3>
            <p>Try adjusting your filters to see more results</p>
            <button className="reset-btn" onClick={clearFilters}>Reset Filters</button>
          </div>
        ) : (
          <div className="product-grid">
            {filtered.map(item => {
              const hasDiscount = item.discount && item.discount > 0;
              const finalPrice = getFinalPrice(item.price, item.discount);
              return (
                <div key={item.id} className="product-card" onClick={() => navigate(`/knitwear/${item.id}`)}>
                  <div className="image-wrapper">
                    {hasDiscount && <span className="discount-badge">{item.discount}% OFF</span>}
                    <img src={item.image} alt={item.name} />
                    <button className="wishlist-btn" onClick={(e) => e.stopPropagation()}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg>
                    </button>
                    <div className="image-overlay"><button className="quick-btn">Quick View</button></div>
                  </div>
                  <div className="product-info">
                    <h3 className="product-name">{item.name}</h3>
                    <div className="price-row">
                      {hasDiscount ? (
                        <><span className="current-price">₹{finalPrice}</span><span className="original-price">₹{item.price}</span><span className="discount-text">{item.discount}% off</span></>
                      ) : <span className="normal-price">₹{item.price}</span>}
                    </div>
                    {item.size && <div className="size-tags">{item.size.map(s => <span key={s} className="size-tag">{s}</span>)}</div>}
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