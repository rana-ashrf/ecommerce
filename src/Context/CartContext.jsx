import {
  createContext,
  useContext,
  useState,
  useEffect
} from "react";

import API from "../api/axios";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState([]);

  // LOAD CART FROM DJANGO BACKEND
  useEffect(() => {
    if (!user) {
      setCart([]);
      return;
    }

    const fetchCart = async () => {
      try {
        const res = await API.get("/cart/");
        setCart(res.data);
      } catch (err) {
        console.error("Failed to load cart", err);
      }
    };

    fetchCart();
  }, [user]);

  // ADD TO CART
  const addToCart = async (product, size) => {
    if (!user) return;

    const exists = cart.find(
      (item) =>
        item.productId === product.id && item.size === size
    );

    if (exists) return;

    const payload = {
      productId: product.id,
      size: size
    };

    try {
      const res = await API.post("/cart/", payload);
      setCart((prev) => [...prev, res.data]);
    } catch (err) {
      console.error("Failed to add to cart", err.response?.data || err);
    }
  };

  const isInCart = (productId, size) =>
    cart.some(
      (item) =>
        item.productId === productId && item.size === size
    );

  // REMOVE FROM CART
  const removeFromCart = async (productId, size) => {
    const item = cart.find(
      (i) => i.productId === productId && i.size === size
    );

    if (!item) return;

    try {
      await API.delete(`/cart/${item.id}/`);
      setCart((prev) => prev.filter((i) => i.id !== item.id));
    } catch (err) {
      console.error("Failed to remove cart item", err.response?.data || err);
    }
  };

  // UPDATE QUANTITY
  const updateQty = async (productId, size, qty) => {
    if (qty < 1) return;

    const item = cart.find(
      (i) => i.productId === productId && i.size === size
    );

    if (!item) return;

    try {
      const res = await API.patch(`/cart/${item.id}/`, { qty });

      setCart((prev) =>
        prev.map((i) => (i.id === item.id ? res.data : i))
      );
    } catch (err) {
      console.error("Failed to update quantity", err.response?.data || err);
    }
  };

  // CLEAR CART
  const clearCart = async () => {
    try {
      await Promise.all(
        cart.map((i) => API.delete(`/cart/${i.id}/`))
      );

      setCart([]);
    } catch (err) {
      console.error("Failed to clear cart", err.response?.data || err);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        isInCart,
        removeFromCart,
        updateQty,
        clearCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);