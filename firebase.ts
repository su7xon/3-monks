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
    updateDoc
} from 'firebase/firestore';
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

console.log('[Firebase] Initialized with project:', firebaseConfig.projectId);

const CLOUDINARY_CLOUD_NAME = 'dwmokskbk';
const CLOUDINARY_UPLOAD_PRESET = 'ml_default';

export const uploadImageFromUrl = async (imageUrl: string): Promise<string> => {
    if (imageUrl.includes('cloudinary.com')) {
        return imageUrl;
    }

    try {
        console.log('[Cloudinary] Fetching image from URL...');

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
        console.error('[Cloudinary] Migration failed:', msg);
    }
};

export const migrateImage = async (oldUrl: string): Promise<string> => {
    // Only migrate if it's from the OLD Cloudinary account
    if (!oldUrl.includes('res.cloudinary.com/dnn0km7fu')) {
        return oldUrl;
    }

    try {
        console.log('[Migration] Migrating image:', oldUrl);

        // DIRECT UPLOAD via Cloudinary (they handle the fetch)
        // This avoids CORS issues in the browser
        const formData = new FormData();
        formData.append('file', oldUrl);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
            {
                method: 'POST',
                body: formData
            }
        );

        const data = await response.json();

        if (data.secure_url) {
            const optimizedUrl = data.secure_url.replace('/upload/', '/upload/q_auto,f_auto,w_1200/');
            console.log('[Migration] Success:', optimizedUrl);
            return optimizedUrl;
        } else {
            const errorMsg = data.error?.message || 'Unknown Cloudinary error';
            throw new Error(errorMsg);
        }

    } catch (error: any) {
        console.error('[Migration] Failed for:', oldUrl, error);
        throw error; // Re-throw to be caught by UI
    }
};

export const uploadImage = async (base64Data: string, _path?: string): Promise<string> => {
    if (!base64Data.startsWith('data:image')) {
        return base64Data;
    }

    try {
        console.log('[Cloudinary] Uploading image...');

        const formData = new FormData();
        formData.append('file', base64Data);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
            {
                method: 'POST',
                body: formData
            }
        );

        const data = await response.json();

        if (data.secure_url) {
            const optimizedUrl = data.secure_url.replace('/upload/', '/upload/q_auto,f_auto,w_1200/');
            console.log('[Cloudinary] Upload success:', optimizedUrl);
            return optimizedUrl;
        } else {
            throw new Error(data.error?.message || 'Upload failed');
        }
    } catch (error: any) {
        console.error('[Cloudinary] Upload failed:', error?.message || error);
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

export const getCloudinaryPublicId = (url: string): string | null => {
    if (!url || !url.includes('cloudinary.com')) return null;
    // Extract public_id from URL: .../upload/v12345/folder/id.jpg -> folder/id
    const parts = url.split('/upload/');
    if (parts.length < 2) return null;

    // Remove version (v12345) and extension (.jpg)
    const path = parts[1].split('/').slice(1).join('/'); // Skip everything before the first actual path part after /upload/
    const pathWithoutExtension = path.split('.')[0];

    // If there's a version number like v1234567, we need to handle it.
    // Actually, Cloudinary URLs usually look like: /upload/v1234/public_id.jpg
    // Let's try a more robust approach:
    const regex = /\/upload\/(?:v\d+\/)?(.+?)\.[a-z]+$/;
    const match = url.match(regex);
    return match ? match[1] : null;
};

export const deleteCloudinaryImage = async (url: string) => {
    const publicId = getCloudinaryPublicId(url);
    if (!publicId) return;

    try {
        console.log('[Cloudinary] Triggering deletion for:', publicId);
        const response = await fetch('/.netlify/functions/delete-image', {
            method: 'POST',
            body: JSON.stringify({ public_id: publicId }),
            headers: { 'Content-Type': 'application/json' }
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to delete image');
        console.log('[Cloudinary] Successfully deleted:', publicId);
    } catch (error) {
        console.error('[Cloudinary] Deletion error:', error);
    }
};

export const productsCollection = collection(db, 'products');
export const ordersCollection = collection(db, 'orders');
export const categoriesCollection = collection(db, 'categories');

export const siteConfigDoc = doc(db, 'config', 'siteConfig');

const removeUndefined = (obj: any): any => {
    const cleaned: any = {};
    for (const key in obj) {
        if (obj[key] !== undefined) {
            cleaned[key] = obj[key];
        }
    }
    return cleaned;
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
        await setDoc(doc(ordersCollection, order.id), order);
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

export const subscribeToProducts = (callback: (products: Product[]) => void) => {
    return onSnapshot(
        productsCollection,
        (snapshot) => {
            const products = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Product));

            products.sort((a, b) => {

                const getTimestamp = (id: string) => {
                    const match = id.match(/prod_(\d+)/);
                    return match ? parseInt(match[1], 10) : 0;
                };
                const timeA = getTimestamp(a.id);
                const timeB = getTimestamp(b.id);

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
const DEFAULT_ADMIN_PASSWORD = 'monks.001';

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

                if (item.selectedSize) {
                    const colorKey = item.selectedColor || 'Standard';
                    const variantKey = `${colorKey}_${item.selectedSize}`;
                    updates[`variantStock.${variantKey}`] = increment(-quantityToReduce);
                }

                if (item.selectedColor) {
                    updates[`colorStock.${item.selectedColor}`] = increment(-quantityToReduce);
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

export { db };
