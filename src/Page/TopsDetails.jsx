import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../api/axios";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import "../styles/DressDetails.css";
import { useWishlist } from "../Context/WishlistContext";
import Navbar from "./Navbar";
import { useCart } from "../Context/CartContext";
import { toast } from "react-toastify";
import { getFinalPrice } from "../utils/price";

function TopsDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { addToCart, isInCart } = useCart();
  const { wishlist, toggleWishlist } = useWishlist();

  const [top, setTop] = useState(null);
  const [allTops, setAllTops] = useState([]);
  const [selectedSize, setSelectedSize] = useState("");

  useEffect(() => {
    API.get(`/products/${id}/`)
      .then((res) => setTop(res.data))
      .catch((err) => console.error(err));

    API.get("/products/?category=Tops")
      .then((res) => setAllTops(res.data))
      .catch((err) => console.error(err));

    setSelectedSize("");
  }, [id]);

  if (!top) return <p>Loading...</p>;

  const related = allTops
    .filter(
      (item) =>
        item.subcategoryName === top.subcategoryName && item.id !== top.id
    )
    .slice(0, 6);

  const isWishlisted = wishlist.some(
    (item) => Number(item.productId) === Number(top.id)
  );

  const hasDiscount = Number(top.discount) > 0;
  const finalPrice = getFinalPrice(top.price, top.discount);

  const totalStock =
    top.sizes?.reduce((sum, s) => sum + Number(s.stock), 0) || 0;

  const selectedSizeObj = top.sizes?.find(
    (s) => s.size === selectedSize
  );

  const handleAddToCart = () => {
    if (totalStock === 0) {
      toast.error("Product is out of stock");
      return;
    }

    if (!selectedSize) {
      toast.error("Please select a size");
      return;
    }

    if (!selectedSizeObj || selectedSizeObj.stock === 0) {
      toast.error("Selected size is out of stock");
      return;
    }

    addToCart(top, selectedSize);
  };

  return (
    <div className="dress-details pt-24">
      <Navbar textColor="black" />

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

      <p>
        <b>COLOR:</b> {top.color}
      </p>

      <div className="sizes">
        <p>
          <b>SIZE</b>
        </p>

        {top.sizes?.map((s) => (
          <div key={s.id} className="size-box">
            <button
              className={`${selectedSize === s.size ? "active" : ""} ${
                Number(s.stock) === 0 ? "out-size" : ""
              }`}
              onClick={() => {
                if (Number(s.stock) > 0) {
                  setSelectedSize(s.size);
                }
              }}
              disabled={Number(s.stock) === 0}
            >
              {s.size}
            </button>

            {Number(s.stock) > 0 && Number(s.stock) < 5 && (
              <small className="low-stock">
                Only {s.stock} left
              </small>
            )}
          </div>
        ))}
      </div>

      <div className="action-bar">
        <button
          type="button"
          onClick={() => toggleWishlist(top)}
          className="wishlist-btn"
        >
          {isWishlisted ? (
            <FaHeart className="heart-icon filled" />
          ) : (
            <FaRegHeart className="heart-icon" />
          )}
        </button>

        {totalStock === 0 ? (
          <button className="add-cart-btn" disabled>
            Out of Stock
          </button>
        ) : isInCart(top.id, selectedSize) ? (
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

      <h3 className="related-title">Products that you might like</h3>

      <div className="related-products">
        {related.map((item) => {
          const hasDiscount = Number(item.discount) > 0;
          const finalPrice = getFinalPrice(item.price, item.discount);

          return (
            <div
              key={item.id}
              className="related-card"
              onClick={() => navigate(`/tops/${item.id}`)}
            >
              <img src={item.image} alt={item.name} />
              <p className="name">{item.name}</p>

              <p className="price-row">
                {hasDiscount && (
                  <span className="original-price">₹{item.price}</span>
                )}

                <span
                  className={hasDiscount ? "current-price" : "normal-price"}
                >
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

export default TopsDetails;