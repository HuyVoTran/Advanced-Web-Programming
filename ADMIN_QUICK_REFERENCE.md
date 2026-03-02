# Admin Implementation - Quick Reference Guide

## 🚀 Quick Start

### How to Use Admin API
All admin API calls are in `client/src/services/adminApi.ts`. The service automatically handles:
- Authorization headers (Bearer token)
- Base URL configuration
- Response parsing

### Example: Fetch Data in a Component
```typescript
import { useAdminFetch } from '@/hooks/useCustomHooks';
import { adminApi } from '@/services/adminApi';

const MyComponent = () => {
  // Fetch data
  const { data: products, loading, error, refetch } = useAdminFetch(
    () => adminApi.getAllProducts(1, 20),
    []
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600">Error: {error}</div>;

  return (
    <div>
      {products?.map(p => <div key={p._id}>{p.name}</div>)}
    </div>
  );
};
```

### Example: Create/Update/Delete (Mutations)
```typescript
import { useAdminMutation } from '@/hooks/useCustomHooks';
import { adminApi } from '@/services/adminApi';
import { toast } from 'sonner';

const MyForm = () => {
  const { mutate, loading } = useAdminMutation(
    (data) => adminApi.createProduct(data)
  );

  const handleSubmit = async (formData) => {
    try {
      await mutate(formData);
      toast.success('Success!');
    } catch (err) {
      toast.error('Failed!');
    }
  };

  return (
    <button onClick={() => handleSubmit(data)} disabled={loading}>
      {loading ? 'Saving...' : 'Save'}
    </button>
  );
};
```

---

## 📋 Available API Methods

### Dashboard
```typescript
adminApi.getDashboard()
// Returns: { totalRevenue, totalOrders, totalProducts, totalUsers, orderStats }
```

### Products
```typescript
adminApi.getAllProducts(page = 1, limit = 20)
adminApi.getProductById(id: string)
adminApi.createProduct(data)
adminApi.updateProduct(id: string, data)
adminApi.deleteProduct(id: string)
```

### Categories
```typescript
adminApi.getAllCategories()
adminApi.createCategory(data)
adminApi.updateCategory(id: string, data)
adminApi.deleteCategory(id: string)
```

### Brands
```typescript
adminApi.getAllBrands()
adminApi.createBrand(data)
adminApi.updateBrand(id: string, data)
adminApi.deleteBrand(id: string)
```

### Orders
```typescript
adminApi.getAllOrders(page = 1, limit = 20)
adminApi.getOrderById(id: string)
adminApi.updateOrderStatus(id: string, status: string)
```

### Users
```typescript
adminApi.getAllUsers(page = 1, limit = 20)
adminApi.getUserById(id: string)
adminApi.updateUserRole(id: string, role: string)
adminApi.updateUserStatus(id: string, isActive: boolean)
adminApi.deleteUser(id: string)
```

### News
```typescript
adminApi.getAllNews(page = 1, limit = 20)
adminApi.createNews(data)
adminApi.updateNews(id: string, data)
adminApi.publishNews(id: string)
adminApi.deleteNews(id: string)
```

---

## 🔐 Authentication

### How It Works
1. Login via `/login` page
2. Backend returns token and user object
3. Token stored in `localStorage` as `'token'`
4. Axios interceptor automatically adds to all requests: `Authorization: Bearer {token}`
5. Admin check: `user.isAdmin === true`

### Set Token Manually
```typescript
import { useAuth } from '@/contexts/AuthContext';

const { setToken } = useAuth();
setToken('your-jwt-token');
```

---

## 🎯 Status Values for Orders
```typescript
'pending'    // Chờ xác nhận
'confirmed'  // Đã xác nhận
'shipping'   // Đang giao hàng
'completed'  // Đã giao hàng
'cancelled'  // Đã hủy
```

## 👥 User Roles
```typescript
'admin'  // Admin user
'user'   // Regular user
```

---

## 🎨 Common UI Patterns

### Loading State
```tsx
if (loading) {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C9A24D]"></div>
    </div>
  );
}
```

### Error State
```tsx
if (error) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
      <AlertCircle className="w-5 h-5 text-red-600" />
      <div>
        <p className="text-red-800 font-medium">Lỗi</p>
        <p className="text-red-700 text-sm">{error}</p>
      </div>
    </div>
  );
}
```

