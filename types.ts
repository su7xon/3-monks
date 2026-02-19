
export type Category = 'All' | 'Men' | 'Women' | 'Unisex' | 'Accessories';

export interface CategoryWithImage {
  name: string;
  image: string;
}

export interface SiteConfig {
  heroTitle: string;
  heroSubtitle: string;
  heroButtonText: string;
  heroBannerImage: string;
  contactPhone: string;
  contactEmail: string;
  contactAddress: string;
  aboutImage?: string;
  aboutTitle?: string;
  aboutText?: string;
  heroVideoUrl?: string;
  storyButtonText?: string;
  storyButtonLink?: string;
}

export interface Story {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  link?: string;
  createdAt: number;
}

export interface Product {
  id: string;
  name: string;
  subtitle?: string;
  description: string;
  price: number;
  salePrice?: number;
  category: Category;
  images: string[];
  colors: string[];
  colorStock?: { [key: string]: number };
  variantStock?: { [key: string]: number };
  sizes: string[];
  stock: number;
  isNew?: boolean;
  isFeatured?: boolean;
  isTrending?: boolean;
  productType?: string;
  createdAt?: number;
}

export interface CartItem extends Product {
  selectedSize: string;
  selectedColor: string;
  quantity: number;
}

export enum OrderStatus {
  PENDING = 'Pending',
  SHIPPED = 'Shipped',
  DELIVERED = 'Delivered',
  CANCELLED = 'Cancelled'
}

export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  customer: {
    name: string;
    email: string;
    address: string;
    phone: string;
    pincode?: string;
    instagramId?: string;
  };
  paymentMethod?: string;
}
export interface Review {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  userName: string;
  rating: number;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: number;
}
