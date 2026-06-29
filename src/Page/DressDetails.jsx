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

function DressDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { addToCart, isInCart } = useCart();
  const { wishlist, toggleWishlist } = useWishlist();

  const [dress, setDress] = useState(null);
  const [allDresses, setAllDresses] = useState([]);
  const [selectedSize, setSelectedSize] = useState("");

  useEffect(() => {
    API.get(`/products/${id}/`)
      .then((res) => setDress(res.data))
      .catch((err) => console.error(err));

    API.get("/products/?category=Dresses")
      .then((res) => setAllDresses(res.data))
      .catch((err) => console.error(err));

    setSelectedSize("");
  }, [id]);

  if (!dress) return <p>Loading...</p>;

  const related = allDresses
    .filter(
      (item) =>
        item.subcategoryName === dress.subcategoryName &&
        item.id !== dress.id
    )
    .slice(0, 6);

  const isWishlisted = wishlist.some(
    (item) => Number(item.productId) === Number(dress.id)
  );

  const hasDiscount = Number(dress.discount) > 0;
  const finalPrice = getFinalPrice(dress.price, dress.discount);

  const totalStock =
    dress.sizes?.reduce(
      (sum, item) => sum + Number(item.stock),
      0
    ) || 0;

  const selectedSizeObj = dress.sizes?.find(
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

      <p className="price-row">
        {hasDiscount && (
          <span className="original-price">
            ₹{dress.price}
          </span>
        )}

        <span
          className={
            hasDiscount ? "current-price" : "normal-price"
          }
        >
          ₹{finalPrice}
        </span>
      </p>

      <p>
        <b>COLOR:</b> {dress.color}
      </p>

      <div className="sizes">
        <p>
          <b>SIZE</b>
        </p>

        {dress.sizes?.map((s) => (
          <div key={s.id} className="size-box">
            <button
              className={`
                ${selectedSize === s.size ? "active" : ""}
                ${s.stock === 0 ? "out-size" : ""}
              `}
              onClick={() => {
                if (s.stock > 0) {
                  setSelectedSize(s.size);
                }
              }}
              disabled={s.stock === 0}
            >
              {s.size}
            </button>

            {s.stock > 0 && s.stock < 5 && (
              <small className="low-stock">
                Only {s.stock} left
              </small>
            )}
          </div>
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

        {totalStock === 0 ? (
          <button className="add-cart-btn" disabled>
            Out of Stock
          </button>
        ) : isInCart(dress.id, selectedSize) ? (
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

      <h3 className="related-title">
        Products that you might like
      </h3>

      <div className="related-products">
        {related.map((item) => {
          const hasDiscount = Number(item.discount) > 0;
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

                <span
                  className={
                    hasDiscount
                      ? "current-price"
                      : "normal-price"
                  }
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

export default DressDetails;