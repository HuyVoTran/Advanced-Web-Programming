import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useOrders } from '@/contexts/OrderContext';
import { formatPrice } from '@/utils/constants';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Button } from '@/app/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/app/components/ui/radio-group';
import { Stepper } from '@/app/components/shared/Stepper';
import { LoadingSpinner } from '@/app/components/shared/LoadingSpinner';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CreditCard, 
  Truck, 
  MapPin, 
  User, 
  Mail, 
  Phone, 
  FileText,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const STEPS = [
  { id: 'info', label: 'Thông tin', description: 'Thông tin giao hàng' },
  { id: 'payment', label: 'Thanh toán', description: 'Phương thức thanh toán' },
  { id: 'review', label: 'Xác nhận', description: 'Xem lại đơn hàng' },
];

export const CheckoutNew: React.FC = () => {
  const navigate = useNavigate();
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const { addOrder } = useOrders();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasPlacedOrder, setHasPlacedOrder] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.addresses?.[0]?.address || '',
    city: user?.addresses?.[0]?.city || '',
    district: user?.addresses?.[0]?.district || '',
    notes: '',
    paymentMethod: 'cod' as 'cod' | 'bank_transfer' | 'credit_card',
  });

  useEffect(() => {
    if (items.length === 0 && !hasPlacedOrder) {
      navigate('/cart');
    }
  }, [items, navigate, hasPlacedOrder]);

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.fullName.trim()) newErrors.fullName = 'Vui lòng nhập họ tên';
      if (!formData.email.trim()) newErrors.email = 'Vui lòng nhập email';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Email không hợp lệ';
      }
      if (!formData.phone.trim()) newErrors.phone = 'Vui lòng nhập số điện thoại';
      if (!/^[0-9]{10,11}$/.test(formData.phone.replace(/\s/g, ''))) {
        newErrors.phone = 'Số điện thoại không hợp lệ';
      }
      if (!formData.address.trim()) newErrors.address = 'Vui lòng nhập địa chỉ';
      if (!formData.city.trim()) newErrors.city = 'Vui lòng chọn tỉnh/thành phố';
      if (!formData.district.trim()) newErrors.district = 'Vui lòng chọn quận/huyện';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setIsProcessing(true);

    try {
      const orderId = await addOrder({
        userId: user?.id || 'guest',
        items: items.map(item => ({
          productId: item.productId,
          productName: item.name,
          image: item.image || item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        total,
        status: 'pending',
        paymentMethod: formData.paymentMethod,
        shippingAddress: {
          id: 'checkout',
          fullName: formData.fullName,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          district: formData.district,
          ward: '',
          isDefault: false,
        },
        guestInfo: !user
          ? {
              name: formData.fullName,
              email: formData.email,
              phone: formData.phone,
            }
          : undefined,
      });

      setHasPlacedOrder(true);
      clearCart();
      toast.success('Đặt hàng thành công!', {
        description: `Mã đơn hàng: ${orderId}`,
      });
      navigate(`/order-success/${orderId}`);
    } catch (err) {
      toast.error('Đặt hàng thất bại, vui lòng thử lại');
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header & Stepper */}
        <div className="mb-12">
          <h1 className="text-4xl font-light mb-8 tracking-wide text-center">Thanh toán</h1>
          <Stepper steps={STEPS} currentStep={currentStep} className="max-w-2xl mx-auto" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {/* Step 1: Shipping Information */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-lg shadow-sm p-8"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <Truck className="w-6 h-6 text-primary" />
                    <h2 className="text-2xl font-light">Thông tin giao hàng</h2>
                  </div>

                  <div className="space-y-6">
                    {/* Personal Info */}
                    <div>
                      <h3 className="text-sm uppercase tracking-wide text-muted-foreground mb-4">
                        Thông tin người nhận
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="fullName" className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            Họ và tên *
                          </Label>
                          <Input
                            id="fullName"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            className={`mt-2 ${errors.fullName ? 'border-destructive' : ''}`}
                            placeholder="Nguyễn Văn A"
                          />
                          {errors.fullName && (
                            <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              {errors.fullName}
                            </p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="phone" className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            Số điện thoại *
                          </Label>
                          <Input
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className={`mt-2 ${errors.phone ? 'border-destructive' : ''}`}
                            placeholder="0901234567"
                          />
                          {errors.phone && (
                            <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              {errors.phone}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="mt-4">
                        <Label htmlFor="email" className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          Email *
                        </Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          className={`mt-2 ${errors.email ? 'border-destructive' : ''}`}
                          placeholder="email@example.com"
                        />
                        {errors.email && (
                          <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {errors.email}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Address */}
                    <div>
                      <h3 className="text-sm uppercase tracking-wide text-muted-foreground mb-4">
                        Địa chỉ giao hàng
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="address" className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            Địa chỉ chi tiết *
                          </Label>
                          <Input
                            id="address"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            className={`mt-2 ${errors.address ? 'border-destructive' : ''}`}
                            placeholder="Số nhà, tên đường..."
                          />
                          {errors.address && (
                            <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              {errors.address}
                            </p>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="city">Tỉnh/Thành phố *</Label>
                            <Input
                              id="city"
                              name="city"
                              value={formData.city}
                              onChange={handleChange}
                              className={`mt-2 ${errors.city ? 'border-destructive' : ''}`}
                              placeholder="TP. Hồ Chí Minh"
                            />
                            {errors.city && (
                              <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {errors.city}
                              </p>
                            )}
                          </div>

                          <div>
                            <Label htmlFor="district">Quận/Huyện *</Label>
                            <Input
                              id="district"
                              name="district"
                              value={formData.district}
                              onChange={handleChange}
                              className={`mt-2 ${errors.district ? 'border-destructive' : ''}`}
                              placeholder="Quận 1"
                            />
                            {errors.district && (
                              <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {errors.district}
                              </p>
                            )}
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="notes" className="flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            Ghi chú (Tùy chọn)
                          </Label>
                          <Textarea
                            id="notes"
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            className="mt-2"
                            rows={3}
                            placeholder="Ghi chú về đơn hàng..."
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end mt-8">
                    <Button
                      onClick={handleNext}
                      size="lg"
                      className="bg-primary hover:bg-primary/90 text-white px-8"
                    >
                      Tiếp tục
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Payment Method */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-lg shadow-sm p-8"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <CreditCard className="w-6 h-6 text-primary" />
                    <h2 className="text-2xl font-light">Phương thức thanh toán</h2>
                  </div>

                  <RadioGroup
                    value={formData.paymentMethod}
                    onValueChange={(value) => 
                      setFormData(prev => ({ ...prev, paymentMethod: value as any }))
                    }
                    className="space-y-4"
                  >
                    <div className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      formData.paymentMethod === 'cod' 
                        ? 'border-primary bg-primary/5' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <Label htmlFor="cod" className="flex items-start gap-3 cursor-pointer">
                        <RadioGroupItem value="cod" id="cod" className="mt-1" />
                        <div className="flex-1">
                          <p className="font-medium mb-1">Thanh toán khi nhận hàng (COD)</p>
                          <p className="text-sm text-muted-foreground">
                            Thanh toán bằng tiền mặt khi nhận hàng
                          </p>
                        </div>
                      </Label>
                    </div>

                    <div className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      formData.paymentMethod === 'bank_transfer' 
                        ? 'border-primary bg-primary/5' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <Label htmlFor="bank" className="flex items-start gap-3 cursor-pointer">
                        <RadioGroupItem value="bank_transfer" id="bank" className="mt-1" />
                        <div className="flex-1">
                          <p className="font-medium mb-1">Chuyển khoản ngân hàng</p>
                          <p className="text-sm text-muted-foreground">
                            Chuyển khoản trực tiếp đến tài khoản ngân hàng
                          </p>
                        </div>
                      </Label>
                    </div>

                    <div className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      formData.paymentMethod === 'credit_card' 
                        ? 'border-primary bg-primary/5' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <Label htmlFor="card" className="flex items-start gap-3 cursor-pointer">
                        <RadioGroupItem value="credit_card" id="card" className="mt-1" />
                        <div className="flex-1">
                          <p className="font-medium mb-1">Thẻ tín dụng/ghi nợ</p>
                          <p className="text-sm text-muted-foreground">
                            Thanh toán bằng thẻ Visa, Mastercard, JCB
                          </p>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>

                  <div className="flex justify-between mt-8">
                    <Button
                      onClick={handleBack}
                      variant="outline"
                      size="lg"
                    >
                      Quay lại
                    </Button>
                    <Button
                      onClick={handleNext}
                      size="lg"
                      className="bg-primary hover:bg-primary/90 text-white px-8"
                    >
                      Tiếp tục
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Review Order */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Shipping Info Review */}
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-light">Thông tin giao hàng</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentStep(1)}
                        className="text-primary hover:text-primary/80"
                      >
                        Chỉnh sửa
                      </Button>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-muted-foreground">Người nhận:</span> {formData.fullName}</p>
                      <p><span className="text-muted-foreground">Điện thoại:</span> {formData.phone}</p>
                      <p><span className="text-muted-foreground">Email:</span> {formData.email}</p>
                      <p>
                        <span className="text-muted-foreground">Địa chỉ:</span> {formData.address}, {formData.district}, {formData.city}
                      </p>
                      {formData.notes && (
                        <p><span className="text-muted-foreground">Ghi chú:</span> {formData.notes}</p>
                      )}
                    </div>
                  </div>

                  {/* Payment Method Review */}
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-light">Phương thức thanh toán</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentStep(2)}
                        className="text-primary hover:text-primary/80"
                      >
                        Chỉnh sửa
                      </Button>
                    </div>
                    <p className="text-sm">
                      {formData.paymentMethod === 'cod' && 'Thanh toán khi nhận hàng (COD)'}
                      {formData.paymentMethod === 'bank_transfer' && 'Chuyển khoản ngân hàng'}
                      {formData.paymentMethod === 'credit_card' && 'Thẻ tín dụng/ghi nợ'}
                    </p>
                  </div>

                  {/* Order Items Review */}
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-light mb-4">Sản phẩm đã chọn ({items.length})</h3>
                    <div className="space-y-4">
                      {items.map(item => (
                        <div key={item.id} className="flex gap-4 pb-4 border-b last:border-b-0">
                          <div className="w-20 h-24 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                            <ImageWithFallback
                              src={`https://source.unsplash.com/400x500/?${encodeURIComponent(item.image || item.name)}`}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 flex justify-between">
                            <div>
                              <p className="font-light">{item.name}</p>
                              <p className="text-sm text-muted-foreground mt-1">
                                Số lượng: {item.quantity}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-primary">{formatPrice(item.price)}</p>
                              <p className="text-sm text-muted-foreground mt-1">
                                {formatPrice(item.price * item.quantity)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      onClick={handleBack}
                      variant="outline"
                      size="lg"
                      disabled={isProcessing}
                    >
                      Quay lại
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      size="lg"
                      className="bg-primary hover:bg-primary/90 text-white px-8"
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <>
                          <LoadingSpinner size="sm" color="white" />
                          <span className="ml-2">Đang xử lý...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Hoàn tất đặt hàng
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-28">
              <h3 className="text-xl font-light mb-6">Tóm tắt đơn hàng</h3>
              
              <div className="space-y-3 mb-6 pb-6 border-b">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tạm tính</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Phí vận chuyển</span>
                  <span className="text-primary">Miễn phí</span>
                </div>
              </div>

              <div className="flex justify-between items-center mb-6">
                <span className="text-lg">Tổng cộng</span>
                <span className="text-2xl text-primary font-light">{formatPrice(total)}</span>
              </div>

              {/* Mini Cart Items */}
              <div className="border-t pt-4">
                <p className="text-sm text-muted-foreground mb-3">
                  Sản phẩm ({items.length})
                </p>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {items.map(item => (
                    <div key={item.id} className="flex gap-3">
                      <div className="w-12 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                        <ImageWithFallback
                          src={`https://source.unsplash.com/200x300/?${encodeURIComponent(item.image || item.name)}`}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">SL: {item.quantity}</p>
                      </div>
                      <p className="text-sm text-primary whitespace-nowrap">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
