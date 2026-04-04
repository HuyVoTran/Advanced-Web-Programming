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

const API_URL = 'https://provinces.open-api.vn/api/p?depth=3';

export const getVietnamProvinces = async (): Promise<VietnamProvince[]> => {
  if (cachedProvinces) {
    return cachedProvinces;
  }

  const response = await fetch(API_URL);
  if (!response.ok) {
    throw new Error('Không thể tải dữ liệu tỉnh/thành Việt Nam');
  }

  const data = (await response.json()) as VietnamProvince[];
  cachedProvinces = Array.isArray(data) ? data : [];
  return cachedProvinces;
};
