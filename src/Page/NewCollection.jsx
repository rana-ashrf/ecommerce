import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function NewCollection() {
  const [items, setItems] = useState([]);
  const [columns, setColumns] = useState(5);
  const navigate = useNavigate();

  useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth;

      if (width < 480) setColumns(1);
      else if (width < 768) setColumns(2);
      else if (width < 1024) setColumns(3);
      else setColumns(5);
    };

    updateColumns();
    window.addEventListener("resize", updateColumns);

    return () => window.removeEventListener("resize", updateColumns);
  }, []);

  useEffect(() => {
    const fetchLatestProducts = async () => {
      try {
        const res = await axios.get(
          "http://127.0.0.1:8000/api/products/?latest=true"
        );

        setItems(res.data);
      } catch (err) {
        console.log("Failed to load latest products", err);
      }
    };

    fetchLatestProducts();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2
        style={{
          textAlign: "center",
          marginBottom: "20px",
        }}
      >
        NEW COLLECTION
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: "16px",
        }}
      >
        {items.map((item) => (
          <div
            key={item.id}
            style={{
              textAlign: "center",
              cursor: "pointer",
            }}
            onClick={() =>
              navigate(`/product/${item.categoryName}/${item.id}`)
            }
          >
            <img
              src={item.image}
              alt={item.name}
              style={{
                width: "100%",
                height: columns <= 2 ? "220px" : "320px",
                objectFit: "cover",
              }}
            />

            <p
              style={{
                fontSize: "13px",
                marginTop: "8px",
              }}
            >
              {item.name}
            </p>

            <p
              style={{
                fontWeight: "bold",
                fontSize: "14px",
              }}
            >
              ₹{item.price}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default NewCollection;