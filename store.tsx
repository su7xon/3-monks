
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Product, CartItem, Order, OrderStatus, CategoryWithImage, SiteConfig } from './types';
import {
  saveProduct,
  deleteProduct,
  saveOrder,
  saveCategory,
  deleteCategory,
  saveSiteConfig,
  subscribeToProducts,
  subscribeToOrders,
  subscribeToCategories,
  subscribeToSiteConfig,
  subscribeToProductTypes,
  saveProductTypes as saveProductTypesToFirebase,
  uploadImage,
  uploadImages,
  deleteOrder as deleteOrderFromFirebase
} from './firebase';

interface CategoryWithId extends CategoryWithImage {
  id?: string;
}

const DEFAULT_CATEGORIES: CategoryWithId[] = [
  { id: 'cat_0', name: 'Men', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop' },
  { id: 'cat_1', name: 'Women', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop' },
  { id: 'cat_2', name: 'Accessories', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop' },
];

const DEFAULT_SITE_CONFIG: SiteConfig = {
  heroTitle: 'THE III MONKS',
  heroSubtitle: 'EVOLUTION OF THE STREET SOUL',
  heroButtonText: 'SHOP COLLECTION',
  heroBannerImage: '',
  contactPhone: '+91 9045848613',
  contactEmail: 'info@the3monks.com',
  contactAddress: 'Haldwani, Uttarakhand, India',
};

interface ShopContextType {
  products: Product[];
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  removeProduct: (productId: string) => void;
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string, size: string, color: string) => void;
  updateQuantity: (id: string, size: string, color: string, quantity: number) => void;
  clearCart: () => void;
  orders: Order[];
  addOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  deleteOrder: (orderId: string) => Promise<void>;
  categories: CategoryWithId[];
  setCategories: React.Dispatch<React.SetStateAction<CategoryWithId[]>>;
  siteConfig: SiteConfig;
  setSiteConfig: React.Dispatch<React.SetStateAction<SiteConfig>>;
  saveAllCategories: () => Promise<void>;
  productTypes: string[];
  setProductTypes: React.Dispatch<React.SetStateAction<string[]>>;
  saveProductTypes: () => Promise<void>;
  isLoading: boolean;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProductsState] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [categories, setCategoriesState] = useState<CategoryWithId[]>([]); // Start empty to avoid flash
  const [siteConfig, setSiteConfigState] = useState<SiteConfig>(DEFAULT_SITE_CONFIG);
  const [productTypes, setProductTypesState] = useState<string[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);

  const hasLoadedCategories = useRef(false);
  const hasLoadedConfig = useRef(false);

  useEffect(() => {
    console.log('[Store] Setting up Firestore subscriptions...');

    const unsubProducts = subscribeToProducts((data) => {
      console.log('[Store] Products received:', data.length);
      setProductsState(data);
      setIsLoading(false);
    });

    const unsubOrders = subscribeToOrders((data) => {
      console.log('[Store] Orders received:', data.length);
      setOrders(data);
    });

    const unsubCategories = subscribeToCategories((data) => {
      console.log('[Store] Categories received from Firestore:', data.length, data);
      hasLoadedCategories.current = true;
      setCategoriesLoaded(true);
      if (data.length > 0) {

        const categoriesWithIds = data.map((cat: any) => ({
          id: cat.id || `cat_${Date.now()}_${Math.random()}`,
          name: cat.name,
          image: cat.image
        }));
        setCategoriesState(categoriesWithIds);
      } else {

        setCategoriesState(DEFAULT_CATEGORIES);
      }
    });

    const unsubConfig = subscribeToSiteConfig((data) => {
      console.log('[Store] Site config received:', !!data);
      hasLoadedConfig.current = true;
      if (data) {
        setSiteConfigState(data);
      }
    });

    const unsubProductTypes = subscribeToProductTypes((data) => {
      console.log('[Store] Product types received:', data);
      setProductTypesState(data);
    });

    return () => {
      unsubProducts();
      unsubOrders();
      unsubCategories();
      unsubConfig();
      unsubProductTypes();
    };
  }, []);

  const addProduct = useCallback(async (product: Product) => {
    console.log('[Store] Adding product:', product.id);
    try {

      const imageUrls = await uploadImages(product.images || [], 'products', product.id);
      const productToSave = { ...product, images: imageUrls };
      await saveProduct(productToSave);
      console.log('[Store] Product saved successfully:', product.id);
    } catch (error) {
      console.error('[Store] Error saving product:', error);
      throw error; // Re-throw so UI can handle it
    }
  }, []);

  const updateProduct = useCallback(async (product: Product) => {
    console.log('[Store] Updating product:', product.id);
    try {

      const imageUrls = await uploadImages(product.images || [], 'products', product.id);
      const productToSave = { ...product, images: imageUrls };
      await saveProduct(productToSave);
      console.log('[Store] Product updated successfully:', product.id);
    } catch (error) {
      console.error('[Store] Error updating product:', error);
      throw error;
    }
  }, []);

  const removeProduct = useCallback((productId: string) => {
    console.log('[Store] Removing product:', productId);
    deleteProduct(productId).catch(console.error);
  }, []);

  const setCategories: React.Dispatch<React.SetStateAction<CategoryWithId[]>> = useCallback((value) => {
    setCategoriesState(prev => {
      const newCategories = typeof value === 'function' ? value(prev) : value;

      const withIds = newCategories.map((cat, index) => ({
        ...cat,
        id: cat.id || `cat_${index}`
      }));
      return withIds;
    });
  }, []);

  const saveAllCategories = useCallback(async () => {
    console.log('[Store] Saving all categories to Firestore:', categories.length);
    try {
      for (let i = 0; i < categories.length; i++) {
        const cat = categories[i];
        const id = cat.id || `cat_${i}`;
        console.log('[Store] Saving category:', id, cat.name);

        const imageUrl = await uploadImage(cat.image, `categories/${id}/image_${Date.now()}.jpg`);
        await saveCategory({ name: cat.name, image: imageUrl }, id);
      }
      console.log('[Store] All categories saved successfully!');
    } catch (error) {
      console.error('[Store] Error saving categories:', error);
      throw error;
    }
  }, [categories]);

  const setProductTypes: React.Dispatch<React.SetStateAction<string[]>> = useCallback((value) => {
    setProductTypesState(prev => typeof value === 'function' ? value(prev) : value);
  }, []);

  const saveProductTypes = useCallback(async () => {
    console.log('[Store] Saving product types to Firestore:', productTypes);
    try {
      await saveProductTypesToFirebase(productTypes);
      console.log('[Store] Product types saved successfully!');
    } catch (error) {
      console.error('[Store] Error saving product types:', error);
      throw error;
    }
  }, [productTypes]);

  const setSiteConfig: React.Dispatch<React.SetStateAction<SiteConfig>> = useCallback((value) => {
    setSiteConfigState(prev => {
      const newConfig = typeof value === 'function' ? value(prev) : value;

      console.log('[Store] Saving site config to Firestore');
      saveSiteConfig(newConfig).catch(console.error);
      return newConfig;
    });
  }, []);

  const addToCart = (item: CartItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id && i.selectedSize === item.selectedSize && i.selectedColor === item.selectedColor);
      if (existing) {
        return prev.map(i => i === existing ? { ...i, quantity: i.quantity + item.quantity } : i);
      }
      return [...prev, item];
    });
  };

  const removeFromCart = (id: string, size: string, color: string) => {
    setCart(prev => prev.filter(item => !(item.id === id && item.selectedSize === size && item.selectedColor === color)));
  };

  const updateQuantity = (id: string, size: string, color: string, quantity: number) => {
    if (quantity <= 0) return removeFromCart(id, size, color);
    setCart(prev => prev.map(item => (item.id === id && item.selectedSize === size && item.selectedColor === color) ? { ...item, quantity } : item));
  };

  const clearCart = () => setCart([]);

  const addOrder = async (order: Order) => {
    console.log('[Store] Adding order:', order.id);
    try {
      await saveOrder(order);
    } catch (error) {
      console.error('[Store] Error adding order:', error);
      throw error;
    }
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      console.log('[Store] Updating order status:', orderId, status);
      saveOrder({ ...order, status }).catch(console.error);
    }
  };

  const deleteOrder = async (orderId: string) => {
    console.log('[Store] Deleting order:', orderId);
    try {
      await deleteOrderFromFirebase(orderId);
    } catch (error) {
      console.error('[Store] Error deleting order:', error);
      throw error;
    }
  };

  return (
    <ShopContext.Provider value={{
      products,
      addProduct,
      updateProduct,
      removeProduct,
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      orders,
      addOrder,
      updateOrderStatus,
      categories,
      setCategories,
      siteConfig,
      setSiteConfig,
      saveAllCategories,
      productTypes,
      setProductTypes,
      saveProductTypes,
      isLoading,
      deleteOrder
    }}>
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) throw new Error('useShop must be used within ShopProvider');
  return context;
};
