import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import "../styles/DressDetails.css";
import { useWishlist } from "../Context/WishlistContext";
import Navbar from "./Navbar";
import { useCart } from "../Context/CartContext";
import { toast } from "react-toastify";
import { getFinalPrice } from "../utils/price";

function OuterDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { addToCart, isInCart } = useCart();
  const { wishlist, toggleWishlist } = useWishlist();

  const [top, setTop] = useState(null);
  const [allTops, setAllTops] = useState([]);
  const [selectedSize, setSelectedSize] = useState("");

  useEffect(() => {
    axios.get(`http://localhost:5000/outerwear/${id}`)
      .then(res => setTop(res.data))
      .catch(err => console.error(err));

    axios.get("http://localhost:5000/outerwear")
      .then(res => setAllTops(res.data))
      .catch(err => console.error(err));

    setSelectedSize("");
  }, [id]);

  if (!top) return <p>Loading...</p>;

  const related = allTops
    .filter(item => item.category === top.category && item.id !== top.id)
    .slice(0, 6);

  const isWishlisted = wishlist.some(
    (item) => item.productId === top.id
  );

  const hasDiscount = top.discount && top.discount > 0;
  const finalPrice = getFinalPrice(top.price, top.discount);

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error("Please select a size");
      return;
    }
    addToCart(top, selectedSize);
  };

  return (
    <div className="dress-details pt-24">
      <Navbar textColor="black" />

      {/* PRODUCT IMAGE */}
      <img src={top.image} alt={top.name} className="mt-19" />

      <h2>{top.name}</h2>
      <p className="price-row">
        {hasDiscount && (
          <span className="original-price">₹{top.price}</span>
        )}

        <span className={hasDiscount ? "current-price" : "normal-price"}>
          ₹{finalPrice}
        </span>

        
      </p>

      <p><b>COLOR:</b> {top.color}</p>

      {/* SIZE */}
      <div className="sizes">
        <p><b>SIZE</b></p>
        {top.size.map(s => (
          <button
            key={s}
            className={selectedSize === s ? "active" : ""}
            onClick={() => setSelectedSize(s)}
          >
            {s}
          </button>
        ))}
      </div>

      {/* ACTIONS */}
      <div className="action-bar">
        <button
          onClick={() => toggleWishlist(top)}
          className="wishlist-btn"
        >
          {isWishlisted ? (
            <FaHeart className="heart-icon filled" />
          ) : (
            <FaRegHeart className="heart-icon" />
          )}
        </button>

        {/*  CART  */}
        {isInCart(top.id, selectedSize) ? (
          <button
            className="go-cart-btn"
            onClick={() => navigate("/cart")}
          >
            Go to Cart
          </button>
        ) : (
          <button
            className="add-cart-btn"
            onClick={handleAddToCart}
            disabled={!selectedSize}
          >
            Add to Cart
          </button>
        )}
      </div>

      {/* YOU MAY ALSO LIKE */}
      <h3 className="related-title">Products that you might like</h3>

      <div className="related-products">
        {related.map(item => {
          const hasDiscount = item.discount && item.discount > 0;
          const finalPrice = getFinalPrice(item.price, item.discount);

          return (
            <div
              key={item.id}
              className="related-card"
              onClick={() => navigate(`/outerwear/${item.id}`)}
            >
              <img src={item.image} alt={item.name} />
              <p className="name">{item.name}</p>
              <p className="price-row">
                {hasDiscount && (
                  <span className="original-price">₹{item.price}</span>
                )}

                <span className={hasDiscount ? "current-price" : "normal-price"}>
                  ₹{finalPrice}
                </span>
              </p>
            </div>
          );
        })}

      </div>
    </div>
  );
}

export default OuterDetails