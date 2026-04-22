import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { toast } from 'sonner';

let googleScriptLoadingPromise: Promise<void> | null = null;
let initializedGoogleClientId: string | null = null;
let googleIdentityInitialized = false;

const loadGoogleIdentityScript = () => {
  if (window.google?.accounts?.id) {
    return Promise.resolve();
  }

  if (googleScriptLoadingPromise) {
    return googleScriptLoadingPromise;
  }

  googleScriptLoadingPromise = new Promise<void>((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>('script[src="https://accounts.google.com/gsi/client"]');

    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(), { once: true });
      existingScript.addEventListener('error', () => reject(new Error('Không thể tải Google Identity script')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Không thể tải Google Identity script'));
    document.body.appendChild(script);
  });

  return googleScriptLoadingPromise;
};

declare global {
  interface Window {
    google?: any;
  }
}

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [googleReady, setGoogleReady] = useState(false);
  const location = useLocation();
  const loginWithGoogleRef = React.useRef(loginWithGoogle);
  const navigateRef = React.useRef(navigate);

  React.useEffect(() => {
    loginWithGoogleRef.current = loginWithGoogle;
    navigateRef.current = navigate;
  }, [loginWithGoogle, navigate]);

  React.useEffect(() => {
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    if (!googleClientId) {
      setGoogleReady(false);
      return;
    }

    const initGoogle = async () => {
      try {
        await loadGoogleIdentityScript();

        if (!window.google?.accounts?.id) {
          setGoogleReady(false);
          return;
        }

        if (!googleIdentityInitialized || initializedGoogleClientId !== googleClientId) {
          window.google.accounts.id.initialize({
            client_id: googleClientId,
            callback: async (response: any) => {
              const credential = String(response?.credential || '');
              if (!credential) {
                toast.error('Google credential không hợp lệ');
                return;
              }

              const loggedUser = await loginWithGoogleRef.current(credential);

              if (loggedUser) {
                toast.success('Đăng nhập Google thành công!');
                if (loggedUser.isAdmin) {
                  navigateRef.current('/admin');
                  return;
                }
                navigateRef.current('/');
              } else {
                toast.error('Không thể đăng nhập bằng Google');
              }
            },
          });
          initializedGoogleClientId = googleClientId;
          googleIdentityInitialized = true;
        }

        setGoogleReady(true);
      } catch {
        setGoogleReady(false);
      }
    };

    void initGoogle();
  }, []);

  const handleGoogleLogin = () => {
    if (!window.google?.accounts?.id) {
      toast.error('Google Sign-In chưa sẵn sàng');
      return;
    }

    window.google.accounts.id.prompt((notification: any) => {
      if (notification?.isNotDisplayed?.() || notification?.isSkippedMoment?.()) {
        toast.error('Google Sign-In chưa khả dụng. Kiểm tra cấu hình Google Client ID và Authorized JavaScript origins.');
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const loggedUser = await login(email, password);
    if (loggedUser) {
      toast.success('Đăng nhập thành công!');
      // If the logged in user is admin, redirect to admin dashboard
      if (loggedUser.isAdmin) {
        navigate('/admin');
        return;
      }

      // If the route was /admin/login but a non-admin logs in, redirect to home
      if (location.pathname.startsWith('/admin')) {
        navigate('/');
        return;
      }

      navigate('/');
    } else {
      toast.error('Email hoặc mật khẩu không đúng');
    }
  };

  return (
    <div className="min-h-screen bg-white pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          <h1 className="text-4xl font-light mb-2 text-center tracking-wide">Đăng nhập</h1>
          <p className="text-gray-600 text-center mb-8">
            Chào mừng quay trở lại
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-2"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <Label htmlFor="password">Mật khẩu</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-2"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#C9A24D] text-white py-3 text-sm tracking-wider uppercase hover:bg-[#b8923f] transition-colors duration-300"
            >
              Đăng nhập
            </button>

            {googleReady && (
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full border border-gray-300 text-gray-700 py-3 text-sm tracking-wide hover:bg-gray-50 transition-colors duration-300"
              >
                Đăng nhập với Google
              </button>
            )}

            <div className="text-center mt-4">
              <Link to="/forgot-password" className="text-sm text-[#C9A24D] hover:underline">
                Quên mật khẩu?
              </Link>
            </div>
          </form>

          <p className="text-center mt-6 text-gray-600">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="text-[#C9A24D] hover:underline">
              Đăng ký ngay
            </Link>
          </p>

          {/* Demo credentials removed */}
        </div>
      </div>
    </div>
  );
};