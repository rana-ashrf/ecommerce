import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { getFinalPrice } from "../utils/price";
import "../styles/Dresses.css";

function SalePage() {
  const [saleProducts, setSaleProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const urls = [
      "http://localhost:5000/dresses",
      "http://localhost:5000/Tops",
      "http://localhost:5000/bottoms",
      "http://localhost:5000/knitwear",
      "http://localhost:5000/outerwear",
    ];

    Promise.all(
      urls.map((url) =>
        axios.get(url).then((res) =>
          res.data.map((item) => ({
            ...item,
            collection: url.split("/").pop(),
          }))
        )
      )
    )
      .then((responses) => {
        const allProducts = responses.flat();
        const discounted = allProducts.filter(
          (item) => item.discount && item.discount > 0
        );
        setSaleProducts(discounted);
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <div style={{ padding: "40px" }}>
      <h2 style={{ textAlign: "center", marginBottom: "30px" }}>
        Sale Products
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "24px",
        }}
      >
        {saleProducts.map((item) => {
          const finalPrice = getFinalPrice(item.price, item.discount);

          return (
            <div
              key={`${item.collection}-${item.id}`}
              onClick={() =>
                navigate(`/sale/${item.collection}/${item.id}`)
              }
              style={{ cursor: "pointer" }}
            >
              <div className="image-wrapper">
                <span className="discount-badge">
                  {item.discount}% OFF
                </span>
                <img
                  src={item.image}
                  alt={item.name}
                  style={{
                    width: "100%",
                    height: "320px",
                    objectFit: "cover",
                    borderRadius: "8px",
                  }}
                />
              </div>

              <p className="name">{item.name}</p>

              <p className="price-row">
                <span className="original-price">₹{item.price}</span>

                <span className="current-price">
                  ₹{finalPrice}
                </span>

                <span className="discount-text">
                  {item.discount}% OFF
                </span>
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default SalePage;
