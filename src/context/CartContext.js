import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { cartAPI } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

const LOCAL_CART_KEY = 'local_cart';

// ─── Helpers panier local (visiteurs non connectés) ───────────────────────────
const getLocalCart = () => {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_CART_KEY)) || [];
  } catch {
    return [];
  }
};

const saveLocalCart = (cart) => {
  localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(cart));
};

const clearLocalCart = () => {
  localStorage.removeItem(LOCAL_CART_KEY);
};

// ─── Provider ─────────────────────────────────────────────────────────────────
export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Charge le panier serveur ou local selon l'état d'authentification
  useEffect(() => {
    if (user) {
      mergeAndFetchCart();
    } else {
      setCart(getLocalCart());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Fusionne le panier local avec le panier serveur à la connexion
  const mergeAndFetchCart = async () => {
    try {
      setLoading(true);
      const localItems = getLocalCart();

      // Envoyer les articles locaux vers le serveur (s'il y en a)
      if (localItems.length > 0) {
        await Promise.allSettled(
          localItems.map((item) =>
            cartAPI.add({ product_id: item.product_id, quantity: item.quantity })
          )
        );
        clearLocalCart();
      }

      // Récupérer le panier serveur final
      const response = await cartAPI.get();
      setCart(response.data.cart);
    } catch (error) {
      console.error('Erreur lors de la récupération du panier:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCart = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const response = await cartAPI.get();
      setCart(response.data.cart);
    } catch (error) {
      console.error('Erreur lors de la récupération du panier:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // ─── Ajouter au panier ──────────────────────────────────────────────────────
  const addToCart = async (productId, quantity = 1, productData = null) => {
    if (!user) {
      // Panier local pour les visiteurs
      const localCart = getLocalCart();
      const existing = localCart.find((i) => i.product_id === productId);
      let updatedCart;
      if (existing) {
        updatedCart = localCart.map((i) =>
          i.product_id === productId ? { ...i, quantity: i.quantity + quantity } : i
        );
      } else {
        updatedCart = [
          ...localCart,
          {
            product_id: productId,
            quantity,
            name: productData?.name || 'Produit',
            price: productData?.price || 0,
            image_url: productData?.image_url || '',
          },
        ];
      }
      saveLocalCart(updatedCart);
      setCart(updatedCart);
      return { success: true };
    }

    try {
      await cartAPI.add({ product_id: productId, quantity });
      await fetchCart();
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Erreur lors de l'ajout au panier",
      };
    }
  };

  // ─── Mettre à jour la quantité ──────────────────────────────────────────────
  const updateCartItem = async (productId, quantity) => {
    if (!user) {
      if (quantity <= 0) return removeFromCart(productId);
      const updated = getLocalCart().map((i) =>
        i.product_id === productId ? { ...i, quantity } : i
      );
      saveLocalCart(updated);
      setCart(updated);
      return { success: true };
    }

    try {
      await cartAPI.update(productId, { quantity });
      await fetchCart();
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erreur lors de la mise à jour',
      };
    }
  };

  // ─── Supprimer un article ───────────────────────────────────────────────────
  const removeFromCart = async (productId) => {
    if (!user) {
      const updated = getLocalCart().filter((i) => i.product_id !== productId);
      saveLocalCart(updated);
      setCart(updated);
      return { success: true };
    }

    try {
      await cartAPI.remove(productId);
      await fetchCart();
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erreur lors de la suppression',
      };
    }
  };

  // ─── Vider le panier ───────────────────────────────────────────────────────
  const clearCart = async () => {
    if (!user) {
      clearLocalCart();
      setCart([]);
      return { success: true };
    }

    try {
      await cartAPI.clear();
      setCart([]);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erreur lors du vidage du panier',
      };
    }
  };

  const getCartTotal = () =>
    cart.reduce((total, item) => total + Number(item.price) * item.quantity, 0);

  const getCartCount = () =>
    cart.reduce((count, item) => count + item.quantity, 0);

  const value = {
    cart,
    loading,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    getCartTotal,
    getCartCount,
    fetchCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart doit être utilisé dans un CartProvider');
  return context;
};
