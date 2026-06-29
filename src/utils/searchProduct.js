import API from "../api/axios";

export const searchProducts = async (query) => {
  if (!query.trim()) return [];

  try {
    const res = await API.get("/products/", {
      params: {
        search: query,
      },
    });

    return res.data;
  } catch (err) {
    console.error("Search error:", err.response?.data || err);
    return [];
  }
};