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

  const clearCart = () => {
    setCart([]);
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