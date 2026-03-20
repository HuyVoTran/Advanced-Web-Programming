import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_CONFIG, API_ENDPOINTS } from '@/config/api';

export interface User {
  id: string;
  name: string;
  fullName?: string;
  email: string;
  phone: string;
  addresses: Address[];
  /** convenience flag derived from `role === 'admin'` */
  isAdmin: boolean;
  /** original role string returned by the server ("user" | "admin") */
  role?: string;
}

export interface Address {
  id: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  ward: string;
  isDefault: boolean;
}

export interface Order {
  id: string;
  userId: string;
  items: Array<{
    productId: string;
    productName: string;
    price: number;
    quantity: number;
    image: string;
  }>;
  total: number;
  status: 'pending' | 'confirmed' | 'shipping' | 'completed' | 'cancelled';
  paymentMethod?: 'cod' | 'card' | 'bank_transfer';
  shippingAddress: Address;
  createdAt: string;
  guestInfo?: {
    name: string;
    email: string;
    phone: string;
  };
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<User | null>;
  register: (name: string, email: string, password: string, phone: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  addAddress: (address: Omit<Address, 'id'>) => void;
  updateAddress: (addressId: string, updates: Partial<Address>) => void;
  deleteAddress: (addressId: string) => void;
  setToken: (token: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// No local mock users: use real backend for auth

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // helper to make sure the object stored in state always has an `isAdmin` flag
  const normalizeUser = (u: any): User => {
    if (!u) return u;
    const role = u.role ?? u?.user?.role ?? undefined;
    // some responses come with fullName, some with name
    const name = u.name || u.fullName || u.user?.fullName || u.user?.name || '';
    return {
      id: u.id || u._id || u.user?._id || '',
      name,
      fullName: u.fullName || u.user?.fullName,
      email: u.email || u.user?.email || '',
      phone: u.phone || u.user?.phone || '',
      addresses: u.addresses || u.user?.addresses || [],
      role,
      // server may already include isAdmin; fallback to checking role
      isAdmin: typeof u.isAdmin === 'boolean' ? u.isAdmin : role === 'admin',
    };
  };

  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return normalizeUser(parsed);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [token, setTokenState] = useState<string | null>(() => {
    return localStorage.getItem('token');
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  const login = async (email: string, password: string): Promise<User | null> => {
    try {
      const res = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.LOGIN}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const payload = await res.json();
      // Normalize possible shapes: { data: { user, token } } or { user, token } or { accessToken }
      const root = payload?.data ?? payload ?? {};
      const tokenFromServer = root?.token ?? root?.accessToken ?? payload?.token ?? payload?.accessToken ?? null;
      const userFromServer = root?.user ?? root?.userInfo ?? payload?.user ?? payload?.userInfo ?? null;

      if (!res.ok) {
        // eslint-disable-next-line no-console
        console.debug('[Auth] login failed', { status: res.status, payload });
        return null;
      }

      let normalizedUser: User | null = null;
      if (userFromServer) {
        normalizedUser = normalizeUser(userFromServer);
        setUser(normalizedUser);
      }
      if (tokenFromServer) setTokenState(tokenFromServer);
      return normalizedUser;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.debug('[Auth] login network/error', err);
      return null;
    }
  };

  const register = async (
    name: string,
    email: string,
    _password: string,
    phone: string
  ): Promise<boolean> => {
    try {
      const res = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.REGISTER}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName: name, email, password: _password, confirmPassword: _password, phone }),
      });

      const payload = await res.json();
      const root = payload?.data ?? payload ?? {};
      const tokenFromServer = root?.token ?? root?.accessToken ?? payload?.token ?? payload?.accessToken ?? null;
      const userFromServer = root?.user ?? root?.userInfo ?? payload?.user ?? payload?.userInfo ?? null;

      if (!res.ok) {
        // eslint-disable-next-line no-console
        console.debug('[Auth] register failed', { status: res.status, payload });
        return false;
      }

      if (userFromServer) {
        setUser(normalizeUser(userFromServer));
      }
      if (tokenFromServer) setTokenState(tokenFromServer);
      return true;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.debug('[Auth] register network/error', err);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setTokenState(null);
  };

  const setToken = (newToken: string | null) => {
    setTokenState(newToken);
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      // if role is part of the updates, recompute isAdmin
      const merged = { ...user, ...updates };
      if (updates.role) {
        merged.isAdmin = updates.role === 'admin';
      }
      setUser(merged as User);
    }
  };

  const addAddress = (address: Omit<Address, 'id'>) => {
    if (user) {
      const newAddress: Address = {
        ...address,
        id: Date.now().toString(),
      };
      
      // If this is the first address or marked as default, set it as default
      const addresses = user.addresses.map(addr => ({
        ...addr,
        isDefault: newAddress.isDefault ? false : addr.isDefault,
      }));
      
      setUser({
        ...user,
        addresses: [...addresses, newAddress],
      });
    }
  };

  const updateAddress = (addressId: string, updates: Partial<Address>) => {
    if (user) {
      const addresses = user.addresses.map(addr => {
        if (addr.id === addressId) {
          return { ...addr, ...updates };
        }
        // If setting a new default, unset others
        if (updates.isDefault && addr.isDefault) {
          return { ...addr, isDefault: false };
        }
        return addr;
      });
      setUser({ ...user, addresses });
    }
  };

  const deleteAddress = (addressId: string) => {
    if (user) {
      setUser({
        ...user,
        addresses: user.addresses.filter(addr => addr.id !== addressId),
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        register,
        logout,
        updateUser,
        addAddress,
        updateAddress,
        deleteAddress,
        setToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
