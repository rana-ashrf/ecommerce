import { useEffect, useState } from "react";
import API from "../api/axios";
import { useWishlist } from "../Context/WishlistContext";
import { useNavigate } from "react-router-dom";
import { getFinalPrice } from "../utils/price";
import Navbar from "./Navbar";
import "../styles/Dresses.css";

function SalePage() {
  const [saleProducts, setSaleProducts] = useState([]);
  const { toggleWishlist } = useWishlist();
  const navigate = useNavigate();

  useEffect(() => {
    API.get("/sale-products/")
      .then((res) => {
        setSaleProducts(res.data);
      })
      .catch((err) => {
        console.error("Failed to load sale products", err);
      });
  }, []);

  return (
    <div className="dresses-page">
      <Navbar textColor="black" />
      <div className="dresses-wrapper">
        {/* <div className="page-header">
          <h1>Sale Products</h1>
          <span className="item-count">
            {saleProducts.length} {saleProducts.length === 1 ? "item" : "items"}
          </span>
        </div> */}

        {saleProducts.length === 0 ? (
          <div className="products-empty">
            <div className="empty-icon-large">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <h3>No sale items available</h3>
            <p>Check back later for exciting deals</p>
          </div>
        ) : (
          <div className="product-grid">
            {saleProducts.map((item) => {
              const finalPrice = getFinalPrice(item.price, item.discount);
              return (
                <div
                  key={item.id}
                  className="product-card"
                  onClick={() =>
                    navigate(`/sale/${item.categoryName}/${item.id}`)
                  }
                >
                  <div className="image-wrapper">
                    <span className="discount-badge">
                      {item.discount}% OFF
                    </span>

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
                      <span className="current-price">₹{finalPrice}</span>
                      <span className="original-price">₹{item.price}</span>
                      <span className="discount-text">
                        {item.discount}% off
                      </span>
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

export default SalePage;