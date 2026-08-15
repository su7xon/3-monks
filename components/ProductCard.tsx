import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const getProductUrl = (name: string, id: string) => {
    return `/product/${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${id}`;
  };

  return (
    <Link
      to={getProductUrl(product.name, product.id)}
      className="group block relative"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-50 rounded-xl mb-4 group-hover:shadow-md transition-shadow">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          loading="lazy"
        />

        {}
        {product.isNew && !product.salePrice && (
          <div className="absolute top-3 left-3 bg-black text-white text-[9px] font-bold px-3 py-1 uppercase tracking-widest rounded-full z-10">
            New
          </div>
        )}
        {product.salePrice && (
          <div className="absolute top-3 right-3 bg-[#e60000] text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full z-10">
            Sale
          </div>
        )}
        
        {product.isTrending && (
          <div className={`absolute left-3 bg-orange-500 text-white text-[9px] font-bold px-3 py-1 uppercase tracking-widest rounded-full z-10 ${product.isNew ? 'top-10' : 'top-3'}`}>
            Trending
          </div>
        )}
      </div>

      {}
      <div className="flex flex-col">
        <h3 className="text-sm font-bold text-black tracking-wide uppercase line-clamp-1 mb-1 font-display">
          {product.name}
        </h3>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {product.salePrice ? (
              <>
                <span className="text-sm font-bold text-[#e60000]">
                  ₹{product.salePrice}
                </span>
                <span className="text-gray-400 line-through text-[11px]">
                  ₹{product.price}
                </span>
              </>
            ) : (
              <span className="text-sm font-bold text-black">
                ₹{product.price}
              </span>
            )}
          </div>
          
          {}
          {product.colors && product.colors.length > 0 && (
            <div className="flex items-center gap-1">
              {product.colors.slice(0, 3).map((color, idx) => (
                <div 
                  key={idx} 
                  className="w-2.5 h-2.5 rounded-full border border-gray-200" 
                  style={{ backgroundColor: color }}
                ></div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
