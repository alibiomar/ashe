import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import { FaShoppingBasket, FaInfoCircle, FaTimes } from 'react-icons/fa';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Zoom } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/zoom';

export default function ProductCard({ product, onAddToBasket, getItemQuantity }) {
  const [selectedSize, setSelectedSize] = useState('');
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const handleSizeChange = useCallback((event) => {
    setSelectedSize(event.target.value);
    setError('');
  }, []);

  const openModal = (index) => {
    setSelectedImageIndex(index);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setIsModalOpen(false);
    document.body.style.overflow = 'unset';
  };

  const handleAddToBasket = useCallback(() => {
    if (!selectedSize) {
      setError('Please select a size before adding to the basket.');
      return;
    }

    const selectedSizeStock = product.stock?.[selectedSize] || 0;
    const currentBasketQty = getItemQuantity(product.id, selectedSize) || 0;
    const availableForUser = selectedSizeStock - currentBasketQty;

    if (availableForUser <= 0) {
      setError('You cannot add more than the available stock.');
      return;
    }

    setError('');
    onAddToBasket({ ...product, size: selectedSize, images: product.images });
  }, [selectedSize, product, getItemQuantity, onAddToBasket]);

  if (!product) {
    return (
      <div className="w-full flex flex-col md:flex-row bg-white border-2 border-black p-6 gap-6">
        <p className="text-center text-gray-600">Product information is unavailable.</p>
      </div>
    );
  }

  const { name, price, originalPrice, stock, images, description, sizes } = product;
  const selectedSizeStock = stock?.[selectedSize] || 0;
  const currentBasketQty = selectedSize ? getItemQuantity(product.id, selectedSize) : 0;
  const availableForUser = selectedSizeStock - currentBasketQty;

  // Check if all sizes are out of stock
  const allSizesOutOfStock = sizes?.every((size) => (stock?.[size] || 0) === 0);

  return (
    <div className="w-full flex flex-col items-center justify-around md:flex-row bg-white p-6 gap-6 md:gap-22">
      {/* Image Slider */}
      <div className="w-full md:w-[35%] relative group">
        <Swiper
          spaceBetween={10}
          slidesPerView={1}
          modules={[Navigation, Pagination]}
          navigation
          pagination={{ clickable: true }}
          lazy={{ loadPrevNext: true }}
          className="w-full h-full"
        >
          {images?.map((image, index) => (
            <SwiperSlide key={`image-${index}`}>
              <Image
                src={image}
                alt={`${name} - Image ${index + 1}`}
                width={800}
                height={1000}
                priority={index === 0}
                className="object-cover h-full w-full cursor-zoom-in transition-transform duration-300"
                onClick={() => openModal(index)}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Product Info */}
      <div className="w-full md:w-[40%] flex flex-col justify-center">
        <h2 className="text-3xl font-extrabold uppercase text-black tracking-tight mb-4">
          {name || 'Product Name'}
        </h2>

        <div className="flex items-center justify-between mb-4">
          <p className="text-2xl font-bold text-[#46c7c7]">
            {price?.toFixed(2)} TND
            {originalPrice && (
              <span className="ml-2 text-gray-400 line-through text-lg">
                {originalPrice.toFixed(2)} TND
              </span>
            )}
          </p>
          {selectedSize && (
            <span
              className={`px-3 py-1 text-xs font-black uppercase text-white ${
                selectedSizeStock > 0 ? 'bg-[#46c7c7]' : 'bg-red-500'
              }`}
            >
              {selectedSizeStock > 0 ? 'AVAILABLE' : 'SOLD OUT'}
            </span>
          )}
        </div>

        {/* Size Selector */}
        {sizes?.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="size" className="font-semibold text-gray-700">
                SELECT SIZE:
              </label>
              <button className="text-sm flex items-center gap-1 text-gray-500 hover:text-black focus:outline-none focus:underline">
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
              <option value="">No size selected</option>
              {sizes?.map((size, index) => (
                <option key={`${size}-${index}`} value={size}>
                  {size.toUpperCase()}
                </option>
              ))}
            </select>
            {error && (
              <p className="text-red-500 text-sm mt-2" aria-live="polite">
                {error}
              </p>
            )}
          </div>
        )}

        {/* Product Description */}
        <div className="text-gray-600 mb-6">
          <p className="line-clamp-3">{description || 'No description available.'}</p>
        </div>

        {/* Add to Basket Button */}
        {allSizesOutOfStock ? (
          <button
            className="w-full py-4 border-2 border-black font-bold uppercase tracking-wide flex items-center justify-center transition-all bg-gray-400 text-gray-700 cursor-not-allowed"
          >
            SOLD OUT
          </button>
        ) : (
          <button
            onClick={handleAddToBasket}
            disabled={!selectedSize || availableForUser <= 0}
            className={`w-full py-4 border-2 border-black font-bold uppercase tracking-wide flex items-center justify-center transition-all ${
              !selectedSize || availableForUser <= 0
                ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                : 'bg-black text-white hover:bg-white hover:text-black hover:scale-105 focus:bg-white focus:text-black focus:outline-none'
            }`}
          >
            <FaShoppingBasket className="mr-2" />
            Add to Basket
          </button>
        )}

        {/* Additional Info */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="font-semibold">Delivery:</span>
              <span>Free shipping over 200 TND</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">Returns:</span>
              <span>7-day free returns</span>
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
        >
          <div
            className="fixed inset-0"
            onClick={closeModal}
            aria-label="Close modal"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Escape' && closeModal()}
          />
          <div className="relative w-96 h-[70vh] md:w-full md:h-full max-w-2xl bg-white rounded-lg overflow-hidden scale-90 m-0 md:m-6 flex items-center justify-center">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 z-50 text-[#46c7c7] hover:text-dark transition-colors duration-200"
              aria-label="Close image modal"
            >
              <FaTimes className="text-xl md:text-2xl" />
            </button>
            <Swiper
              initialSlide={selectedImageIndex}
              modules={[Navigation, Pagination, Zoom]}
              navigation
              pagination={{ clickable: true }}
              zoom
              className="h-full w-full"
            >
              {images?.map((image, index) => (
                <SwiperSlide key={`modal-image-${index}`} className="flex items-center justify-center">
                  <div className="swiper-zoom-container relative flex items-center justify-center">
                    <Image
                      src={image}
                      alt={`Enlarged view of ${name} - Image ${index + 1}`}
                      fill
                      style={{ objectFit: "contain" }}
                      priority
                      quality={100}
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      )}
    </div>
  );
}
