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

function DressDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { addToCart, isInCart } = useCart();
  const { wishlist, toggleWishlist } = useWishlist();

  const [dress, setDress] = useState(null);
  const [allDresses, setAllDresses] = useState([]);
  const [selectedSize, setSelectedSize] = useState("");

  useEffect(() => {
    axios
      .get(`http://localhost:5000/dresses/${id}`)
      .then((res) => setDress(res.data));

    axios
      .get("http://localhost:5000/dresses")
      .then((res) => setAllDresses(res.data));

    setSelectedSize("");
  }, [id]);

  if (!dress) return <p>Loading...</p>;

  const related = allDresses
    .filter(
      (item) =>
        item.category === dress.category &&
        item.id !== dress.id
    )
    .slice(0, 6);

  const isWishlisted = wishlist.some(
    (item) => item.productId === dress.id
  );

  const hasDiscount = dress.discount && dress.discount > 0;
  const finalPrice = getFinalPrice(
    dress.price,
    dress.discount
  );

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error("Please select a size");
      return;
    }
    addToCart(dress, selectedSize);
  };

  return (
    <div className="dress-details pt-24">
      <Navbar textColor="black" />

      <img
        src={dress.image}
        alt={dress.name}
        className="mt-19"
      />

      <h2>{dress.name}</h2>

      {/* PRICE */}
      <p className="price-row">
        {hasDiscount && (
          <span className="original-price">
            ₹{dress.price}
          </span>
        )}

        <span className={hasDiscount ? "current-price" : "normal-price"}>
          ₹{finalPrice}
        </span>


      </p>
      <p>
        <b>COLOR:</b> {dress.color}
      </p>

      {/* SIZE */}
      <div className="sizes">
        <p>
          <b>SIZE</b>
        </p>
        {dress.size.map((s) => (
          <button
            key={s}
            className={
              selectedSize === s ? "active" : ""
            }
            onClick={() => setSelectedSize(s)}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="action-bar">
        <button
          onClick={() => toggleWishlist(dress)}
          className="wishlist-btn"
        >
          {isWishlisted ? (
            <FaHeart className="heart-icon filled" />
          ) : (
            <FaRegHeart className="heart-icon" />
          )}
        </button>

        {isInCart(dress.id, selectedSize) ? (
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

      {/* RELATED PRODUCTS */}
      <h3 className="related-title">
        Products that you might like
      </h3>

      <div className="related-products">
        {related.map((item) => {
          const hasDiscount =
            item.discount && item.discount > 0;
          const finalPrice = getFinalPrice(
            item.price,
            item.discount
          );

          return (
            <div
              key={item.id}
              className="related-card"
              onClick={() =>
                navigate(`/dresses/${item.id}`)
              }
            >
              <img
                src={item.image}
                alt={item.name}
              />
              <p className="name">{item.name}</p>
              <p className="price-row">
                {hasDiscount && (
                  <span className="original-price">
                    ₹{item.price}
                  </span>
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

export default DressDetails;