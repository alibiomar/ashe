import React, { useState, useCallback, useRef, useEffect } from 'react';
import Image from 'next/image';
import { FaShoppingBasket, FaTimes, FaChevronLeft, FaChevronRight, FaExpand, FaCompress } from 'react-icons/fa';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Zoom, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/zoom';
import 'swiper/css/effect-fade';

export default function ProductCard({ product, onAddToBasket, getItemQuantity }) {
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState(product?.colors?.[0]?.name || null);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  const mainSwiperRef = useRef(null);
  const modalSwiperRef = useRef(null);

  const handleSizeChange = useCallback((event) => {
    setSelectedSize(event.target.value);
    setError('');
  }, []);

  const handleColorChange = useCallback((color) => {
    setSelectedColor(color);
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
  useEffect(() => {
    if (product?.colors?.length > 0) {
      setSelectedColor(product.colors[0].name);
    }
  }, [product]);
  
  // Keyboard navigation for modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isModalOpen) {
        if (e.key === 'Escape') {
          closeModal();
        } else if (e.key === 'ArrowLeft') {
          modalSwiperRef.current?.slidePrev();
        } else if (e.key === 'ArrowRight') {
          modalSwiperRef.current?.slideNext();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  const handleAddToBasket = useCallback(() => {
    if (!selectedSize || !selectedColor) {
      setError('Please select a size and color before adding to the basket.');
      return;
    }

    const selectedColorData = product.colors.find(color => color.name === selectedColor);
    if (!selectedColorData) {
      setError('Selected color is not available.');
      return;
    }

    const selectedSizeStock = selectedColorData.stock?.[selectedSize] || 0;
    const currentBasketQty = getItemQuantity(product.id, selectedSize, selectedColor) || 0;
    const availableForUser = selectedSizeStock - currentBasketQty;

    if (availableForUser <= 0) {
      setError('You cannot add more than the available stock.');
      return;
    }

    setError('');
    onAddToBasket({ ...product, size: selectedSize, color: selectedColor, images: selectedColorData.images });
  }, [selectedSize, selectedColor, product, getItemQuantity, onAddToBasket]);

  if (!product) {
    return (
      <div className="w-full flex flex-col md:flex-row bg-white border-2 border-black p-6 gap-6">
        <p className="text-center text-gray-600">Product information is unavailable.</p>
      </div>
    );
  }

  const { name, price, colors = [], description, sizes } = product;
  const selectedColorData = colors.find(color => color.name === selectedColor) || colors[0];

  // Ensure selectedColorData and its images are defined
  const images = selectedColorData?.images || [];
  const selectedSizeStock = selectedColorData?.stock?.[selectedSize] || 0;
  const currentBasketQty = selectedSize ? getItemQuantity(product.id, selectedSize, selectedColor) : 0;
  const availableForUser = selectedSizeStock - currentBasketQty;
  const allSizesOutOfStock = sizes?.every((size) => (selectedColorData?.stock?.[size] || 0) === 0);

  return (
    <div className="w-full flex flex-col items-center justify-around md:flex-row bg-white p-6 gap-6 md:gap-22">
      {/* Main Image Slider */}
      <div className="w-full md:w-[35%] relative">
        <div className="relative">
          {images.length > 0 ? (
            <Swiper
              onSwiper={(swiper) => (mainSwiperRef.current = swiper)}
              spaceBetween={10}
              slidesPerView={1}
              effect="fade"
              loop={true}
              autoplay={{ delay: 5000, disableOnInteraction: false }}
              modules={[Autoplay, EffectFade, Zoom]}
              fadeEffect={{ crossFade: true }}
              className="w-full h-full"
            >
              {images.map((image, index) => (
                <SwiperSlide key={`image-${index}`}>
                  <Image
                    src={image}
                    alt={`${name} - Image ${index + 1}`}
                    width={800}
                    height={1000}
                    priority={index === 0}
                    className="object-cover h-full w-full cursor-zoom-in transition-transform duration-300 hover:scale-105"
                    onClick={() => openModal(index)}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <p>No images available.</p>
          )}
          <button
            className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition hover:scale-110"
            onClick={() => mainSwiperRef.current?.slidePrev()}
            aria-label="Previous image"
          >
            <FaChevronLeft />
          </button>
          <button
            className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition hover:scale-110"
            onClick={() => mainSwiperRef.current?.slideNext()}
            aria-label="Next image"
          >
            <FaChevronRight />
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="w-full md:w-[40%] flex flex-col justify-center">
        <h2 className="text-3xl font-extrabold uppercase text-black tracking-tight mb-4">
          {name || 'Product Name'}
        </h2>

        <div className="flex items-center justify-between mb-4">
          <p className="text-2xl font-bold text-[#46c7c7]">
            {price?.toFixed(2)} TND
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

        {/* Color Selector */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className="font-semibold text-gray-700">SELECT COLOR:</label>
          </div>
          <div className="flex gap-2">
            {colors.map((color) => (
              <button
                key={color.name}
                onClick={() => handleColorChange(color.name)}
                className={`w-8 h-8 rounded-full border-2 ${
                  selectedColor === color.name ? 'border-[#46c7c7]' : 'border-gray-300'
                }`}
                style={{ backgroundColor: color.code }}
                aria-label={`Select ${color.name}`}
              />
            ))}
          </div>
        </div>

        {/* Size Selector */}
        {sizes?.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="size" className="font-semibold text-gray-700">
                SELECT SIZE:
              </label>
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
            disabled={!selectedSize || !selectedColor || availableForUser <= 0}
            className={`w-full py-4 border-2 border-black font-bold uppercase tracking-wide flex items-center justify-center transition-all ${
              !selectedSize || !selectedColor || availableForUser <= 0
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

      {/* Modal Image Slider */}
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
          <div className="relative w-full h-full max-w-full max-h-full bg-transparent flex items-center justify-center">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 z-50 text-white hover:text-gray-300 transition-colors duration-200 focus:outline-none"
              aria-label="Close image modal"
              style={{ fontSize: '1.5rem', padding: '0.5rem', borderRadius: '50%' }}
            >
              <FaTimes className="text-2xl md:text-3xl" />
            </button>

            <div className="relative w-full h-full">
              <Swiper
                initialSlide={selectedImageIndex}
                onSwiper={(swiper) => (modalSwiperRef.current = swiper)}
                effect="fade"
                loop={true}
                modules={[EffectFade, Zoom]}
                fadeEffect={{ crossFade: true }}
                onZoomChange={(swiper, scale) => setIsZoomed(scale > 1)}
                zoom={{ maxRatio: 3, toggle: true }}
                onDoubleTap={(swiper) => {
                  if (swiper.zoom.scale > 1) {
                    swiper.zoom.out();
                  } else {
                    swiper.zoom.in();
                  }
                }}
                className="h-full w-full"
              >
                {images.map((image, index) => (
                  <SwiperSlide key={`modal-image-${index}`} className="flex items-center justify-center">
                    <div className="swiper-zoom-container relative flex items-center justify-center w-full h-full">
                      <Image
                        src={image}
                        alt={`Enlarged view of ${name} - Image ${index + 1}`}
                        fill
                        style={{ objectFit: 'contain' }}
                        priority
                        quality={100}
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
              <button
  className="absolute left-4 top-1/2 transform -translate-y-1/2 z-50 p-2 bg-gray-400 text-white rounded-full transition hover:scale-110 md:left-24"
  onClick={() => modalSwiperRef.current?.slidePrev()}
  aria-label="Previous image"
>
  <FaChevronLeft />
</button>
<button
  className="absolute right-4 top-1/2 transform -translate-y-1/2 z-50 p-2 bg-gray-400 text-white rounded-full transition hover:scale-110 md:right-24"
  onClick={() => modalSwiperRef.current?.slideNext()}
  aria-label="Next image"
>
  <FaChevronRight />
</button>

              <button
                className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-50 p-2 bg-gray-400 text-white rounded-full transition hover:scale-110"
                onClick={() => modalSwiperRef.current?.zoom.toggle()}
                aria-label={isZoomed ? "Zoom out" : "Zoom in"}
              >
                {isZoomed ? <FaCompress /> : <FaExpand />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
