
export const slugify = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')     
    .replace(/[^\w-]+/g, '')  
    .replace(/--+/g, '-');    
};


export const getProductUrl = (name: string, id: string): string => {
  const slug = slugify(name);
  return `/product/${slug}-${id}`;
};
