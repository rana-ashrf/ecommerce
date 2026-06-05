import { useWishlist } from "../Context/WishlistContext";
import "../styles/Wishlist.css";
import { Link } from "react-router-dom";
import { getFinalPrice } from "../utils/price";
import Navbar from "./Navbar";
import { Trash2, ShoppingBag, Heart } from "lucide-react";

function Wishlist() {
  const { wishlist, removeFromWishlist } = useWishlist();

  if (wishlist.length === 0) {
    return (
      <div className="wishlist-page">
        <Navbar textColor="black" />
        <div className="wishlist-empty-state">
          <Heart className="empty-icon" strokeWidth={1} />
          <h2 className="empty-title">Your wishlist is empty</h2>
          <p className="empty-subtitle">Save items you love to your wishlist and revisit them anytime.</p>
          <Link to="/shop" className="continue-shopping-btn">
            <ShoppingBag size={18} />
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="wishlist-page">
      <Navbar textColor="black" />
      
      <div className="wishlist-wrapper">
        <header className="wishlist-header">
          <h1 className="wishlist-title">My Wishlist</h1>
          <span className="wishlist-count">{wishlist.length} {wishlist.length === 1 ? 'item' : 'items'}</span>
        </header>

        <div className="wishlist-grid">
          {wishlist.map((item) => {
            const hasDiscount = Number(item.discount) > 0;
            const finalPrice = getFinalPrice(item.price, item.discount);
            const discountPercent = hasDiscount ? Math.round(item.discount) : 0;

            return (
              <div className="wishlist-card" key={item.id}>
                <div className="wishlist-image-section">
                  <Link to={`${item.url}/${item.productId}`} className="wishlist-image-link">
                    <div className="wishlist-image-wrapper">
                      <img src={item.image} alt={item.name} loading="lazy" />
                    </div>
                  </Link>
                  
                  <button 
                    className="wishlist-remove-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromWishlist(item.productId);
                    }}
                    aria-label="Remove from wishlist"
                  >
                    <Trash2 size={16} />
                  </button>

                  {hasDiscount && (
                    <span className="wishlist-discount-badge">-{discountPercent}%</span>
                  )}
                </div>

                <div className="wishlist-info">
                  <Link to={`${item.url}/${item.productId}`} className="wishlist-product-link">
                    <h4 className="wishlist-product-name">{item.name}</h4>
                  </Link>

                  <div className="wishlist-price-row">
                    {hasDiscount && (
                      <span className="wishlist-old-price">₹{item.price}</span>
                    )}
                    <span className={hasDiscount ? "wishlist-new-price" : "wishlist-normal-price"}>
                      ₹{finalPrice}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Wishlist;