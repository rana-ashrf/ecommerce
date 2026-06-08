import {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";
import { useAuth } from "./AuthContext";
import API from "../api/axios";

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    if (!user) {
      setWishlist([]);
      return;
    }

    const fetchWishlist = async () => {
      try {
        const res = await API.get("/wishlist/");
        setWishlist(res.data);
      } catch (err) {
        console.error("Failed to load wishlist", err);
      }
    };

    fetchWishlist();
  }, [user]);

  const toggleWishlist = async (product) => {
    if (!user) {
      alert("Please login first");
      return;
    }

    const exists = wishlist.find(
      (item) => Number(item.productId) === Number(product.id)
    );

    if (exists) {
      try {
        await API.delete(`/wishlist/${exists.id}/`);
        setWishlist(wishlist.filter((item) => item.id !== exists.id));
      } catch (err) {
        console.error("Failed to remove wishlist item", err);
      }
    } else {
      try {
        const res = await API.post("/wishlist/", {
          productId: product.id,
        });

        setWishlist([...wishlist, res.data]);
      } catch (err) {
        console.error("Failed to add wishlist item", err);
      }
    }
  };

  const removeFromWishlist = async (productId) => {
    const exists = wishlist.find(
      (item) => Number(item.productId) === Number(productId)
    );

    if (!exists) return;

    try {
      await API.delete(`/wishlist/${exists.id}/`);
      setWishlist(wishlist.filter((i) => i.id !== exists.id));
    } catch (err) {
      console.error("Failed to remove wishlist item", err);
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        toggleWishlist,
        removeFromWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);