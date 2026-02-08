
import { Product } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'MONK OVERSIZED HOODIE',
    description: 'Heavyweight 450GSM cotton fleece with dropped shoulders and signature embroidered back piece.',
    price: 180,
    salePrice: 145,
    category: 'Unisex',
    images: [
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=1974&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=2070&auto=format&fit=crop'
    ],
    colors: ['Black', 'Onyx', 'Bone'],
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 25,
    isFeatured: true,
    isNew: true
  },
  {
    id: '2',
    name: 'SILK MONOLITH TEE',
    description: 'Ultra-soft pima cotton blend featuring a minimalist boxy fit and raw hem details.',
    price: 95,
    category: 'Men',
    images: [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1974&auto=format&fit=crop'
    ],
    colors: ['White', 'Sand'],
    sizes: ['M', 'L', 'XL'],
    stock: 50,
    isFeatured: true
  },
  {
    id: '3',
    name: 'CARGO ARCHITECT PANTS',
    description: 'Multi-pocket technical trousers with adjustable ankle straps and reinforced stitching.',
    price: 240,
    category: 'Unisex',
    images: [
      'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=1974&auto=format&fit=crop'
    ],
    colors: ['Olive', 'Midnight'],
    sizes: ['30', '32', '34'],
    stock: 12
  },
  {
    id: '4',
    name: 'ZENITH LEATHER TOTE',
    description: 'Italian pebble-grain leather with magnetic closure and internal tech sleeve.',
    price: 450,
    category: 'Accessories',
    images: [
      'https://images.unsplash.com/photo-1544816153-36bc1794309d?q=80&w=1974&auto=format&fit=crop'
    ],
    colors: ['Black'],
    sizes: ['One Size'],
    stock: 5
  }
];
