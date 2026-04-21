// Utility function to convert strings to URL-friendly slugs
export const slugify = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')     // Replace spaces with -
    .replace(/[^\w-]+/g, '')  // Remove all non-word chars
    .replace(/--+/g, '-');    // Replace multiple - with single -
};

// Helper to create a product URL from name and id
export const getProductUrl = (name: string, id: string): string => {
  const slug = slugify(name);
  return `/product/${slug}-${id}`;
};
