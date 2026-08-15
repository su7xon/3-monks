
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Product, CartItem, Order, OrderStatus, CategoryWithImage, SiteConfig, Story, Review, GiveawayEntry } from './types';
import {
  saveProduct,
  deleteProduct,
  saveOrder,
  saveCategory,
  deleteCategory,
  saveSiteConfig,
  subscribeToOrders,
  subscribeToGiveawayEntries,
  subscribeToProductTypes,
  saveProductTypes as saveProductTypesToFirebase,
  uploadImage,
  uploadImages,
  deleteOrder as deleteOrderFromFirebase,
  saveStory,
  deleteStory,
  getProductsOnce,
  getCategoriesOnce,
  getStoriesOnce,
  getSiteConfigOnce,
  getProductTypesOnce,
  getGiveawayConfigOnce,
  saveGiveawayEntry,
  deleteGiveawayEntry as deleteGiveawayEntryFromFirebase,
  saveGiveawayConfig
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
  contactEmail: 'info@the3monks.in',
  contactAddress: 'Haldwani, Uttarakhand, India',
  heroVideoUrl: 'https://player.vimeo.com/external/370331493.sd.mp4?s=27d04e137b2d58546b9a89c922a6132717a66e4a&profile_id=164&oauth2_token_id=57447761',
  storyButtonText: 'Our Story',
  storyButtonLink: '/about',
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
  stories: Story[];
  addStory: (story: Story) => Promise<void>;
  deleteStory: (storyId: string) => Promise<void>;
  isLoading: boolean;
  reduceStock: (order: Order) => Promise<void>;
  addReview: (review: Omit<Review, 'id' | 'status' | 'createdAt'>) => Promise<void>;
  getProductReviews: (productId: string) => Promise<Review[]>;
  getAllReviews: () => Promise<Review[]>;
  getApprovedReviews: () => Promise<Review[]>;
  updateReviewStatus: (reviewId: string, status: 'approved' | 'rejected') => Promise<void>;
  deleteReview: (reviewId: string) => Promise<void>;
  giveawayEntries: GiveawayEntry[];
  addGiveawayEntry: (entry: GiveawayEntry) => Promise<void>;
  deleteGiveawayEntry: (entryId: string) => Promise<void>;
  giveawayEnabled: boolean;
  setGiveawayEnabled: (enabled: boolean) => Promise<void>;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProductsState] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [categories, setCategoriesState] = useState<CategoryWithId[]>([]);
  const [siteConfig, setSiteConfigState] = useState<SiteConfig>(DEFAULT_SITE_CONFIG);
  const [productTypes, setProductTypesState] = useState<string[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('iii_monks_cart');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [giveawayEntries, setGiveawayEntries] = useState<GiveawayEntry[]>([]);
  const [giveawayEnabled, setGiveawayEnabledState] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('iii_monks_cart', JSON.stringify(cart));
    } catch {  }
  }, [cart]);

  const hasLoadedCategories = useRef(false);
  const hasLoadedConfig = useRef(false);
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith('/admin');

  const readCache = useCallback((key: string) => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }, []);

  const writeCache = useCallback((key: string, data: any) => {
    try {
      localStorage.setItem(key, JSON.stringify({ ts: Date.now(), data }));
    } catch {  }
  }, []);

  const isCacheFresh = useCallback((entry: any, ttlMs: number) => {
    return !!entry && typeof entry.ts === 'number' && Date.now() - entry.ts < ttlMs;
  }, []);

  const loadWithCache = useCallback(async (cacheKey: string, ttlMs: number, fetcher: () => Promise<any[]>, setter: (d: any) => void, ttlAdminMs?: number) => {
    const ttl = isAdmin && ttlAdminMs ? ttlAdminMs : ttlMs;
    const cached = readCache(cacheKey);
    if (isCacheFresh(cached, ttl)) {
      setter(cached.data);
    }
    try {
      const data = await fetcher();
      writeCache(cacheKey, data);
      setter(data);
      return data;
    } catch (error) {
      console.error('[Store] Fetch failed for', cacheKey, error);
      return null;
    }
  }, [isAdmin, readCache, writeCache, isCacheFresh]);

  useEffect(() => {
    console.log('[Store] Setting up data load...', isAdmin ? '(admin mode)' : '(public mode)');
    let cancelled = false;

    const PRODUCT_TTL = 10 * 60 * 1000;
    const PRODUCT_TTL_ADMIN = 30 * 1000;
    const CACHE_TTL = 10 * 60 * 1000;

    const cachedProducts = readCache('iii_monks_products');
    if (isCacheFresh(cachedProducts, isAdmin ? PRODUCT_TTL_ADMIN : PRODUCT_TTL)) {
      setProductsState(cachedProducts.data);
      setIsLoading(false);
    }

    (async () => {
      const data = await getProductsOnce();
      if (cancelled) return;
      if (data.length > 0) {
        writeCache('iii_monks_products', data);
        setProductsState(data);
      }
      setIsLoading(false);
    })();

    (async () => {
      const data = await getCategoriesOnce();
      if (cancelled) return;
      hasLoadedCategories.current = true;
      setCategoriesLoaded(true);
      if (data.length > 0) {
        const categoriesWithIds = data.map((cat: any) => ({
          id: cat.id || `cat_${Date.now()}_${Math.random()}`,
          name: cat.name,
          image: cat.image
        }));
        writeCache('iii_monks_categories', categoriesWithIds);
        setCategoriesState(categoriesWithIds);
      } else {
        const cachedCats = readCache('iii_monks_categories');
        if (!isCacheFresh(cachedCats, CACHE_TTL)) {
          setCategoriesState(DEFAULT_CATEGORIES);
        }
      }
    })();

    (async () => {
      const data = await getSiteConfigOnce();
      if (cancelled) return;
      hasLoadedConfig.current = true;
      if (data) {
        writeCache('iii_monks_siteconfig', data);
        setSiteConfigState(data);
      }
    })();

    (async () => {
      const data = await getStoriesOnce();
      if (cancelled) return;
      if (data.length > 0) {
        writeCache('iii_monks_stories', data);
        setStories(data);
      }
    })();

    (async () => {
      const data = await getProductTypesOnce();
      if (cancelled) return;
      if (data.length > 0) {
        writeCache('iii_monks_producttypes', data);
        setProductTypesState(data);
      }
    })();

    (async () => {
      const data = await getGiveawayConfigOnce();
      if (cancelled) return;
      setGiveawayEnabledState(data);
    })();

    const unsubs: (() => void)[] = [];

    if (isAdmin) {
      unsubs.push(subscribeToOrders((data) => {
        console.log('[Store] Orders received:', data.length);
        setOrders(data);
      }));
      unsubs.push(subscribeToGiveawayEntries((data) => {
        console.log('[Store] Giveaway entries received:', data.length);
        setGiveawayEntries(data);
      }));
    }

    const cachedCategories = readCache('iii_monks_categories');
    if (isCacheFresh(cachedCategories, CACHE_TTL) && cachedCategories.data.length > 0) {
      setCategoriesState(cachedCategories.data);
    }
    const cachedConfig = readCache('iii_monks_siteconfig');
    if (isCacheFresh(cachedConfig, CACHE_TTL)) {
      setSiteConfigState(cachedConfig.data);
    }
    const cachedStories = readCache('iii_monks_stories');
    if (isCacheFresh(cachedStories, CACHE_TTL)) {
      setStories(cachedStories.data);
    }

    return () => {
      cancelled = true;
      unsubs.forEach(u => u());
    };
  }, [isAdmin]);

  const addProduct = useCallback(async (product: Product) => {
    console.log('[Store] Adding product:', product.id);
    try {
      const imageUrls = await uploadImages(product.images || [], 'products', product.id);
      const productToSave = { ...product, images: imageUrls };
      await saveProduct(productToSave);
      console.log('[Store] Product saved successfully:', product.id);
    } catch (error) {
      console.error('[Store] Error saving product:', error);
      throw error;
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

  const addStory = useCallback(async (story: Story) => {
    console.log('[Store] Adding story:', story.id);
    try {
      const imageUrl = await uploadImage(story.image, `stories/${story.id}/image_${Date.now()}.jpg`);
      await saveStory({ ...story, image: imageUrl });
      console.log('[Store] Story saved successfully!');
    } catch (error) {
      console.error('[Store] Error saving story:', error);
      throw error;
    }
  }, []);

  const deleteStoryFromStore = useCallback(async (storyId: string) => {
    console.log('[Store] Deleting story:', storyId);
    try {
      await deleteStory(storyId);
      console.log('[Store] Story deleted successfully!');
    } catch (error) {
      console.error('[Store] Error deleting story:', error);
      throw error;
    }
  }, []);

  const setSiteConfig: React.Dispatch<React.SetStateAction<SiteConfig>> = useCallback((value) => {
    setSiteConfigState(prev => {
      const newConfig = typeof value === 'function' ? value(prev) : value;

      console.log('[Store] Saving site config to Firestore');
      saveSiteConfig(newConfig).catch(console.error);
      return newConfig;
    });
  }, []);

  const addToCart = useCallback((item: CartItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id && i.selectedSize === item.selectedSize && i.selectedColor === item.selectedColor);
      
      let maxStock = item.stock || 0;
      const colorKey = item.selectedColor || 'Standard';
      if (item.variantStock) {
          const variantKey = `${colorKey}_${item.selectedSize}`;
          if (item.variantStock[variantKey] !== undefined) maxStock = item.variantStock[variantKey];
          else if (item.variantStock[item.selectedSize] !== undefined) maxStock = item.variantStock[item.selectedSize];
          else if (item.variantStock[`_${item.selectedSize}`] !== undefined) maxStock = item.variantStock[`_${item.selectedSize}`];
      } else if (item.colorStock && item.colorStock[item.selectedColor] !== undefined) {
          maxStock = item.colorStock[item.selectedColor];
      }

      if (existing) {
        const newQuantity = Math.min(existing.quantity + item.quantity, maxStock);
        if (newQuantity === existing.quantity) {
          alert(`You cannot add more of this item. Only ${maxStock} left in stock.`);
          return prev;
        }
        return prev.map(i => i === existing ? { ...i, quantity: newQuantity } : i);
      }
      
      const addedQuantity = Math.min(item.quantity, maxStock);
      if (addedQuantity <= 0) {
        alert('This item is currently out of stock.');
        return prev;
      }
      return [...prev, { ...item, quantity: addedQuantity }];
    });
  }, []);

  const removeFromCart = useCallback((id: string, size: string, color: string) => {
    setCart(prev => prev.filter(item => !(item.id === id && item.selectedSize === size && item.selectedColor === color)));
  }, []);

  const updateQuantity = useCallback((id: string, size: string, color: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(prev => prev.filter(item => !(item.id === id && item.selectedSize === size && item.selectedColor === color)));
      return;
    }
    setCart(prev => prev.map(item => {
      if (item.id === id && item.selectedSize === size && item.selectedColor === color) {
        let maxStock = item.stock || 0;
        const colorKey = color || 'Standard';
        if (item.variantStock) {
            const variantKey = `${colorKey}_${size}`;
            if (item.variantStock[variantKey] !== undefined) maxStock = item.variantStock[variantKey];
            else if (item.variantStock[size] !== undefined) maxStock = item.variantStock[size];
            else if (item.variantStock[`_${size}`] !== undefined) maxStock = item.variantStock[`_${size}`];
        } else if (item.colorStock && item.colorStock[color] !== undefined) {
            maxStock = item.colorStock[color];
        }
        const newQuantity = Math.min(quantity, maxStock);
        if (quantity > maxStock) {
          alert(`Only ${maxStock} left in stock.`);
        }
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

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

  const reduceStock = useCallback(async (order: Order) => {
    console.log('[Store] Reducing stock for order:', order.id);
    try {
      const { reduceStockForOrder } = await import('./firebase');
      await reduceStockForOrder(order);
      console.log('[Store] Stock reduced successfully for order:', order.id);
    } catch (error) {
      console.error('[Store] Error reducing stock:', error);
      throw error;
    }
  }, []);

  const addReview = useCallback(async (review: Omit<Review, 'id' | 'status' | 'createdAt'>) => {
    try {
      const { addReview } = await import('./firebase');
      await addReview(review);
    } catch (error) {
      console.error('[Store] Error adding review:', error);
      throw error;
    }
  }, []);

  const getProductReviews = useCallback(async (productId: string) => {
    try {
      const { getProductReviews } = await import('./firebase');
      return await getProductReviews(productId);
    } catch (error) {
      console.error('[Store] Error fetching product reviews:', error);
      return [];
    }
  }, []);

  const getAllReviews = useCallback(async () => {
    try {
      const { getAllReviews } = await import('./firebase');
      return await getAllReviews();
    } catch (error) {
      console.error('[Store] Error fetching all reviews:', error);
      return [];
    }
  }, []);

  const getApprovedReviews = useCallback(async () => {
    try {
      const { getApprovedReviews } = await import('./firebase');
      return await getApprovedReviews();
    } catch (error) {
      console.error('[Store] Error fetching approved reviews:', error);
      return [];
    }
  }, []);

  const updateReviewStatus = useCallback(async (reviewId: string, status: 'approved' | 'rejected') => {
    try {
      const { updateReviewStatus } = await import('./firebase');
      await updateReviewStatus(reviewId, status);
    } catch (error) {
      console.error('[Store] Error updating review status:', error);
      throw error;
    }
  }, []);

  const deleteReview = useCallback(async (reviewId: string) => {
    try {
      const { deleteReview } = await import('./firebase');
      await deleteReview(reviewId);
    } catch (error) {
      console.error('[Store] Error deleting review:', error);
      throw error;
    }
  }, []);

  const addGiveawayEntry = useCallback(async (entry: GiveawayEntry) => {
    try {
      await saveGiveawayEntry(entry);
    } catch (error) {
      console.error('[Store] Error adding giveaway entry:', error);
      throw error;
    }
  }, []);

  const deleteGiveawayEntry = useCallback(async (entryId: string) => {
    try {
      await deleteGiveawayEntryFromFirebase(entryId);
    } catch (error) {
      console.error('[Store] Error deleting giveaway entry:', error);
      throw error;
    }
  }, []);

  const setGiveawayEnabled = useCallback(async (enabled: boolean) => {
    try {
      await saveGiveawayConfig(enabled);
    } catch (error) {
      console.error('[Store] Error saving giveaway config:', error);
      throw error;
    }
  }, []);

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
      stories,
      addStory,
      deleteStory: deleteStoryFromStore,
      isLoading,
      deleteOrder,
      reduceStock,
      addReview,
      getProductReviews,
      getAllReviews,
      getApprovedReviews,
      updateReviewStatus,
      deleteReview,
      giveawayEntries,
      addGiveawayEntry,
      deleteGiveawayEntry,
      giveawayEnabled,
      setGiveawayEnabled
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
