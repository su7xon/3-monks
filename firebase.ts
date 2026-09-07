import { initializeApp } from 'firebase/app';
import {
    getFirestore,
    collection,
    doc,
    setDoc,
    deleteDoc,
    onSnapshot,
    query,
    where,
    getDocs,
    updateDoc,
    increment,
    getDoc
} from 'firebase/firestore';
import { getStorage, ref, uploadString, getDownloadURL, deleteObject } from 'firebase/storage';
import { Product, Order, CategoryWithImage, SiteConfig, Review } from './types';

const firebaseConfig = {
    apiKey: "AIzaSyAH-u3HGlVPYexW4oviSRKXD56_KUWvslw",
    authDomain: "monks-84b29.firebaseapp.com",
    projectId: "monks-84b29",
    storageBucket: "monks-84b29.firebasestorage.app",
    messagingSenderId: "208195255915",
    appId: "1:208195255915:web:63f596ccbff48982797b2e",
    measurementId: "G-DX7KQNJ3R5"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

console.log('[Firebase] Initialized with project:', firebaseConfig.projectId);

export const uploadImageFromUrl = async (imageUrl: string): Promise<string> => {
    if (imageUrl.includes('firebasestorage.googleapis.com')) {
        return imageUrl;
    }

    try {
        console.log('[Storage] Fetching image from URL...');

        const response = await fetch(imageUrl);
        const blob = await response.blob();

        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = async () => {
                try {
                    const base64Data = reader.result as string;
                    const uploadedUrl = await uploadImage(base64Data);
                    resolve(uploadedUrl);
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (error: any) {
        const msg = error?.message || String(error);
        console.error('[Storage] Migration failed:', msg);
    }
};

export const uploadImage = async (base64Data: string, _path?: string): Promise<string> => {
    if (!base64Data.startsWith('data:image')) {
        return base64Data;
    }

    try {
        console.log('[Storage] Uploading image...');

        const mime = base64Data.split(';')[0].split(':')[1] || 'image/jpeg';
        const ext = mime.split('/')[1] || 'jpg';
        const cleanBase64 = base64Data.split(',')[1];
        const path = _path || `products/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const storageRef = ref(storage, path);

        await uploadString(storageRef, cleanBase64, 'base64', {
            contentType: mime,
            cacheControl: 'public, max-age=31536000, immutable'
        });
        const url = await getDownloadURL(storageRef);
        console.log('[Storage] Upload success:', url);
        return url;
    } catch (error: any) {
        console.error('[Storage] Upload failed:', error?.message || error);
        throw error;
    }
};

export const uploadImages = async (base64Images: string[], _folder?: string, _itemId?: string): Promise<string[]> => {
    const urls: string[] = [];
    for (const img of base64Images) {
        const url = await uploadImage(img);
        urls.push(url);
    }
    return urls;
};

export const deleteImage = async (url: string) => {
    if (!url) return;

    if (url.includes('firebasestorage.googleapis.com')) {
        try {
            const storageRef = ref(storage, url);
            await deleteObject(storageRef);
            console.log('[Storage] Deleted:', url);
        } catch (error) {
            console.error('[Storage] Delete error:', error);
        }
        return;
    }

    console.warn('[Storage] Not a Storage URL, skipping:', url);
};

export const productsCollection = collection(db, 'products');
export const ordersCollection = collection(db, 'orders');
export const categoriesCollection = collection(db, 'categories');

export const siteConfigDoc = doc(db, 'config', 'siteConfig');

const removeUndefined = (obj: any): any => {
    if (obj === null || obj === undefined) {
        return obj;
    }
    if (Array.isArray(obj)) {
        return obj.map(item => removeUndefined(item));
    }
    if (typeof obj === 'object') {
        const cleaned: any = {};
        for (const key in obj) {
            if (obj[key] !== undefined) {
                cleaned[key] = removeUndefined(obj[key]);
            }
        }
        return cleaned;
    }
    return obj;
};

export const saveProduct = async (product: Product) => {
    try {

        const cleanProduct = removeUndefined(product);

        const docSize = JSON.stringify(cleanProduct).length;
        console.log('[Firebase] Saving product, doc size:', Math.round(docSize / 1024), 'KB');
        if (docSize > 900000) {
            throw new Error(`Document too large: ${Math.round(docSize / 1024)}KB. Max is ~1MB. Try smaller images.`);
        }
        await setDoc(doc(productsCollection, cleanProduct.id), cleanProduct);
        console.log('[Firebase] Product saved:', cleanProduct.id);
    } catch (error: any) {
        console.error('[Firebase] Error saving product:', error?.message || error);
        throw error;
    }
};

export const deleteProduct = async (productId: string) => {
    try {
        await deleteDoc(doc(productsCollection, productId));
        console.log('[Firebase] Product deleted:', productId);
    } catch (error) {
        console.error('[Firebase] Error deleting product:', error);
        throw error;
    }
};

export const saveOrder = async (order: Order) => {
    try {
        const cleanOrder = removeUndefined(order);
        await setDoc(doc(ordersCollection, order.id), cleanOrder);
        console.log('[Firebase] Order saved:', order.id);
    } catch (error) {
        console.error('[Firebase] Error saving order:', error);
        throw error;
    }
};

export const deleteOrder = async (orderId: string) => {
    try {
        await deleteDoc(doc(ordersCollection, orderId));
        console.log('[Firebase] Order deleted:', orderId);
    } catch (error) {
        console.error('[Firebase] Error deleting order:', error);
        throw error;
    }
};

export const getOrder = async (orderId: string): Promise<Order | null> => {
    try {
        const { getDoc } = await import('firebase/firestore');
        const snapshot = await getDoc(doc(ordersCollection, orderId));
        return snapshot.exists() ? { ...snapshot.data(), id: snapshot.id } as Order : null;
    } catch (error) {
        console.error('[Firebase] Error getting order:', error);
        return null;
    }
};

export const saveCategory = async (category: CategoryWithImage, id: string) => {
    try {

        const docSize = JSON.stringify(category).length;
        console.log('[Firebase] Saving category, doc size:', Math.round(docSize / 1024), 'KB');
        if (docSize > 900000) {
            throw new Error(`Category image too large: ${Math.round(docSize / 1024)}KB. Max is ~1MB.`);
        }
        await setDoc(doc(categoriesCollection, id), category);
        console.log('[Firebase] Category saved:', id);
    } catch (error: any) {
        console.error('[Firebase] Error saving category:', error?.message || error);
        throw error;
    }
};

export const deleteCategory = async (id: string) => {
    try {
        await deleteDoc(doc(categoriesCollection, id));
        console.log('[Firebase] Category deleted:', id);
    } catch (error) {
        console.error('[Firebase] Error deleting category:', error);
        throw error;
    }
};

export const saveSiteConfig = async (config: SiteConfig) => {
    try {
        await setDoc(siteConfigDoc, config);
        console.log('[Firebase] Site config saved!');
    } catch (error) {
        console.error('[Firebase] Error saving site config:', error);
        throw error;
    }
};

export const getProductsOnce = async (): Promise<Product[]> => {
    try {
        const snapshot = await getDocs(productsCollection);
        const products = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Product));
        products.sort((a, b) => {
            let timeA = Number(a.createdAt) || 0;
            let timeB = Number(b.createdAt) || 0;
            if (isNaN(timeA)) timeA = 0;
            if (isNaN(timeB)) timeB = 0;
            if (timeA !== timeB) return timeB - timeA;
            return b.id.localeCompare(a.id);
        });
        console.log('[Firebase] Products fetched:', products.length);
        return products;
    } catch (error) {
        console.error('[Firebase] Error fetching products:', error);
        return [];
    }
};

export const getCategoriesOnce = async (): Promise<CategoryWithImage[]> => {
    try {
        const snapshot = await getDocs(categoriesCollection);
        const categories = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as CategoryWithImage & { id: string }));
        console.log('[Firebase] Categories fetched:', categories.length);
        return categories;
    } catch (error) {
        console.error('[Firebase] Error fetching categories:', error);
        return [];
    }
};

export const getStoriesOnce = async (): Promise<import('./types').Story[]> => {
    try {
        const snapshot = await getDocs(storiesCollection);
        const stories = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as import('./types').Story));
        stories.sort((a, b) => b.createdAt - a.createdAt);
        return stories;
    } catch (error) {
        console.error('[Firebase] Error fetching stories:', error);
        return [];
    }
};

export const getSiteConfigOnce = async (): Promise<SiteConfig | null> => {
    try {
        const { getDoc } = await import('firebase/firestore');
        const snapshot = await getDoc(siteConfigDoc);
        return snapshot.exists() ? snapshot.data() as SiteConfig : null;
    } catch (error) {
        console.error('[Firebase] Error fetching site config:', error);
        return null;
    }
};

export const getProductTypesOnce = async (): Promise<string[]> => {
    try {
        const { getDoc } = await import('firebase/firestore');
        const snapshot = await getDoc(productTypesDoc);
        return snapshot.exists() ? (snapshot.data()?.types || []) : [];
    } catch (error) {
        console.error('[Firebase] Error fetching product types:', error);
        return [];
    }
};

export const getGiveawayConfigOnce = async (): Promise<boolean> => {
    try {
        const { getDoc } = await import('firebase/firestore');
        const snapshot = await getDoc(giveawayConfigDoc);
        return snapshot.exists() ? snapshot.data()?.enabled === true : false;
    } catch (error) {
        console.error('[Firebase] Error fetching giveaway config:', error);
        return false;
    }
};

export const subscribeToProducts = (callback: (products: Product[]) => void) => {
    return onSnapshot(
        productsCollection,
        (snapshot) => {
            const products = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Product));

            products.sort((a, b) => {
                let timeA = Number(a.createdAt) || 0;
                let timeB = Number(b.createdAt) || 0;
                if (isNaN(timeA)) timeA = 0;
                if (isNaN(timeB)) timeB = 0;
                
                if (timeA !== timeB) return timeB - timeA;
                return b.id.localeCompare(a.id);
            });
            console.log('[Firebase] Products loaded:', products.length);
            callback(products);
        },
        (error) => {
            console.error('[Firebase] Error subscribing to products:', error);
        }
    );
};

export const subscribeToOrders = (callback: (orders: Order[]) => void) => {
    return onSnapshot(
        ordersCollection,
        (snapshot) => {
            const orders = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Order));

            orders.sort((a, b) => {
                const getTime = (dateVal: any) => {
                    if (!dateVal) return 0;
                    if (typeof dateVal === 'string' || typeof dateVal === 'number') {
                        const d = new Date(dateVal).getTime();
                        return isNaN(d) ? 0 : d;
                    }
                    if (dateVal.toDate) {
                        return dateVal.toDate().getTime();
                    }
                    return 0;
                };
                const timeA = getTime(a.date);
                const timeB = getTime(b.date);
                
                if (timeA !== timeB) return timeB - timeA;
                
                if (a.id < b.id) return 1;
                if (a.id > b.id) return -1;
                return 0;
            });
            console.log('[Firebase] Orders loaded:', orders.length);
            callback(orders);
        },
        (error) => {
            console.error('[Firebase] Error subscribing to orders:', error);
        }
    );
};

export const subscribeToCategories = (callback: (categories: CategoryWithImage[]) => void) => {
    return onSnapshot(
        categoriesCollection,
        (snapshot) => {
            const categories = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as CategoryWithImage & { id: string }));
            console.log('[Firebase] Categories loaded:', categories.length);
            callback(categories);
        },
        (error) => {
            console.error('[Firebase] Error subscribing to categories:', error);
        }
    );
};

export const subscribeToSiteConfig = (callback: (config: SiteConfig | null) => void) => {
    return onSnapshot(
        siteConfigDoc,
        (snapshot) => {
            console.log('[Firebase] Site config loaded:', snapshot.exists());
            callback(snapshot.exists() ? snapshot.data() as SiteConfig : null);
        },
        (error) => {
            console.error('[Firebase] Error subscribing to site config:', error);
        }
    );
};

export const storiesCollection = collection(db, 'stories');

export const saveStory = async (story: import('./types').Story) => {
    try {
        await setDoc(doc(storiesCollection, story.id), story);
        console.log('[Firebase] Story saved:', story.id);
    } catch (error) {
        console.error('[Firebase] Error saving story:', error);
        throw error;
    }
};

export const deleteStory = async (storyId: string) => {
    try {
        await deleteDoc(doc(storiesCollection, storyId));
        console.log('[Firebase] Story deleted:', storyId);
    } catch (error) {
        console.error('[Firebase] Error deleting story:', error);
        throw error;
    }
};

export const subscribeToStories = (callback: (stories: import('./types').Story[]) => void) => {
    return onSnapshot(
        storiesCollection,
        (snapshot) => {
            const stories = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as import('./types').Story));
            stories.sort((a, b) => b.createdAt - a.createdAt);
            console.log('[Firebase] Stories loaded:', stories.length);
            callback(stories);
        },
        (error) => {
            console.error('[Firebase] Error subscribing to stories:', error);
        }
    );
};

const productTypesDoc = doc(db, 'settings', 'productTypes');
export const saveProductTypes = async (types: string[]) => {
    try {
        await setDoc(productTypesDoc, { types });
        console.log('[Firebase] Product types saved:', types);
    } catch (error) {
        console.error('[Firebase] Error saving product types:', error);
        throw error;
    }
};

export const subscribeToProductTypes = (callback: (types: string[]) => void) => {
    return onSnapshot(
        productTypesDoc,
        (snapshot) => {
            console.log('[Firebase] Product types loaded:', snapshot.exists());
            callback(snapshot.exists() ? (snapshot.data()?.types || []) : []);
        },
        (error) => {
            console.error('[Firebase] Error subscribing to product types:', error);
        }
    );
};

const adminAuthDoc = doc(db, 'settings', 'adminAuth');
const DEFAULT_ADMIN_PASSWORD = '3monks';

export const getAdminPassword = async (): Promise<string> => {
    try {
        const { getDoc } = await import('firebase/firestore');
        const snapshot = await getDoc(adminAuthDoc);
        if (snapshot.exists() && snapshot.data()?.password) {
            return snapshot.data().password;
        }

        await setDoc(adminAuthDoc, { password: DEFAULT_ADMIN_PASSWORD });
        return DEFAULT_ADMIN_PASSWORD;
    } catch (error) {
        console.error('[Firebase] Error getting admin password:', error);
        return DEFAULT_ADMIN_PASSWORD;
    }
};

export const saveAdminPassword = async (newPassword: string): Promise<void> => {
    try {
        await setDoc(adminAuthDoc, { password: newPassword });
        console.log('[Firebase] Admin password updated!');
    } catch (error) {
        console.error('[Firebase] Error saving admin password:', error);
        throw error;
    }
};

export const verifyAdminPassword = async (inputPassword: string): Promise<boolean> => {
    const storedPassword = await getAdminPassword();
    return inputPassword === storedPassword;
};

export const reduceStockForOrder = async (order: Order) => {
    try {
        const { getDoc, updateDoc, increment } = await import('firebase/firestore');

        for (const item of order.items) {
            const productRef = doc(productsCollection, item.id);
            const productSnap = await getDoc(productRef);

            if (productSnap.exists()) {
                const productData = productSnap.data() as Product;
                const quantityToReduce = item.quantity;
                const updates: any = {};

                if (productData.stock >= quantityToReduce) {
                    updates.stock = increment(-quantityToReduce);
                } else {
                    console.warn(`[Stock] Not enough total stock for ${item.name}. Available: ${productData.stock}, Required: ${quantityToReduce}`);
                    updates.stock = increment(-quantityToReduce);
                }

                const variantStock = productData.variantStock || {};
                const colorStock = productData.colorStock || {};
                
                if (item.selectedSize) {
                    const colorKey = item.selectedColor || 'Standard';
                    const variantKey = `${colorKey}_${item.selectedSize}`;
                    variantStock[variantKey] = Math.max(0, (variantStock[variantKey] || 0) - quantityToReduce);
                    updates.variantStock = variantStock;
                }

                if (item.selectedColor) {
                    colorStock[item.selectedColor] = Math.max(0, (colorStock[item.selectedColor] || 0) - quantityToReduce);
                    updates.colorStock = colorStock;
                }

                await updateDoc(productRef, updates);
                console.log(`[Stock] Reduced stock for ${item.name} by ${quantityToReduce}`);
            }
        }
        console.log('[Stock] Stock reduction complete for order:', order.id);
    } catch (error) {
        console.error('[Stock] Error reducing stock:', error);
        throw error;
    }
};

const reviewsCollection = collection(db, 'reviews');

export const addReview = async (review: Omit<Review, 'id' | 'status' | 'createdAt'>) => {
    try {
        const newReview: Review = {
            ...review,
            id: Date.now().toString(),
            status: 'pending',
            createdAt: Date.now(),
        };
        await setDoc(doc(reviewsCollection, newReview.id), newReview);
        console.log('[Firebase] Review added:', newReview.id);
    } catch (error) {
        console.error('[Firebase] Error adding review:', error);
        throw error;
    }
};

export const getProductReviews = async (productId: string) => {
    try {
        const q = query(reviewsCollection, where('productId', '==', productId), where('status', '==', 'approved'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => doc.data() as Review).sort((a, b) => b.createdAt - a.createdAt);
    } catch (error) {
        console.error('[Firebase] Error fetching product reviews:', error);
        return [];
    }
};

export const getAllReviews = async () => {
    try {
        const snapshot = await getDocs(reviewsCollection);
        return snapshot.docs.map(doc => doc.data() as Review).sort((a, b) => b.createdAt - a.createdAt);
    } catch (error) {
        console.error('[Firebase] Error fetching all reviews:', error);
        return [];
    }
};

export const getApprovedReviews = async () => {
    try {
        const q = query(reviewsCollection, where('status', '==', 'approved'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => doc.data() as Review).sort((a, b) => b.createdAt - a.createdAt);
    } catch (error) {
        console.error('[Firebase] Error fetching approved reviews:', error);
        return [];
    }
};

export const updateReviewStatus = async (reviewId: string, status: 'approved' | 'rejected') => {
    try {
        const reviewRef = doc(reviewsCollection, reviewId);
        await updateDoc(reviewRef, { status });
        console.log('[Firebase] Review status updated:', reviewId, status);
    } catch (error) {
        console.error('[Firebase] Error updating review status:', error);
        throw error;
    }
};

export const deleteReview = async (reviewId: string) => {
    try {
        await deleteDoc(doc(reviewsCollection, reviewId));
        console.log('[Firebase] Review deleted:', reviewId);
    } catch (error) {
        console.error('[Firebase] Error deleting review:', error);
        throw error;
    }
};

const giveawaysCollection = collection(db, 'giveaways');
const giveawayConfigDoc = doc(db, 'settings', 'giveaway');

export const checkGiveawayPhoneExists = async (phone: string): Promise<boolean> => {
  try {
    const q = query(giveawaysCollection, where('phone', '==', phone));
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (error) {
    console.error('[Firebase] Error checking phone:', error);
    throw error;
  }
};

export const saveGiveawayEntry = async (entry: import('./types').GiveawayEntry) => {
  try {
    await setDoc(doc(giveawaysCollection, entry.id), entry);
    console.log('[Firebase] Giveaway entry saved:', entry.id);
  } catch (error) {
    console.error('[Firebase] Error saving giveaway entry:', error);
    throw error;
  }
};

export const subscribeToGiveawayEntries = (callback: (entries: import('./types').GiveawayEntry[]) => void) => {
  return onSnapshot(
    giveawaysCollection,
    (snapshot) => {
      const entries = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as import('./types').GiveawayEntry));
      entries.sort((a, b) => b.createdAt - a.createdAt);
      console.log('[Firebase] Giveaway entries loaded:', entries.length);
      callback(entries);
    },
    (error) => {
      console.error('[Firebase] Error subscribing to giveaway entries:', error);
    }
  );
};

export const deleteGiveawayEntry = async (entryId: string) => {
  try {
    await deleteDoc(doc(giveawaysCollection, entryId));
    console.log('[Firebase] Giveaway entry deleted:', entryId);
  } catch (error) {
    console.error('[Firebase] Error deleting giveaway entry:', error);
    throw error;
  }
};

export const subscribeToGiveawayConfig = (callback: (enabled: boolean) => void) => {
  return onSnapshot(
    giveawayConfigDoc,
    (snapshot) => {
      const enabled = snapshot.exists() ? snapshot.data()?.enabled === true : false;
      console.log('[Firebase] Giveaway config loaded, enabled:', enabled);
      callback(enabled);
    },
    (error) => {
      console.error('[Firebase] Error subscribing to giveaway config:', error);
    }
  );
};

export const saveGiveawayConfig = async (enabled: boolean) => {
  try {
    await setDoc(giveawayConfigDoc, { enabled });
    console.log('[Firebase] Giveaway config saved, enabled:', enabled);
  } catch (error) {
    console.error('[Firebase] Error saving giveaway config:', error);
    throw error;
  }
};

const statsCollection = collection(db, 'stats');

const dayKey = (date: Date = new Date()) => date.toISOString().slice(0, 10);

export const recordPageView = async (): Promise<void> => {
    try {
        const viewDoc = doc(statsCollection, `views_${dayKey()}`);
        await setDoc(viewDoc, { views: increment(1), date: dayKey() }, { merge: true });
    } catch (error) {
        console.error('[Firebase] Error recording page view:', error);
    }
};

export const getViewsForLastDays = async (days: number): Promise<{ date: string; views: number }[]> => {
    try {
        const result: { date: string; views: number }[] = [];
        for (let i = days - 1; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const key = dayKey(d);
            const snapshot = await getDoc(doc(statsCollection, `views_${key}`));
            result.push({ date: key, views: snapshot.exists() ? (snapshot.data()?.views || 0) : 0 });
        }
        return result;
    } catch (error) {
        console.error('[Firebase] Error fetching view stats:', error);
        return [];
    }
};

export const subscribeToTodayViews = (callback: (views: number) => void) => {
    return onSnapshot(
        doc(statsCollection, `views_${dayKey()}`),
        (snapshot) => {
            callback(snapshot.exists() ? (snapshot.data()?.views || 0) : 0);
        },
        (error) => {
            console.error('[Firebase] Error subscribing to views:', error);
        }
    );
};
export const generateBarcodeValue = (): string => {
    const ts = Date.now().toString().slice(-7);
    const rnd = Math.floor(1000 + Math.random() * 9000).toString();
    const raw = `${ts}${rnd}`;
    return raw.padStart(12, '0').slice(-12);
};

export const getProductByBarcode = async (barcode: string): Promise<Product | null> => {
    try {
        const q1 = query(productsCollection, where('barcode', '==', barcode));
        const snap1 = await getDocs(q1);
        if (!snap1.empty) return { ...snap1.docs[0].data(), id: snap1.docs[0].id } as Product;
        const all = await getDocs(productsCollection);
        for (const d of all.docs) {
            const p = { ...d.data(), id: d.id } as Product;
            if (p.variantBarcode && Object.values(p.variantBarcode).includes(barcode)) return p;
            if (p.id === barcode) return p;
        }
        return null;
    } catch (error) {
        console.error('[Barcode] lookup failed:', error);
        return null;
    }
};

export const getVariantByBarcode = async (barcode: string): Promise<{ product: Product; variantKey: string | null } | null> => {
    const product = await getProductByBarcode(barcode);
    if (!product) return null;
    if (product.barcode === barcode) return { product, variantKey: null };
    if (product.variantBarcode) {
        for (const [k, v] of Object.entries(product.variantBarcode)) if (v === barcode) return { product, variantKey: k };
    }
    return { product, variantKey: null };
};

export { db };
