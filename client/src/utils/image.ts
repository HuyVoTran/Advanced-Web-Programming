export const resolveImageSrc = (src?: string | null, folder: 'products' | 'categories' | 'news' = 'products'): string | undefined => {
  if (!src) return undefined;
  if (src.startsWith('http') || src.startsWith('data:')) return src;
  if (src.startsWith('/client/public/')) {
    return src.replace('/client/public', '');
  }
  if (src.startsWith('/')) return src;
  return `/images/${folder}/${src}`;
};

export const getPrimaryProductImage = (product: { images?: string[]; image?: string }): string | undefined => {
  const firstGalleryImage = Array.isArray(product.images)
    ? product.images.find((img) => typeof img === 'string' && img.trim().length > 0)
    : undefined;

  return resolveImageSrc(firstGalleryImage || product.image, 'products');
};