### Form with Disabled During Submission
```tsx
<input
  type="text"
  disabled={loading}
  className="w-full px-4 py-3 border border-gray-300 rounded-lg disabled:opacity-50"
/>
<button disabled={loading}>
  {loading ? 'Đang lưu...' : 'Lưu'}
</button>
```

---

## 🔄 Refetch After Mutation

### Pattern: Auto-refresh after successful mutation
```typescript
const { data: categories, refetch } = useAdminFetch(
  () => adminApi.getAllCategories(),
  []
);

const { mutate: createCategory } = useAdminMutation(
  (data) => adminApi.createCategory(data)
);

const handleCreate = async (name) => {
  await createCategory({ name });
  await refetch(); // Refresh the list
  toast.success('Created!');
};
```

---

## 📱 Response Format

All API responses follow this structure:
```typescript
{
  success: boolean,
  message: string,
  data: T // Your actual data
}
```

The `adminApi` service automatically extracts `data` for you, so you get:
```typescript
const { data: products } = useAdminFetch(
  () => adminApi.getAllProducts(),
  []
);
// data is already the products array, not the whole response
```

---

## 🐛 Common Issues & Solutions

### Issue: Token not sent with requests
**Solution**: Token is automatically injected via axios interceptor. Make sure:
1. Token is stored in localStorage as `'token'`
2. Token format: `'Bearer {actual_token}'` OR just the token (interceptor handles it)
3. Check browser DevTools > Network > Authorization header

### Issue: Can't access admin pages
**Solution**: 
1. Make sure `user.isAdmin === true` after login
2. Check if user is logged in (AuthContext shows user)
3. Login must return admin user object
4. Clear localStorage and login again

### Issue: "Not authenticated" error
**Solution**:
1. Token expired - login again
2. Token removed from localStorage - check logout code
3. Backend doesn't recognize token format - verify token format

### Issue: API returns 404
**Solution**:
1. Check endpoint URL in `adminApi.ts` matches backend routes
2. Check MongoDB _id field names vs expected field names
3. Verify request body structure matches backend expectations

---

## 🔗 File Locations

| Purpose | File |
|---------|------|
| API Service | `client/src/services/adminApi.ts` |
| Custom Hooks | `client/src/hooks/useCustomHooks.ts` |
| Auth Context | `client/src/contexts/AuthContext.tsx` |
| Dashboard | `client/src/app/pages/admin/AdminDashboard.tsx` |
| Categories | `client/src/app/pages/admin/AdminCategories.tsx` |
| Products | `client/src/app/pages/admin/AdminProducts.tsx` |
| Product Form | `client/src/app/pages/admin/AdminProductForm.tsx` |
| Orders | `client/src/app/pages/admin/AdminOrders.tsx` |
| Order Detail | `client/src/app/pages/admin/AdminOrderDetail.tsx` |
| Users | `client/src/app/pages/admin/AdminUsers.tsx` |
| Layout | `client/src/app/pages/admin/AdminLayout.tsx` |
| Routing | `client/src/app/App.tsx` |

---

## 🧪 Testing Admin Features

### Test Checklist
- [ ] Login as admin succeeds
- [ ] Admin redirects to `/admin` after login
- [ ] Non-admin users cannot access `/admin`
- [ ] Categories page loads and displays data
- [ ] Can create new category
- [ ] Can edit category
- [ ] Can delete category
- [ ] Products page loads and displays
- [ ] Can create product (visit `/admin/products/new`)
- [ ] Can edit product (click edit button)
- [ ] Can delete product
- [ ] Orders page loads with status filtering
- [ ] Can view order detail
- [ ] Can update order status
- [ ] Users page shows all users
- [ ] Can update user role
- [ ] Logout clears token and user

---

## 📚 Dependencies

### Key Packages Used
- `axios` - HTTP requests
- `react-router-dom` - Routing
- `sonner` - Toast notifications
- `lucide-react` - Icons
- `date-fns` - Date formatting
- `recharts` - Charts/graphs

---

**Last Updated**: 2024  
**Version**: 1.0 - Production Ready
