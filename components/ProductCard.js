import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import { FaShoppingBasket, FaInfoCircle } from 'react-icons/fa';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export default function ProductCard({ product, onAddToBasket }) {
  const [selectedSize, setSelectedSize] = useState(product?.sizes?.[0] || '');

  // Memoized handlers to prevent unnecessary re-renders
  const handleSizeChange = useCallback((event) => {
    setSelectedSize(event.target.value);
  }, []);

  const handleAddToBasket = useCallback(() => {
    if (!selectedSize) {
      alert('Please select a size before adding to the basket.');
      return;
    }
    // Include images when adding to the basket
    onAddToBasket({ ...product, size: selectedSize, images: product.images });
  }, [selectedSize, product, onAddToBasket]);

  // Fallback for missing product data
  if (!product) {
    return (
      <div className="w-full flex flex-col md:flex-row bg-white border-2 border-black p-6 gap-6">
        <p className="text-center text-gray-600">Product information is unavailable.</p>
      </div>
    );
  }

  const { name, price, originalPrice, stock, images, description, sizes } = product;

  return (
    <div className="w-full flex flex-col md:flex-row bg-white border-2 border-black p-6 gap-6 ">
      {/* Image Slider */}
      <div className="w-full md:w-[60%] relative group">
        <Swiper
          spaceBetween={10}
          slidesPerView={1}
          modules={[Navigation, Pagination]}
          navigation={{
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
          }}
          pagination={{ clickable: true }}
          className="w-full h-full"
        >
          {(images?.length > 0 ? images : ['https://via.placeholder.com/800']).map((image, index) => (
            <SwiperSlide key={index} className="relative">
              <Image
                src={image}
                alt={`${name || 'Product'} - Image ${index + 1}`}
                width={800}
                height={1000}
                loading="lazy"
                className="object-cover h-[500px] w-full"
              />
              {/* Image Counter */}
              <div className="absolute bottom-4 right-4 bg-black/80 text-white px-2 py-1 text-sm">
                {index + 1}/{images?.length || 1}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Custom Navigation Arrows */}
        <div
          className="swiper-button-next !text-black !right-2 after:!text-xl"
          aria-label="Next image"
        ></div>
        <div
          className="swiper-button-prev !text-black !left-2 after:!text-xl"
          aria-label="Previous image"
        ></div>
      </div>

      {/* Product Info */}
      <div className="w-full md:w-[40%] flex flex-col justify-center">
        <div className="mb-4">
          <h2 className="text-3xl font-extrabold uppercase text-black tracking-tight">
            {name || 'Product Name'}
          </h2>
        </div>

        <div className="flex items-center justify-between mb-4">
          <p className="text-2xl font-bold text-[#46c7c7]">
            {price?.toFixed(2)} TND
            {originalPrice && (
              <span className="ml-2 text-gray-400 line-through text-lg">
                {originalPrice.toFixed(2)} TND
              </span>
            )}
          </p>
          <span
            className={`px-3 py-1 text-xs font-black uppercase text-white ${
              stock > 0 ? 'bg-[#46c7c7]' : 'bg-red-500'
            }`}
          >
            {stock > 0 ? 'AVAILABLE' : 'SOLD OUT'}
          </span>
        </div>

        {/* Size Selector */}
        {sizes?.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="size" className="font-semibold text-gray-700">
                SELECT SIZE:
              </label>
              <button
                className="text-sm flex items-center gap-1 text-gray-500 hover:text-black focus:outline-none focus:underline"
                aria-label="Size guide"
              >
                <FaInfoCircle className="text-sm" />
                Size Guide
              </button>
            </div>
            <select
              id="size"
              value={selectedSize}
              onChange={handleSizeChange}
              className="w-full py-3 border-2 border-black focus:outline-none font-semibold bg-transparent px-3 appearance-none hover:border-gray-500 focus:border-[#46c7c7] transition-colors"
            >
              <option value="" disabled hidden>
                What is your size?
              </option>
              {sizes.map((size) => (
                <option key={size} value={size}>
                  {size.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Product Description */}
        <div className="text-gray-600 mb-6">
          <p className="line-clamp-3">
            {description || 'No description available.'}
          </p>
        </div>

        {/* Add to Basket Button */}
        <div className="grid grid-cols-1 gap-4">
          <button
            onClick={handleAddToBasket}
            disabled={stock === 0}
            className={`w-full py-4 border-2 border-black font-bold uppercase tracking-wide flex items-center justify-center transition-all ${
              stock === 0
                ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                : 'bg-black text-white hover:bg-white hover:text-black focus:bg-white focus:text-black focus:outline-none'
            }`}
            aria-label={stock === 0 ? 'Out of stock' : 'Add to basket'}
          >
            <FaShoppingBasket className="mr-2" />
            {stock === 0 ? 'Out of Stock' : 'Add to Basket'}
          </button>
        </div>

        {/* Additional Info */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="font-semibold">Delivery:</span>
              <span>Free shipping over 200 TND</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">Returns:</span>
              <span>30-day free returns</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}