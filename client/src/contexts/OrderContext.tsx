import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Order } from '@/contexts/AuthContext';
import { ordersAPI } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

interface OrderContextType {
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'createdAt'>) => Promise<string>;
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

  const normalizeOrder = (raw: any): Order => {
    const orderId = raw?.id || raw?._id || `ORD${Date.now()}`;
    const customerInfo = raw?.customerInfo || {};
    const items = (raw?.items || []).map((item: any) => {
      const product = item?.product || {};
      return {
        productId: product?._id || item?.productId || item?.product || '',
        productName: product?.name || item?.productName || '',
        price: item?.price ?? product?.price ?? 0,
        quantity: item?.quantity ?? 0,
        image: product?.images?.[0] || item?.image || '',
      };
    });

    return {
      id: orderId,
      userId: raw?.user?._id || raw?.user || 'guest',
      items,
      total: raw?.totalPrice ?? raw?.total ?? 0,
      status: raw?.status || 'pending',
      shippingAddress: {
        id: 'server',
        fullName: customerInfo.fullName || raw?.customerName || '',
        phone: customerInfo.phone || raw?.customerPhone || '',
        address: customerInfo.address || raw?.shippingAddress?.address || raw?.shippingAddress || '',
        city: customerInfo.city || raw?.shippingAddress?.city || '',
        district: customerInfo.district || raw?.shippingAddress?.district || '',
        ward: customerInfo.ward || raw?.shippingAddress?.ward || '',
        isDefault: false,
      },
      createdAt: raw?.createdAt || new Date().toISOString(),
      guestInfo: customerInfo.fullName
        ? { name: customerInfo.fullName, email: customerInfo.email, phone: customerInfo.phone }
        : raw?.guestInfo,
    };
  };

  // Fetch orders from backend when user logs in
  const fetchOrders = useCallback(async () => {
    if (!user || !token) return;
    try {
      const res: any = await ordersAPI.getAll(token);
      // Normalize response: could be array or { data: [...], pagination }
      const fetched = Array.isArray(res) ? res : res?.data ?? [];
      setOrders(fetched.map((order: any) => normalizeOrder(order)));
    } catch (err) {
      // eslint-disable-next-line no-console
      console.debug('[OrderContext] fetchOrders error', err);
    }
  }, [token, user]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const addOrder = async (order: Omit<Order, 'id' | 'createdAt'>): Promise<string> => {
    try {
      const payload = {
        customerInfo: {
          fullName: order.shippingAddress.fullName,
          email: order.guestInfo?.email || user?.email || '',
          phone: order.shippingAddress.phone,
          address: order.shippingAddress.address,
        },
        items: order.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        notes: '',
      };

      const created: any = await ordersAPI.create(payload, token || undefined);
      const createdOrder = created?.data ?? created ?? null;
      if (createdOrder) {
        const normalized = normalizeOrder(createdOrder);
        setOrders(prev => [...prev, normalized]);
        return normalized.id;
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.debug('[OrderContext] create order failed, saving locally', err);
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
            const normalized = normalizeOrder(updated);
            setOrders(prev => prev.map(o => (o.id === normalized.id ? normalized : o)));
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
            const normalized = normalizeOrder(fetched);
            setOrders(prev => (prev.some(o => o.id === normalized.id) ? prev : [...prev, normalized]));
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
