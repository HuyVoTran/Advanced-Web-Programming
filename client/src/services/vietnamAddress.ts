import { API_CONFIG } from '@/config/api';

export type VietnamWard = {
  code: number;
  name: string;
};

export type VietnamDistrict = {
  code: number;
  name: string;
  wards: VietnamWard[];
};

export type VietnamProvince = {
  code: number;
  name: string;
  districts: VietnamDistrict[];
};

let cachedProvinces: VietnamProvince[] | null = null;

const API_URLS = [
  'http://localhost:5000/api/vietnam-address/provinces',
  `${API_CONFIG.BASE_URL}/vietnam-address/provinces`,
] as const;

const FETCH_TIMEOUT_MS = 10000;

const toSafeNumber = (value: unknown, fallback = 0): number => {
  const next = Number(value);
  return Number.isFinite(next) ? next : fallback;
};

const normalizeProvinces = (raw: unknown): VietnamProvince[] => {
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw
    .map((province: any) => ({
      code: toSafeNumber(province?.code),
      name: String(province?.name || '').trim(),
      districts: Array.isArray(province?.districts)
        ? province.districts.map((district: any) => ({
            code: toSafeNumber(district?.code),
            name: String(district?.name || '').trim(),
            wards: Array.isArray(district?.wards)
              ? district.wards.map((ward: any) => ({
                  code: toSafeNumber(ward?.code),
                  name: String(ward?.name || '').trim(),
                }))
              : [],
          }))
        : [],
    }))
    .filter((province: VietnamProvince) => province.code > 0 && province.name.length > 0);
};

const extractArrayPayload = (raw: unknown): unknown => {
  if (Array.isArray(raw)) {
    return raw;
  }

  if (raw && typeof raw === 'object' && Array.isArray((raw as any).data)) {
    return (raw as any).data;
  }

  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
      if (parsed && typeof parsed === 'object' && Array.isArray(parsed.data)) {
        return parsed.data;
      }
    } catch {
      return [];
    }
  }

  return [];
};

const hasDistrictHierarchy = (provinces: VietnamProvince[]): boolean => {
  if (!Array.isArray(provinces) || provinces.length === 0) {
    return false;
  }

  return provinces.some(
    (province) =>
      Array.isArray(province.districts) &&
      province.districts.some(
        (district) => Array.isArray(district.wards)
      )
  );
};

const fetchJsonWithTimeout = async (url: string): Promise<unknown> => {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  } finally {
    window.clearTimeout(timeout);
  }
};

export const getVietnamProvinces = async (): Promise<VietnamProvince[]> => {
  if (cachedProvinces) {
    return cachedProvinces;
  }

  let lastError: unknown = null;

  for (const url of API_URLS) {
    try {
      const raw = await fetchJsonWithTimeout(url);
      const normalized = normalizeProvinces(extractArrayPayload(raw));

      if (normalized.length > 0 && hasDistrictHierarchy(normalized)) {
        cachedProvinces = normalized;
        return cachedProvinces;
      }
    } catch (error) {
      lastError = error;
    }
  }

  throw new Error(
    `Không thể tải dữ liệu tỉnh/thành Việt Nam${lastError ? ` (${String((lastError as Error)?.message || lastError)})` : ''}`
  );
};
