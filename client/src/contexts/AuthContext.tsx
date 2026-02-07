import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  name: string;
  fullName?: string;
  email: string;
  phone: string;
  addresses: Address[];
  isAdmin: boolean;
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
  status: 'pending' | 'processing' | 'shipping' | 'completed' | 'cancelled';
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
  login: (email: string, password: string) => Promise<User | null>;
  register: (name: string, email: string, password: string, phone: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  addAddress: (address: Omit<Address, 'id'>) => void;
  updateAddress: (addressId: string, updates: Partial<Address>) => void;
  deleteAddress: (addressId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users data (keep only admin for admin login; remove demo regular user)
const mockUsers: User[] = [
  {
    id: 'admin',
    name: 'Admin',
    email: 'admin@example.com',
    phone: '0987654321',
    addresses: [],
    isAdmin: true,
  },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const login = async (email: string, password: string): Promise<User | null> => {
    // Mock authentication: find any user (admin or user) and validate password
    const foundUser = mockUsers.find(u => u.email === email);
    // debug logging to help trace login issues
    // eslint-disable-next-line no-console
    console.debug('[Auth] login attempt', { email, found: !!foundUser });
    if (!foundUser) return null;

    // Simple mock password rules: admins use 'admin123', regular users 'password'
    const expected = foundUser.isAdmin ? 'admin123' : 'password';
    // eslint-disable-next-line no-console
    console.debug('[Auth] expected password for user', { email, expected });
    if (password === expected) {
      setUser(foundUser);
      // eslint-disable-next-line no-console
      console.debug('[Auth] login success', { email });
      return foundUser;
    }

    // eslint-disable-next-line no-console
    console.debug('[Auth] login failed - wrong password', { email });
    return null;
  };

  const register = async (
    name: string,
    email: string,
    _password: string,
    phone: string
  ): Promise<boolean> => {
    // Mock registration
    if (mockUsers.find(u => u.email === email)) {
      return false; // Email already exists
    }
    
    const newUser: User = {
      id: Date.now().toString(),
      name,
      email,
      phone,
      addresses: [],
      isAdmin: false,
    };
    
    mockUsers.push(newUser);
    setUser(newUser);
    return true;
  };

  const logout = () => {
    setUser(null);
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updates });
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
        login,
        register,
        logout,
        updateUser,
        addAddress,
        updateAddress,
        deleteAddress,
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
