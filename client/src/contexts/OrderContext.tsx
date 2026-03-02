import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Order } from '@/contexts/AuthContext';
import { ordersAPI } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

interface OrderContextType {
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'createdAt'>) => string;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  getUserOrders: (userId: string) => Order[];
  getOrderById: (orderId: string) => Order | undefined;
  getAllOrders: () => Order[];
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, user } = useAuth();

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('orders');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    try {
      localStorage.setItem('orders', JSON.stringify(orders));
    } catch (e) {
      // ignore localStorage errors
    }
  }, [orders]);

  // Fetch orders from backend when user logs in
  const fetchOrders = useCallback(async () => {
    if (!user || !token) return;
    try {
      const res: any = await ordersAPI.getAll(token);
      // Normalize response: could be array or { data: [...], pagination }
      const fetched = Array.isArray(res) ? res : res?.data ?? [];
      setOrders(fetched);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.debug('[OrderContext] fetchOrders error', err);
    }
  }, [token, user]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const addOrder = (order: Omit<Order, 'id' | 'createdAt'>): string => {
    // Prefer creating order on backend if token available
    if (token) {
      (async () => {
        try {
          const created: any = await ordersAPI.create(order, token);
          const createdOrder = created?.data ?? created ?? null;
          if (createdOrder) {
            setOrders(prev => [...prev, createdOrder]);
          }
        } catch (err) {
          // fallback to local order
          // eslint-disable-next-line no-console
          console.debug('[OrderContext] create order failed, saving locally', err);
          const newOrder: Order = {
            ...order,
            id: `ORD${Date.now()}`,
            createdAt: new Date().toISOString(),
          };
          setOrders(prev => [...prev, newOrder]);
        }
      })();
      return 'pending';
    }

    const newOrder: Order = {
      ...order,
      id: `ORD${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setOrders(prev => [...prev, newOrder]);
    return newOrder.id;
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    // If cancelling and token available, call backend
    if (token && status === 'cancelled') {
      (async () => {
        try {
          const res: any = await ordersAPI.cancel(orderId, token);
          const updated = res?.data ?? res ?? null;
          if (updated) {
            setOrders(prev => prev.map(o => (o.id === updated.id ? updated : o)));
            return;
          }
        } catch (err) {
          // ignore and fall through to local update
          // eslint-disable-next-line no-console
          console.debug('[OrderContext] cancel order failed', err);
        }
      })();
    }

    setOrders(prev => prev.map(order => (order.id === orderId ? { ...order, status } : order)));
  };

  const getUserOrders = (userId: string): Order[] => {
    return orders.filter(order => order.userId === userId);
  };

  const getOrderById = (orderId: string): Order | undefined => {
    const found = orders.find(order => order.id === orderId);
    if (found) return found;
    // Try fetching from backend if token available
    if (token) {
      (async () => {
        try {
          const res: any = await ordersAPI.getById(orderId, token);
          const fetched = res?.data ?? res ?? null;
          if (fetched) {
            setOrders(prev => (prev.some(o => o.id === fetched.id) ? prev : [...prev, fetched]));
          }
        } catch (err) {
          // ignore
        }
      })();
    }
    return undefined;
  };

  const getAllOrders = (): Order[] => {
    return orders;
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        addOrder,
        updateOrderStatus,
        getUserOrders,
        getOrderById,
        getAllOrders,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within OrderProvider');
  }
  return context;
};
