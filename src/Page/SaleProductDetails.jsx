import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import "../styles/DressDetails.css";
import "../styles/Dresses.css";
import { useWishlist } from "../Context/WishlistContext";
import Navbar from "./Navbar";
import { useCart } from "../Context/CartContext";
import { toast } from "react-toastify";
import { getFinalPrice } from "../utils/price";

function SaleProductDetails() {
  const { collection, id } = useParams();
  const navigate = useNavigate();

  const { addToCart, isInCart } = useCart();
  const { wishlist, toggleWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [selectedSize, setSelectedSize] = useState("");

  useEffect(() => {
    axios
      .get(`http://localhost:5000/${collection}/${id}`)
      .then((res) => setProduct(res.data))
      .catch((err) => console.error(err));

    axios
      .get(`http://localhost:5000/${collection}`)
      .then((res) =>
        setAllProducts(
          res.data.filter(
            (item) => item.discount && item.id !== id
          )
        )
      )
      .catch((err) => console.error(err));

    setSelectedSize("");
  }, [collection, id]);

  if (!product) return <p>Loading...</p>;

  const isWishlisted = wishlist.some(
    (item) => item.productId === product.id
  );

  const finalPrice = getFinalPrice(
    product.price,
    product.discount
  );

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error("Please select a size");
      return;
    }
    addToCart(product, selectedSize);
  };

  return (
    <div className="pt-14">
      <Navbar textColor="black" />

      <div
        style={{
          maxWidth: "420px",
          margin: "40px auto",
          padding: "0 20px",
          textAlign: "center",
        }}
      >
        {/* IMAGE */}
        <img
          src={product.image}
          alt={product.name}
          style={{
            width: "100%",
            borderRadius: "16px",
            marginBottom: "20px",
          }}
        />

        {/* NAME */}
        <h2 style={{ fontSize: "20px", fontWeight: "500" }}>
          {product.name}
        </h2>

        {/* PRICE */}
        <p className="price-row" style={{ justifyContent: "center" }}>
          <span className="original-price">
            ₹{product.price}
          </span>

          <span className="current-price">
            ₹{finalPrice}
          </span>

          
        </p>

        {/* COLOR */}
        <p style={{ marginBottom: "20px", fontSize: "14px" }}>
          <b>COLOR:</b> {product.color || "Grey"}
        </p>

        {/* SIZE */}
        <p style={{ fontWeight: "600", marginBottom: "10px" }}>
          SIZE
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "12px",
            marginBottom: "25px",
          }}
        >
          {(product.size || ["S", "M", "L", "XL"]).map((s) => (
            <button
              key={s}
              onClick={() => setSelectedSize(s)}
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "50%",
                border:
                  selectedSize === s
                    ? "1.5px solid black"
                    : "1px solid #ccc",
                background: "white",
                cursor: "pointer",
                fontWeight: "500",
              }}
            >
              {s}
            </button>
          ))}
        </div>

        {/* ACTIONS */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "12px",
            marginBottom: "40px",
          }}
        >
          <button
            onClick={() => toggleWishlist(product)}
            style={{
              width: "46px",
              height: "46px",
              borderRadius: "50%",
              border: "1px solid #ccc",
              background: "white",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {isWishlisted ? (
              <FaHeart style={{ fontSize: "18px" }} />
            ) : (
              <FaRegHeart style={{ fontSize: "18px" }} />
            )}
          </button>

          {isInCart(product.id, selectedSize) ? (
            <button
              onClick={() => navigate("/cart")}
              style={{
                flex: 1,
                height: "46px",
                borderRadius: "30px",
                background: "black",
                color: "white",
                border: "none",
                cursor: "pointer",
              }}
            >
              Go to Cart
            </button>
          ) : (
            <button
              onClick={handleAddToCart}
              disabled={!selectedSize}
              style={{
                flex: 1,
                height: "46px",
                borderRadius: "30px",
                background: selectedSize ? "#888" : "#ccc",
                color: "white",
                border: "none",
                cursor: selectedSize
                  ? "pointer"
                  : "not-allowed",
              }}
            >
              Add to Cart
            </button>
          )}
        </div>

        {/* RELATED */}
        {allProducts.length > 0 && (
          <>
            <h3 style={{ marginBottom: "20px" }}>
              Products you may like
            </h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "16px",
              }}
            >
              {allProducts.slice(0, 4).map((item) => (
                <div
                  key={item.id}
                  onClick={() =>
                    navigate(`/sale/${collection}/${item.id}`)
                  }
                  style={{ cursor: "pointer" }}
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    style={{
                      width: "100%",
                      borderRadius: "12px",
                    }}
                  />
                  <p style={{ fontSize: "13px" }}>
                    {item.name}
                  </p>
                  <p className="new-price">
                    ₹
                    {getFinalPrice(
                      item.price,
                      item.discount
                    )}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default SaleProductDetails;
