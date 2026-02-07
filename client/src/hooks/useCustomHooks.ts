import { useState, useEffect } from 'react';

/**
 * Hook to detect if user is scrolling
 */
export const useScrollDirection = () => {
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | null>(null);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setScrollDirection('down');
      } else if (currentScrollY < lastScrollY) {
        setScrollDirection('up');
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return scrollDirection;
};

/**
 * Hook to detect if element is in viewport
 */
export const useInView = (ref: React.RefObject<HTMLElement>, options?: IntersectionObserverInit) => {
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsInView(entry.isIntersecting);
    }, options);

    observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, [ref, options]);

  return isInView;
};

/**
 * Hook for debounced value
 */
export const useDebounce = <T,>(value: T, delay: number = 500): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Hook for local storage with state sync
 */
export const useLocalStorage = <T,>(key: string, initialValue: T): [T, (value: T) => void] => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
};

/**
 * Hook to detect clicks outside of element
 */
export const useClickOutside = (
  ref: React.RefObject<HTMLElement>,
  handler: (event: MouseEvent | TouchEvent) => void
) => {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler(event);
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
};

/**
 * Hook for window size
 */
export const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
};

/**
 * Hook for media queries
 */
export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);

    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
};

/**
 * Hook for copy to clipboard
 */
export const useCopyToClipboard = (): [(text: string) => Promise<boolean>, boolean] => {
  const [copied, setCopied] = useState(false);

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      return true;
    } catch (error) {
      console.error('Failed to copy:', error);
      setCopied(false);
      return false;
    }
  };

  return [copy, copied];
};

/**
 * Hook for toggle state
 */
export const useToggle = (initialValue: boolean = false): [boolean, () => void] => {
  const [value, setValue] = useState(initialValue);
  const toggle = () => setValue((v) => !v);
  return [value, toggle];
};

/**
 * Hook for previous value
 */
export const usePrevious = <T,>(value: T): T | undefined => {
  const [current, setCurrent] = useState<T>(value);
  const [previous, setPrevious] = useState<T>();

  if (value !== current) {
    setPrevious(current);
    setCurrent(value);
  }

  return previous;
};

/**
 * Hook for async state
 */
export const useAsync = <T,>(
  asyncFunction: () => Promise<T>,
  immediate: boolean = true
) => {
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [value, setValue] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const execute = async () => {
    setStatus('pending');
    setValue(null);
    setError(null);

    try {
      const response = await asyncFunction();
      setValue(response);
      setStatus('success');
    } catch (error) {
      setError(error as Error);
      setStatus('error');
    }
  };

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, []);

  return { execute, status, value, error };
};

/**
 * Hook để fetch dữ liệu từ API với state loading và error
 */
export const useFetch = <T,>(
  fetchFunction: () => Promise<T>,
  dependencies: any[] = []
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchFunction();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refetch();
  }, dependencies);

  return { data, loading, error, refetch };
};

/**
 * Hook để fetch Products từ API
 */
export const useProducts = (params?: Record<string, any>) => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const { productsAPI } = await import('@/services/api');
        const result = await productsAPI.getAll(params);
        setProducts(Array.isArray(result) ? result : result.products || []);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Lỗi tải sản phẩm');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [JSON.stringify(params)]);

  return { products, loading, error };
};

/**
 * Hook để fetch Categories từ API
 */
export const useCategories = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const { categoriesAPI } = await import('@/services/api');
        const result = await categoriesAPI.getAll();
        setCategories(Array.isArray(result) ? result : result.categories || []);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Lỗi tải danh mục');
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, loading, error };
};

/**
 * Hook để fetch Brands từ API
 */
export const useBrands = () => {
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setLoading(true);
        const { brandsAPI } = await import('@/services/api');
        const result = await brandsAPI.getAll();
        setBrands(Array.isArray(result) ? result : result.brands || []);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Lỗi tải thương hiệu');
        setBrands([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
  }, []);

  return { brands, loading, error };
};

/**
 * Hook để fetch News từ API
 */
export const useNews = (params?: Record<string, any>) => {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const { newsAPI } = await import('@/services/api');
        const result = await newsAPI.getAll(params);
        setNews(Array.isArray(result) ? result : result.news || []);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Lỗi tải tin tức');
        setNews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [JSON.stringify(params)]);

  return { news, loading, error };
};

/**
 * Hook để fetch featured Products từ API
 */
export const useFeaturedProducts = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const { productsAPI } = await import('@/services/api');
        const result = await productsAPI.getFeatured();
        setProducts(Array.isArray(result) ? result : result.products || []);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Lỗi tải sản phẩm nổi bật');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return { products, loading, error };
};

/**
 * Hook để fetch Home Data từ API
 */
export const useHomeData = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        const { homeAPI } = await import('@/services/api');
        const result = await homeAPI.getHomeData();
        setData(result);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Lỗi tải dữ liệu trang chủ');
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  return { data, loading, error };
};
