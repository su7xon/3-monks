
import React, { useState, useEffect } from 'react';
import { useShop } from '../../store';
import { OrderStatus, Product, Category, CategoryWithImage, SiteConfig } from '../../types';
import { useToast } from '../../components/Toast';

const ConfirmDialog: React.FC<{
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl">
        <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 text-sm font-semibold rounded-lg">
            Cancel
          </button>
          <button onClick={onConfirm} className="flex-1 px-4 py-3 bg-red-500 text-white text-sm font-semibold rounded-lg">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

interface ProductModalProps {
  product: Partial<Product> | null;
  isOpen: boolean;
  isNew: boolean;
  onClose: () => void;
  onSave: (product: Product) => Promise<void>;
  categories: CategoryWithImage[];
}

const EMPTY_FORM: Partial<Product> = {
  name: '',
  description: '',
  price: 0,
  category: 'Men',
  images: [],
  colors: [],
  sizes: [],
  stock: 0,
  isNew: true,
  isFeatured: false
};

const ProductModal: React.FC<ProductModalProps> = ({ product, isOpen, isNew, onClose, onSave, categories }) => {
  const [formData, setFormData] = useState<Partial<Product>>(EMPTY_FORM);
  const [newColor, setNewColor] = useState('');
  const [newColorStock, setNewColorStock] = useState('');
  const [newSize, setNewSize] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (isOpen) {
      if (isNew) {

        setFormData({ ...EMPTY_FORM, colorStock: {} }); // Initialize colorStock
        setNewColor('');
        setNewColorStock('');
        setNewSize('');
      } else if (product) {

        setFormData({ ...product, colorStock: product.colorStock || {}, variantStock: product.variantStock || {} });
        setNewColor('');
        setNewColorStock('');
        setNewSize('');
      }
    }
  }, [isOpen, isNew, product]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name?.trim()) {
      showToast('Please enter a product name', 'error');
      return;
    }

    setIsSaving(true);
    const newProduct: Product = {
      id: isNew ? `prod_${Date.now()}` : (product?.id || ''),
      name: formData.name || '',
      description: formData.description || '',
      price: formData.price || 0,
      category: formData.category || 'Men',
      images: formData.images || [],
      colors: formData.colors || [],
      colorStock: formData.colorStock || {},
      variantStock: formData.variantStock || {},
      sizes: formData.sizes || [],
      stock: formData.stock || 0,
      isNew: formData.isNew || false,
      isFeatured: formData.isFeatured || false,
      isTrending: formData.isTrending || false,
      createdAt: isNew ? Date.now() : (product?.createdAt || Date.now()),
    };

    if (formData.salePrice && formData.salePrice > 0) {
      newProduct.salePrice = formData.salePrice;
    }

    try {
      await onSave(newProduct);
      onClose();
    } catch (error) {

    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          setFormData(prev => ({ ...prev, images: [...(prev.images || []), base64] }));
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleRemoveImage = (idx: number) => {
    setFormData(prev => ({ ...prev, images: prev.images?.filter((_, i) => i !== idx) }));
  };

  const handleAddColor = () => {
    if (newColor.trim() && !formData.colors?.includes(newColor.trim())) {
      const colorName = newColor.trim();
      setFormData(prev => ({ ...prev, colors: [...(prev.colors || []), colorName] }));
      setNewColor('');
    }
  };

  const handleRemoveColor = (color: string) => {
    setFormData(prev => {
      const newColorStock = { ...(prev.colorStock || {}) };
      delete newColorStock[color];

      const totalStock = Object.values(newColorStock).reduce((a: number, b: number) => a + b, 0);

      return {
        ...prev,
        colors: prev.colors?.filter(c => c !== color),
        colorStock: newColorStock,
        stock: totalStock
      };
    });
  };

  const handleAddSize = () => {
    if (newSize.trim() && !formData.sizes?.includes(newSize.trim())) {
      setFormData(prev => ({ ...prev, sizes: [...(prev.sizes || []), newSize.trim()] }));
      setNewSize('');
    }
  };

  const handleRemoveSize = (size: string) => {
    setFormData(prev => ({ ...prev, sizes: prev.sizes?.filter(s => s !== size) }));
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end md:items-center justify-center">
      <div className="bg-white w-full md:rounded-xl md:max-w-lg max-h-[90vh] overflow-y-auto">
        {}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h2 className="text-lg font-bold text-gray-900">
            {isNew ? 'Add New Product' : 'Edit Product'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors" aria-label="Close">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-5">
          {}
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-2 block">Product Images</label>
            <div className="flex gap-2 flex-wrap mb-3">
              {formData.images?.map((img, idx) => (
                <div key={idx} className="relative">
                  <img src={img} className="w-16 h-16 object-cover rounded-lg border" alt="" />
                  <button type="button" onClick={() => handleRemoveImage(idx)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">×</button>
                </div>
              ))}
            </div>
            <label className="flex items-center justify-center gap-2 w-full bg-gray-900 text-white px-4 py-3 text-sm font-semibold rounded-lg cursor-pointer active:scale-[0.98] transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>
              Upload Images
              <input type="file" accept="image}
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-2 block">Product Name *</label>
            <input type="text" value={formData.name || ''} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} className="w-full border border-gray-200 px-4 py-3 text-base rounded-lg outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900" placeholder="Enter product name" required />
          </div>

          {}
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-2 block">Description</label>
            <textarea value={formData.description || ''} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} rows={3} placeholder="Material, fit, style..." className="w-full border border-gray-200 px-4 py-3 text-base rounded-lg outline-none focus:border-gray-900 resize-none" />
          </div>

          {}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-2 block">Category</label>
              <select value={formData.category || 'Men'} onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as Category }))} className="w-full border border-gray-200 px-4 py-3 text-base rounded-lg outline-none focus:border-gray-900 bg-white">
                {categories.map(cat => <option key={cat.name} value={cat.name}>{cat.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-2 block">Price (₹)</label>
              <input type="number" value={formData.price || ''} onChange={(e) => setFormData(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))} className="w-full border border-gray-200 px-4 py-3 text-base rounded-lg outline-none focus:border-gray-900" placeholder="0" />
            </div>
          </div>

          {}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-2 block">Stock</label>
              <input type="number" value={formData.stock || ''} onChange={(e) => setFormData(prev => ({ ...prev, stock: parseInt(e.target.value) || 0 }))} className="w-full border border-gray-200 px-4 py-3 text-base rounded-lg outline-none focus:border-gray-900" placeholder="0" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-2 block">Sale Price</label>
              <input type="number" value={formData.salePrice || ''} onChange={(e) => setFormData(prev => ({ ...prev, salePrice: parseInt(e.target.value) || undefined }))} placeholder="Optional" className="w-full border border-gray-200 px-4 py-3 text-base rounded-lg outline-none focus:border-gray-900" />
            </div>
          </div>

          {}
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-2 block">Colors & Stock</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.colors?.map((color, idx) => (
                <span key={idx} className="inline-flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full text-sm font-medium border border-gray-200">
                  <span className="w-3 h-3 rounded-full bg-gray-900"></span>
                  {color}
                  <span className="text-xs text-gray-500 ml-1">
                    ({formData.colorStock?.[color] || 0} in stock)
                  </span>
                  <button type="button" onClick={() => handleRemoveColor(color)} className="ml-1 text-gray-400 hover:text-red-500 transition-colors">×</button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <div className="flex-1 grid grid-cols-1 gap-2">
                <input
                  type="text"
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddColor())}
                  placeholder="Color Name (e.g. Black)"
                  className="w-full border border-gray-200 px-4 py-2.5 text-base rounded-lg outline-none focus:border-gray-900"
                />
              </div>
              <button type="button" onClick={handleAddColor} className="px-6 py-2.5 bg-gray-900 text-white hover:bg-gray-800 rounded-lg text-sm font-semibold transition-colors">
                Add Color
              </button>
            </div>
            <p className="text-[10px] text-gray-400 mt-2">Add colors here. Then set stock for each variant below.</p>
          </div>

          {}
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-2 block">Sizes</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.sizes?.map((size, idx) => (
                <span key={idx} className="inline-flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-md text-sm font-bold border border-gray-200">
                  {size}
                  <button type="button" onClick={() => handleRemoveSize(size)} className="ml-1 text-gray-400 hover:text-red-500 transition-colors">×</button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newSize}
                onChange={(e) => setNewSize(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSize())}
                placeholder="Size (e.g. XL, 42, Free Size)"
                className="flex-1 border border-gray-200 px-4 py-2.5 text-base rounded-lg outline-none focus:border-gray-900"
              />
              <button type="button" onClick={handleAddSize} className="px-6 py-2.5 bg-gray-900 text-white hover:bg-gray-800 rounded-lg text-sm font-semibold transition-colors">
                Add Size
              </button>
            </div>
          </div>

          {}
          {(formData.colors && formData.colors.length > 0 && formData.sizes && formData.sizes.length > 0) && (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <label className="text-xs font-semibold text-gray-900 mb-3 block">Stock Matrix (Variant Management)</label>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {formData.colors.map(color => (
                  formData.sizes?.map(size => {
                    const variantKey = `${color}_${size}`;
                    return (
                      <div key={variantKey} className="flex items-center justify-between text-sm bg-white p-2 rounded border border-gray-100">
                        <span className="font-medium text-gray-700">{color} - {size}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400">Qty:</span>
                          <input
                            type="number"
                            min="0"
                            value={formData.variantStock?.[variantKey] || 0}
                            onChange={(e) => {
                              const qty = parseInt(e.target.value) || 0;
                              setFormData(prev => {
                                const newVariantStock = { ...(prev.variantStock || {}), [variantKey]: qty };

                                const totalStock = Object.values(newVariantStock).reduce((a: number, b: number) => a + b, 0);
                                return { ...prev, variantStock: newVariantStock, stock: totalStock };
                              });
                            }}
                            className="w-20 border border-gray-200 px-2 py-1 rounded outline-none focus:border-gray-900"
                          />
                        </div>
                      </div>
                    );
                  })
                ))}
              </div>
              <div className="mt-2 text-right text-xs text-gray-500">
                Total Stock: <span className="font-bold text-gray-900">{formData.stock}</span>
              </div>
            </div>
          )}

          {}
          {(!formData.colors?.length || !formData.sizes?.length) && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-2 block">Total Stock</label>
                <input type="number" value={formData.stock || ''} onChange={(e) => setFormData(prev => ({ ...prev, stock: parseInt(e.target.value) || 0 }))} className="w-full border border-gray-200 px-4 py-3 text-base rounded-lg outline-none focus:border-gray-900" placeholder="0" />
              </div>
              {}
              {formData.colors && formData.colors.length > 0 && (
                <div className="col-span-2">
                  <p className="text-[10px] text-orange-500">To enable advanced stock tracking, please add at least one size.</p>
                </div>
              )}
            </div>
          )}

          {}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-gray-500 block">Product Tags</label>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={formData.isNew || false} onChange={(e) => setFormData(prev => ({ ...prev, isNew: e.target.checked }))} className="w-5 h-5 accent-gray-900 rounded" />
                <span className="text-sm font-medium">New Arrival</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={formData.isFeatured || false} onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))} className="w-5 h-5 accent-gray-900 rounded" />
                <span className="text-sm font-medium">Featured</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={formData.isTrending || false} onChange={(e) => setFormData(prev => ({ ...prev, isTrending: e.target.checked }))} className="w-5 h-5 accent-orange-500 rounded" />
                <span className="text-sm font-medium">🔥 Trending</span>
              </label>
            </div>
          </div>

          {}
          <div className="pt-4 border-t border-gray-100">
            <button type="submit" disabled={isSaving} className="w-full px-4 py-4 bg-green-600 text-white text-sm font-bold rounded-lg active:scale-[0.98] transition-transform flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
              {isSaving ? (
                <>
                  <svg className="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  {isNew ? 'Save Product' : 'Save Changes'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AdminDashboard: React.FC = () => {
  const {
    products,
    orders,
    siteConfig,
    setSiteConfig,
    categories,
    setCategories,
    saveAllCategories,
    addProduct,
    updateProduct,
    removeProduct,
    updateOrderStatus,
    deleteOrder,
    productTypes,
    setProductTypes,
    saveProductTypes,
  } = useShop();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'orders' | 'config'>('products');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [configForm, setConfigForm] = useState<SiteConfig>(siteConfig);

  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; type: string; id: string; name: string }>({ isOpen: false, type: '', id: '', name: '' });

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [passwordForm, setPasswordForm] = useState({ oldPass: '', newPass: '', confirmPass: '' });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => { setConfigForm(siteConfig); }, [siteConfig]);

  const handleLogin = async () => {
    if (!loginPassword.trim()) {
      setLoginError('Please enter password');
      return;
    }
    setIsLoggingIn(true);
    setLoginError('');
    try {
      const { verifyAdminPassword } = await import('../../firebase');
      const isValid = await verifyAdminPassword(loginPassword);
      if (isValid) {
        setIsAuthenticated(true);
        sessionStorage.setItem('adminAuth', 'true');
      } else {
        setLoginError('Incorrect password');
      }
    } catch (error) {
      setLoginError('Error verifying password');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordForm.oldPass || !passwordForm.newPass || !passwordForm.confirmPass) {
      showToast('Please fill all password fields', 'error');
      return;
    }
    if (passwordForm.newPass !== passwordForm.confirmPass) {
      showToast('New passwords do not match', 'error');
      return;
    }
    if (passwordForm.newPass.length < 4) {
      showToast('Password must be at least 4 characters', 'error');
      return;
    }
    setIsChangingPassword(true);
    try {
      const { verifyAdminPassword, saveAdminPassword } = await import('../../firebase');
      const isOldValid = await verifyAdminPassword(passwordForm.oldPass);
      if (!isOldValid) {
        showToast('Old password is incorrect', 'error');
        return;
      }
      await saveAdminPassword(passwordForm.newPass);
      showToast('Password changed successfully!', 'success');
      setPasswordForm({ oldPass: '', newPass: '', confirmPass: '' });
    } catch (error) {
      showToast('Error changing password', 'error');
    } finally {
      setIsChangingPassword(false);
    }
  };

  useEffect(() => {
    if (sessionStorage.getItem('adminAuth') === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="pt-20 pb-10 bg-gray-50 min-h-screen flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-8 shadow-lg max-w-sm w-full">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Login</h1>
            <p className="text-sm text-gray-500">Enter password to access the dashboard</p>
          </div>
          <div className="space-y-4">
            <div>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                placeholder="Enter password"
                className="w-full border border-gray-200 px-4 py-3 text-base rounded-lg outline-none focus:border-gray-900"
              />
              {loginError && <p className="text-red-500 text-sm mt-2">{loginError}</p>}
            </div>
            <button
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="w-full bg-gray-900 text-white py-3 text-sm font-bold rounded-lg disabled:opacity-50"
            >
              {isLoggingIn ? 'Verifying...' : 'Login'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleDeleteProduct = (product: Product) => {
    setDeleteConfirm({ isOpen: true, type: 'product', id: product.id, name: product.name });
  };

  const confirmDelete = async () => {
    if (deleteConfirm.type === 'product') {
      removeProduct(deleteConfirm.id);
      showToast('Product deleted', 'success');
    } else if (deleteConfirm.type === 'category') {
      try {

        const indexToDelete = parseInt(deleteConfirm.id);
        const filteredCategories = categories.filter((_, i) => i !== indexToDelete);

        const { saveCategory } = await import('../../firebase');
        for (let i = 0; i < filteredCategories.length; i++) {
          const cat = filteredCategories[i];
          await saveCategory({ name: cat.name, image: cat.image }, `cat_${i}`);
        }

        const { deleteCategory: deleteCat } = await import('../../firebase');
        for (let i = filteredCategories.length; i < categories.length; i++) {
          await deleteCat(`cat_${i}`);
        }

        setCategories(filteredCategories);
        showToast('Category deleted', 'success');
      } catch (error) {
        console.error('Error deleting category:', error);
        showToast('Error deleting category', 'error');
      }
    } else if (deleteConfirm.type === 'order') {
      try {
        await deleteOrder(deleteConfirm.id);
        showToast('Order deleted successfully', 'success');
      } catch (error) {
        console.error('Error deleting order:', error);
        showToast('Error deleting order', 'error');
      }
    }
    setDeleteConfirm({ isOpen: false, type: '', id: '', name: '' });
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsAddingProduct(false);
    setIsProductModalOpen(true);
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setIsAddingProduct(true);
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (product: Product) => {
    try {
      if (isAddingProduct) {
        await addProduct(product);
        showToast('Product added successfully!', 'success');
      } else {
        await updateProduct(product);
        showToast('Product updated successfully!', 'success');
      }
    } catch (error: any) {
      console.error('Error saving product:', error);
      const errorMsg = error?.message || 'Images may be too large';
      showToast(`Error: ${errorMsg}`, 'error');
    }
  };

  const handleUpdateCategoryImage = (index: number, newImage: string) => {
    setCategories(prev => prev.map((cat, i) => i === index ? { ...cat, image: newImage } : cat));
    showToast('Image updated', 'success');
  };

  const handleUpdateCategoryName = (index: number, newName: string) => {
    setCategories(prev => prev.map((cat, i) => i === index ? { ...cat, name: newName } : cat));
  };

  const handleAddCategory = () => {
    setCategories(prev => [...prev, { name: 'New Category', image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=800' }]);
    showToast('Category added', 'success');
  };

  const handleDeleteCategory = (index: number, name: string) => {
    setDeleteConfirm({ isOpen: true, type: 'category', id: index.toString(), name });
  };

  const handleSaveCategories = async () => {
    try {
      showToast('Saving categories...', 'info');
      await saveAllCategories();
      showToast('Categories saved!', 'success');
    } catch (error: any) {
      console.error('Error saving categories:', error);
      showToast(`Error: ${error?.message || 'Images may be too large'}`, 'error');
    }
  };

  const handleSaveConfig = () => {
    setSiteConfig(configForm);
    showToast('Settings saved!', 'success');
  };

  const stats = [
    { label: 'Products', value: products.length, icon: '📦' },
    { label: 'In Stock', value: products.filter(p => p.stock > 0).length, icon: '✓' },
    { label: 'Categories', value: categories.length, icon: '🏷️' },
    { label: 'Orders', value: orders.length, icon: '🛒' },
  ];

  const tabs = [
    { id: 'products' as const, label: 'Products', icon: '📦' },
    { id: 'categories' as const, label: 'Categories', icon: '🏷️' },
    { id: 'orders' as const, label: 'Orders', icon: '📋' },
    { id: 'config' as const, label: 'Settings', icon: '⚙️' },
  ];

  return (
    <div className="pt-16 pb-24 md:pb-12 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4">
        {}
        <div className="py-6">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your store</p>
        </div>

        {}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-gray-500">{stat.label}</p>
                <span className="text-lg">{stat.icon}</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
            </div>
          ))}
        </div>

        {}
        <div className="hidden md:flex bg-white rounded-xl p-1.5 shadow-sm border border-gray-100 mb-6">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 px-4 py-2.5 text-sm font-semibold rounded-lg transition-all ${activeTab === tab.id ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-900'}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {}
        {activeTab === 'products' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-900">Products ({products.length})</h2>
              <button onClick={handleAddProduct} className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2.5 text-sm font-semibold rounded-lg active:scale-[0.98] transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                Add
              </button>
            </div>

            <div className="divide-y divide-gray-100">
              {products.map(product => (
                <div key={product.id} className="p-4 flex gap-4">
                  <img src={product.images[0] || 'https://via.placeholder.com/80'} className="w-16 h-20 object-cover rounded-lg bg-gray-100 flex-shrink-0" alt="" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm truncate">{product.name}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">{product.category}</p>
                      </div>
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full flex-shrink-0 ${product.stock > 10 ? 'bg-green-50 text-green-600' : product.stock > 0 ? 'bg-orange-50 text-orange-600' : 'bg-red-50 text-red-600'}`}>
                        {product.stock} left
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-lg font-bold text-gray-900">₹{product.price}</p>
                      <div className="flex gap-2">
                        <button onClick={() => handleEditProduct(product)} className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg">Edit</button>
                        <button onClick={() => handleDeleteProduct(product)} className="px-3 py-1.5 bg-red-50 text-red-600 text-xs font-semibold rounded-lg">Delete</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {products.length === 0 && (
                <div className="p-12 text-center text-gray-400">No products yet. Add your first product!</div>
              )}
            </div>
          </div>
        )}

        {}
        {activeTab === 'categories' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-900">Categories ({categories.length})</h2>
              <p className="text-xs text-gray-500 mt-1">These appear on the homepage</p>
            </div>

            <div className="p-4 space-y-4">
              {categories.map((cat, index) => (
                <div key={index} className="flex gap-4 p-3 bg-gray-50 rounded-xl">
                  <img src={cat.image} className="w-20 h-24 object-cover rounded-lg flex-shrink-0" alt="" />
                  <div className="flex-1 space-y-2">
                    <input type="text" value={cat.name} onChange={(e) => handleUpdateCategoryName(index, e.target.value)} className="w-full border border-gray-200 px-3 py-2 text-sm font-medium rounded-lg outline-none focus:border-gray-900" placeholder="Category Name" />
                    <div className="flex gap-2">
                      <label className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-600 px-3 py-2 text-xs font-semibold rounded-lg cursor-pointer">
                        📷 Change
                        <input type="file" accept="image}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h2 className="text-base font-bold text-gray-900">Orders ({orders.length})</h2>
              </div>

              {orders.length === 0 ? (
                <div className="p-12 text-center text-gray-400">No orders yet</div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {orders.map(order => (
                    <div key={order.id} className="p-4">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{order.id}</p>
                          <p className="text-xs text-gray-500">{new Date(order.date).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">₹{order.total}</p>
                          <select value={order.status} onChange={(e) => { updateOrderStatus(order.id, e.target.value as OrderStatus); showToast('Order status updated', 'success'); }} className="mt-1 text-xs bg-gray-100 border-0 rounded-lg px-2 py-1 font-semibold outline-none">
                            {Object.values(OrderStatus).map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                          <button
                            onClick={() => setDeleteConfirm({ isOpen: true, type: 'order', id: order.id, name: order.id })}
                            className="ml-2 text-xs text-red-500 hover:text-red-700 underline"
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-3 mb-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-semibold text-gray-500 mb-2">Customer Details</p>
                          <p className="text-sm font-medium text-gray-900">{order.customer.name}</p>
                          <p className="text-xs text-gray-600">{order.customer.email}</p>
                          <p className="text-xs text-gray-600">{order.customer.phone}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-500 mb-2">Shipping Address</p>
                          <p className="text-xs text-gray-600">{order.customer.address}</p>
                          <p className="text-xs text-gray-600">Pincode: {order.customer.pincode}</p>
                          <div className="mt-2">
                            <span className="text-xs font-semibold text-gray-500">Payment: </span>
                            <span className="text-xs font-bold text-gray-900 uppercase">{order.paymentMethod || 'N/A'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span className="text-gray-600">{item.name} | Size: {item.selectedSize} | Color: {item.selectedColor} × {item.quantity}</span>
                            <span className="font-medium text-gray-900">₹{(item.salePrice || item.price) * item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {}
        {activeTab === 'config' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-900">Site Settings</h2>
              <p className="text-xs text-gray-500 mt-1">Configure your store</p>
            </div>

            <div className="p-4 space-y-6">
              {}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">Hero Section</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Hero Background Image</label>
                    <div className="flex items-center gap-4">
                      <div className="w-24 h-16 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                        {configForm.heroBannerImage ? (
                          <img src={configForm.heroBannerImage} alt="Hero" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No Image</div>
                        )}
                      </div>
                      <label className="cursor-pointer bg-white border border-gray-200 text-gray-700 px-4 py-2 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors">
                        Upload Image
                        <input
                          type="file"
                          accept="image}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">Contact Information</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Phone</label>
                    <input type="text" value={configForm.contactPhone} onChange={(e) => setConfigForm(prev => ({ ...prev, contactPhone: e.target.value }))} className="w-full border border-gray-200 px-4 py-3 text-base rounded-lg outline-none focus:border-gray-900" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Email</label>
                    <input type="text" value={configForm.contactEmail} onChange={(e) => setConfigForm(prev => ({ ...prev, contactEmail: e.target.value }))} className="w-full border border-gray-200 px-4 py-3 text-base rounded-lg outline-none focus:border-gray-900" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Address</label>
                    <input type="text" value={configForm.contactAddress} onChange={(e) => setConfigForm(prev => ({ ...prev, contactAddress: e.target.value }))} className="w-full border border-gray-200 px-4 py-3 text-base rounded-lg outline-none focus:border-gray-900" />
                  </div>
                </div>
              </div>

              {}
              <div className="border-t pt-6">
                <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">Change Admin Password</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Old Password</label>
                    <input
                      type="password"
                      value={passwordForm.oldPass}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, oldPass: e.target.value }))}
                      placeholder="Enter current password"
                      className="w-full border border-gray-200 px-4 py-3 text-base rounded-lg outline-none focus:border-gray-900"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">New Password</label>
                    <input
                      type="password"
                      value={passwordForm.newPass}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, newPass: e.target.value }))}
                      placeholder="Enter new password"
                      className="w-full border border-gray-200 px-4 py-3 text-base rounded-lg outline-none focus:border-gray-900"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Confirm New Password</label>
                    <input
                      type="password"
                      value={passwordForm.confirmPass}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPass: e.target.value }))}
                      placeholder="Retype new password"
                      className="w-full border border-gray-200 px-4 py-3 text-base rounded-lg outline-none focus:border-gray-900"
                    />
                  </div>
                  <button
                    onClick={handleChangePassword}
                    disabled={isChangingPassword}
                    className="w-full bg-gray-800 text-white py-3 text-sm font-bold rounded-lg disabled:opacity-50"
                  >
                    {isChangingPassword ? 'Changing...' : 'Change Password'}
                  </button>
                </div>
              </div>

              <button onClick={handleSaveConfig} className="w-full bg-green-600 text-white px-6 py-4 text-sm font-bold rounded-lg active:scale-[0.98] transition-transform flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                Save Settings
              </button>
            </div>
          </div>
        )}
      </div>

      {}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-2 z-40">
        <div className="flex justify-around">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${activeTab === tab.id ? 'bg-gray-900 text-white' : 'text-gray-500'}`}>
              <span className="text-lg">{tab.icon}</span>
              <span className="text-[10px] font-semibold">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title={`Delete ${deleteConfirm.type}?`}
        message={`Are you sure you want to delete "${deleteConfirm.name}"? This action cannot be undone.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm({ isOpen: false, type: '', id: '', name: '' })}
      />

      {}
      <ProductModal
        product={editingProduct}
        isOpen={isProductModalOpen}
        isNew={isAddingProduct}
        onClose={() => { setIsProductModalOpen(false); setEditingProduct(null); }}
        onSave={handleSaveProduct}
        categories={categories}
      />
    </div>
  );
};

export default AdminDashboard;
