import { useState, useEffect } from "react";
import API from "../api/axios";
import "../styles/MyReviews.css";

function MyReviews() {
  const [reviews, setReviews] = useState([]);
  const [deliveredItems, setDeliveredItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviewsAndOrders();
  }, []);

  const fetchReviewsAndOrders = async () => {
    try {
      setLoading(true);

      const ordersRes = await API.get("/orders/");
      const reviewsRes = await API.get("/reviews/");

      setReviews(reviewsRes.data);

      const items = ordersRes.data
        .filter((order) => order.status === "Delivered")
        .flatMap((order) =>
          order.items
            .filter((item) => item.returnStatus !== "Returned")
            .map((item) => {
              const existingReview = reviewsRes.data.find(
                (r) =>
                  r.productId === item.productId &&
                  r.orderId === order.id
              );

              return {
                ...item,
                orderId: order.id,
                reviewed: !!existingReview,
                reviewData: existingReview || null,
                tempText: existingReview?.text || "",
                tempRating: existingReview?.rating || 5,
              };
            })
        );

      setDeliveredItems(items);
    } catch (err) {
      console.error("Error fetching reviews/orders:", err.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  const submitReview = async (item) => {
    try {
      if (!item.tempText.trim()) {
        alert("Please write your review");
        return;
      }

      await API.post("/reviews/", {
        orderId: item.orderId,
        productId: item.productId,
        rating: item.tempRating,
        text: item.tempText,
      });

      fetchReviewsAndOrders();
    } catch (err) {
      console.error("Review submit error:", err.response?.data || err);
      alert(err.response?.data?.error || "Could not submit review");
    }
  };

  const deleteReview = async (item) => {
    try {
      await API.delete(`/reviews/${item.reviewData.id}/`);
      fetchReviewsAndOrders();
    } catch (err) {
      console.error("Delete review error:", err.response?.data || err);
      alert("Could not delete review");
    }
  };

  if (loading) {
    return <h2 className="empty">Loading reviews...</h2>;
  }

  if (deliveredItems.length === 0) {
    return <h2 className="empty">No delivered products yet ⭐</h2>;
  }

  return (
    <div className="reviews-container">
      <h2>My Reviews</h2>

      {deliveredItems.map((item) => (
        <div className="review-card" key={`${item.orderId}-${item.id}`}>
          <img src={item.image} alt={item.title} />

          <div className="review-info">
            <h4>{item.title}</h4>

            {item.reviewed ? (
              <>
                <div className="stars">
                  {"⭐".repeat(item.reviewData.rating)}
                </div>

                <p>{item.reviewData.text}</p>

                <div className="actions">
                  <button onClick={() => deleteReview(item)}>
                    Delete
                  </button>
                </div>
              </>
            ) : (
              <>
                <label>Rating</label>

                <select
                  value={item.tempRating}
                  onChange={(e) => {
                    const value = Number(e.target.value);

                    setDeliveredItems((prev) =>
                      prev.map((d) =>
                        d.id === item.id && d.orderId === item.orderId
                          ? { ...d, tempRating: value }
                          : d
                      )
                    );
                  }}
                >
                  <option value={5}>⭐⭐⭐⭐⭐</option>
                  <option value={4}>⭐⭐⭐⭐</option>
                  <option value={3}>⭐⭐⭐</option>
                  <option value={2}>⭐⭐</option>
                  <option value={1}>⭐</option>
                </select>

                <label>Review</label>

                <textarea
                  placeholder="Write your review..."
                  value={item.tempText}
                  onChange={(e) => {
                    const value = e.target.value;

                    setDeliveredItems((prev) =>
                      prev.map((d) =>
                        d.id === item.id && d.orderId === item.orderId
                          ? { ...d, tempText: value }
                          : d
                      )
                    );
                  }}
                />

                <button onClick={() => submitReview(item)}>
                  Submit Review
                </button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default MyReviews;