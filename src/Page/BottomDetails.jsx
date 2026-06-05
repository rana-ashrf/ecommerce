import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import "../styles/DressDetails.css";
import { useWishlist } from "../Context/WishlistContext";
import Navbar from "./Navbar";
import { useCart } from "../Context/CartContext";
import { toast } from "react-toastify";
import { getFinalPrice } from "../utils/price";

function BottomDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { addToCart, isInCart } = useCart();
  const { wishlist, toggleWishlist } = useWishlist();


  const [bottom, setBottom] = useState(null);
  const [allBottoms, setAllBottoms] = useState([]);
  const [selectedSize, setSelectedSize] = useState("");

  useEffect(() => {

    axios
      .get(`http://localhost:5000/bottoms/${id}`)
      .then((res) => {
        if (res.data.active === false) {
          navigate("/bottoms"); // redirect if product disabled
          return;
        }
        setBottom(res.data);
      })



    axios
      .get("http://localhost:5000/bottoms")
      .then((res) => setAllBottoms(res.data))
      .catch((err) => console.error(err));

    setSelectedSize("");
  }, [id]);

  if (!bottom) return <p>Loading...</p>;


  const related = allBottoms
    .filter((item) =>
      item.active !== false &&
      item.category === bottom.category &&
      item.id !== bottom.id
    )
    .slice(0, 6);


  const isWishlisted = wishlist.some(
    (item) => item.productId === bottom.id
  );

  const hasDiscount = bottom.discount && bottom.discount > 0;
  const finalPrice = getFinalPrice(bottom.price, bottom.discount);

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error("Please select a size");
      return;
    }
    addToCart(bottom, selectedSize);
  };

  return (
    <div className="dress-details pt-24">
      <Navbar textColor="black" />


      <img src={bottom.image} alt={bottom.name} className="mt-19" />

      <h2>{bottom.name}</h2>
      <p className="price-row">
        {hasDiscount && (
          <span className="original-price">
            ₹{bottom.price}
          </span>
        )}

        <span className={hasDiscount ? "current-price" : "normal-price"}>
          ₹{finalPrice}
        </span>

        
      </p>



      <p>
        <b>COLOR:</b> {bottom.color}
      </p>

      {/*  SIZE */}
      <div className="sizes">
        <p>
          <b>SIZE</b>
        </p>
        {bottom.size?.map((s) => (
          <button
            key={s}
            className={selectedSize === s ? "active" : ""}
            onClick={() => setSelectedSize(s)}
          >
            {s}
          </button>
        ))}
      </div>


      <div className="action-bar">
        <button
          onClick={() => toggleWishlist(bottom)}
          className="wishlist-btn"
        >
          {isWishlisted ? (
            <FaHeart className="heart-icon filled" />
          ) : (
            <FaRegHeart className="heart-icon" />
          )}
        </button>

        {isInCart(bottom.id, selectedSize) ? (
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

      {/*  RELATED BOTTOMS */}
      <h3 className="related-title">
        Products that you might like
      </h3>

      <div className="related-products">
        {related.map(item => {
          const hasDiscount = item.discount && item.discount > 0;
          const finalPrice = getFinalPrice(item.price, item.discount);
          return (
            <div
              key={item.id}
              className="related-card"
              onClick={() => navigate(`/bottoms/${item.id}`)} // 🔥 FIXED
            >
              <img src={item.image} alt={item.name} />
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

export default BottomDetails;
