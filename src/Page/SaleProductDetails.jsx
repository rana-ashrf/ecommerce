import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import "../styles/DressDetails.css";
import "../styles/Dresses.css";
import { useWishlist } from "../Context/WishlistContext";
import Navbar from "./Navbar";
import { useCart } from "../Context/CartContext";
import { toast } from "react-toastify";
import { getFinalPrice } from "../utils/price";
import API from "../api/axios";

function SaleProductDetails() {
  const { collection, id } = useParams();
  const navigate = useNavigate();

  const { addToCart, isInCart } = useCart();
  const { wishlist, toggleWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [selectedSize, setSelectedSize] = useState("");

  useEffect(() => {
    API.get(`/products/${id}/`)
      .then((res) => setProduct(res.data))
      .catch((err) => {
        console.error(err);
        navigate("/sale");
      });

    API.get(`/products/?category=${collection}`)
      .then((res) => {
        const discounted = res.data.filter(
          (item) =>
            Number(item.discount) > 0 &&
            Number(item.id) !== Number(id)
        );

        setAllProducts(discounted);
      })
      .catch((err) => console.error(err));

    setSelectedSize("");
  }, [collection, id, navigate]);

  if (!product) return <p>Loading...</p>;

  const isWishlisted = wishlist.some(
    (item) => Number(item.productId) === Number(product.id)
  );

  const finalPrice = getFinalPrice(product.price, product.discount);

  const totalStock =
    product.sizes?.reduce((sum, s) => sum + Number(s.stock), 0) || 0;

  const selectedSizeObj = product.sizes?.find(
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

    if (!selectedSizeObj || Number(selectedSizeObj.stock) === 0) {
      toast.error("Selected size is out of stock");
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
        <img
          src={product.image}
          alt={product.name}
          style={{
            width: "100%",
            borderRadius: "16px",
            marginBottom: "20px",
          }}
        />

        <h2 style={{ fontSize: "20px", fontWeight: "500" }}>
          {product.name}
        </h2>

        <p className="price-row" style={{ justifyContent: "center" }}>
          <span className="original-price">₹{product.price}</span>
          <span className="current-price">₹{finalPrice}</span>
        </p>

        <p style={{ marginBottom: "20px", fontSize: "14px" }}>
          <b>COLOR:</b> {product.color}
        </p>

        <p style={{ fontWeight: "600", marginBottom: "10px" }}>
          SIZE
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "12px",
            marginBottom: "25px",
            flexWrap: "wrap",
          }}
        >
          {product.sizes?.map((s) => (
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
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "50%",
                  border:
                    selectedSize === s.size
                      ? "1.5px solid black"
                      : "1px solid #ccc",
                  background: "white",
                  cursor:
                    Number(s.stock) === 0 ? "not-allowed" : "pointer",
                  fontWeight: "500",
                }}
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

          {totalStock === 0 ? (
            <button
              disabled
              style={{
                flex: 1,
                height: "46px",
                borderRadius: "30px",
                background: "#ccc",
                color: "white",
                border: "none",
                cursor: "not-allowed",
              }}
            >
              Out of Stock
            </button>
          ) : isInCart(product.id, selectedSize) ? (
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
                cursor: selectedSize ? "pointer" : "not-allowed",
              }}
            >
              Add to Cart
            </button>
          )}
        </div>

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
                    navigate(`/sale/${item.categoryName}/${item.id}`)
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
                    ₹{getFinalPrice(item.price, item.discount)}
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