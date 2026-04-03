import React, { createContext, useContext, useState, useEffect } from 'react';
import { resolveImageSrc } from '@/utils/image';
import { calculateDiscountedPrice } from '@/utils/constants';

export interface Product {
  _id?: string;
  id?: string;
  name: string;
  price: number;
  originalPrice?: number | null;
  salePercent?: number;
  image?: string;
  images?: string[];
  category?: string;
  description?: string;
  brand?: string;
  material?: string;
  new?: boolean;
  featured?: boolean;
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  originalPrice?: number;
  salePercent?: number;
  discountAmount?: number;
  finalPrice?: number;
  image: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'id'>) => void;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const normalizeCartItemImage = (image?: string) =>
  resolveImageSrc(image, 'products') || 'https://source.unsplash.com/600x800/?jewelry';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('cart');
    if (!saved) return [];

    try {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed)
        ? parsed.map((item) => ({
            ...item,
            image: normalizeCartItemImage(item?.image),
          }))
        : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addItem = (item: Omit<CartItem, 'id'>) => {
    const normalizedItem = {
      ...item,
      image: normalizeCartItemImage(item.image),
    };

    setItems(prevItems => {
      const existingItem = prevItems.find(i => i.productId === normalizedItem.productId);
      if (existingItem) {
        return prevItems.map(i =>
          i.productId === normalizedItem.productId
            ? {
                ...i,
                quantity: i.quantity + normalizedItem.quantity,
                image: normalizedItem.image,
                price: normalizedItem.price,
                originalPrice: normalizedItem.originalPrice,
                salePercent: normalizedItem.salePercent,
                discountAmount: normalizedItem.discountAmount,
                finalPrice: normalizedItem.finalPrice,
              }
            : i
        );
      }
      return [...prevItems, { ...normalizedItem, id: Date.now().toString() }];
    });
  };

  const addToCart = (product: Product, quantity: number = 1) => {
    const productId = product._id || product.id || '';
    const primaryImage = Array.isArray(product.images) && product.images.length > 0
      ? product.images[0]
      : product.image || '';
    const basePrice = Number(product.originalPrice || product.price || 0);
    const salePercent = Number(product.salePercent || 0);
    const finalPrice = calculateDiscountedPrice(basePrice, salePercent);

    if (!productId) {
      return;
    }

    addItem({
      productId,
      name: product.name,
      price: finalPrice,
      originalPrice: basePrice,
      salePercent,
      discountAmount: Math.max(0, basePrice - finalPrice),
      finalPrice,
      image: primaryImage,
      quantity,
    });
  };

  const removeFromCart = (itemId: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        total,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};