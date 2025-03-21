import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { FaTimes, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useInView } from 'react-intersection-observer';
import { motion } from 'framer-motion';

const ImageCard = ({ image, onClick, isClickable = false }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }
    return () => observer.disconnect();
  }, []);

  const handleKeyDown = (e) => {
    if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
      onClick(image);
    }
  };

  return (
    <div
      ref={cardRef}
      className={`relative bg-gray-900 overflow-hidden transition-all duration-500 break-inside-avoid mb-4 
        ${isClickable ? 'cursor-pointer' : ''} 
        ${isVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-10'}
      `}
      style={{
        aspectRatio: image.width / image.height,
        transition: 'opacity 0.6s ease, transform 0.6s ease',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={isClickable ? () => onClick(image) : undefined}
      tabIndex={isClickable ? 0 : undefined}
      role={isClickable ? 'button' : undefined}
      onKeyDown={handleKeyDown}
      aria-label={isClickable ? `View ${image.alt}` : undefined}
    >
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-800 animate-pulse flex items-center justify-center">
          <svg className="w-10 h-10 text-gray-600 animate-spin" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
      )}

      <img
        src={image.src}
        alt={image.alt}
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        className={`w-full h-full object-cover transition-transform duration-700  rounded-lg
          ${isHovered ? 'scale-105' : 'scale-100'} 
          ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}
      />

      {isClickable && (
        <div
          className={`absolute inset-0 bg-gradient-to-t from-black/60 to-transparent transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}
    </div>
  );
};

const ImageSlider = ({ images, currentIndex, onClose, onPrev, onNext }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const currentImage = images[currentIndex];
  const sliderRef = useRef(null);

  useEffect(() => {
    setIsLoaded(false);
    const nextIndex = currentIndex === images.length - 1 ? 0 : currentIndex + 1;
    const nextImage = new Image();
    nextImage.src = images[nextIndex].src;
    const prevIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
    const prevImage = new Image();
    prevImage.src = images[prevIndex].src;
  }, [currentIndex, images]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onPrev, onNext]);

  useEffect(() => {
    if (sliderRef.current) {
      sliderRef.current.focus();
    }
  }, []);

  const minSwipeDistance = 50;
  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };
  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  const onTouchEndHandler = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > minSwipeDistance) {
      onNext();
    }
    if (distance < -minSwipeDistance) {
      onPrev();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center"
      ref={sliderRef}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEndHandler}
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
      aria-label="Image slider"
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 text-white hover:text-gray-300 transition-colors duration-200 focus:outline-none"
        aria-label="Close slider"
        style={{ fontSize: '1.5rem', padding: '0.5rem', borderRadius: '50%' }}
      >
        <FaTimes className="text-2xl md:text-3xl" />
      </button>

      <button
        onClick={onPrev}
        className="absolute left-4 top-1/2 hidden md:block transform -translate-y-1/2 z-50 p-2 bg-gray-400 text-white rounded-full transition hover:scale-110 md:left-24"
        aria-label="Previous image"
      >
        <FaChevronLeft />
      </button>

      <div className="relative max-w-5xl max-h-[90vh] w-full flex items-center justify-center">
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center">
              <svg className="w-12 h-12 text-white animate-spin" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <p className="mt-2 text-gray-300 text-sm">Loading image...</p>
            </div>
          </div>
        )}

        <img
          key={`slide-image-${currentIndex}`}
          src={currentImage.src}
          alt={currentImage.alt}
          className={`max-h-[85vh] w-auto max-w-full object-contain transition-opacity duration-500 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ maxWidth: `min(100%, ${currentImage.width}px)` }}
          onLoad={() => setIsLoaded(true)}
        />
      </div>

      <button
        onClick={onNext}
        className="absolute right-4 top-1/2 hidden md:block transform -translate-y-1/2 z-50 p-2 bg-gray-400 text-white rounded-full transition hover:scale-110 md:right-24"
        aria-label="Next image"
      >
        <FaChevronRight />
      </button>

      {/* Swipe instructions for mobile */}
      <div className="absolute bottom-4 left-0 right-0 text-center text-sm text-gray-400 md:hidden">
        Swipe left or right to navigate
      </div>
    </div>
  );
};

const FullGalleryView = ({ images, isOpen, onClose }) => {
  const galleryRef = useRef(null);
  const [sliderOpen, setSliderOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [visibleFullGalleryImages, setVisibleFullGalleryImages] = useState([]);
  const [visibleCount, setVisibleCount] = useState(8);
  const [isLoading, setIsLoading] = useState(false);
  const loaderRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !sliderOpen) onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose, sliderOpen]);

  useEffect(() => {
    if (visibleCount > visibleFullGalleryImages.length) {
      setIsLoading(true);
      setTimeout(() => {
        setVisibleFullGalleryImages(images.slice(0, visibleCount));
        setIsLoading(false);
      }, 800);
    }
  }, [visibleCount, images, visibleFullGalleryImages.length]);

  useEffect(() => {
    if (isOpen && visibleFullGalleryImages.length === 0) {
      setIsLoading(true);
      setTimeout(() => {
        setVisibleFullGalleryImages(images.slice(0, visibleCount));
        setIsLoading(false);
      }, 800);
    }
  }, [isOpen, images, visibleCount, visibleFullGalleryImages.length]);

  useEffect(() => {
    if (!isOpen) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleCount < images.length && !isLoading) {
          setVisibleCount((prev) => Math.min(prev + 4, images.length));
        }
      },
      { threshold: 0.5 }
    );
    if (loaderRef.current) {
      observer.observe(loaderRef.current);
      return () => observer.disconnect();
    }
  }, [visibleCount, images.length, isOpen, isLoading]);

  const openSlider = (image) => {
    const index = images.findIndex((img) => img.id === image.id);
    setCurrentImageIndex(index);
    setSliderOpen(true);
  };

  const handlePrevImage = useCallback(() => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  const handleNextImage = useCallback(() => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black overflow-y-auto"
      ref={galleryRef}
      role="dialog"
      aria-modal="true"
      aria-label="Full gallery view"
    >
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center flex-col md:flex-row mb-8 sticky top-0 z-10 bg-black bg-opacity-90 py-4 shadow-lg transition-all duration-300">
          <div className="text-center md:text-left">
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tighter text-white">
              Frames of Elegance<span className="text-highlight">.</span>
            </h2>
            <p className="text-gray-400 mt-2 text-sm md:text-base">
              A curated collection of stunning moments.
            </p>
          </div>
          <button onClick={onClose} className="text-white text-xl p-3" aria-label="Close gallery">
            <FaTimes className="text-2xl md:text-3xl" />
          </button>
        </div>

        {/* Old Masonry Layout */}
        <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4">
          {visibleFullGalleryImages.map((image, index) => (
            <div
              key={image.id}
              className="w-full mb-4 break-inside-avoid opacity-0 animate-fadeIn"
              style={{ animationDelay: `${(index % 4) * 150}ms`, animationFillMode: 'forwards' }}
            >
              <ImageCard image={image} onClick={openSlider} isClickable={true} />
            </div>
          ))}
        </div>

        {isLoading && (
          <div className="flex justify-center items-center py-8">
            <div className="flex flex-col items-center">
              <svg className="w-10 h-10 text-white animate-spin" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </div>
          </div>
        )}

        {visibleCount < images.length && !isLoading && <div ref={loaderRef} className="h-20 w-full"></div>}

        {sliderOpen && (
          <ImageSlider
            images={images}
            currentIndex={currentImageIndex}
            onClose={() => setSliderOpen(false)}
            onPrev={handlePrevImage}
            onNext={handleNextImage}
          />
        )}
      </div>
    </div>
  );
};

const Gallery = () => {
  const [isFullGalleryOpen, setIsFullGalleryOpen] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState(0);
  const [allImagesLoaded, setAllImagesLoaded] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const sliderRef = useRef(null);
  
  const { ref: headerRef, inView: isHeaderVisible } = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  const allImages = useMemo(
    () => [
      { id: 1, src: "/showcase/1.avif", width: 600, height: 900, alt: "Gallery image 1" },
      { id: 2, src: "/showcase/2.avif", width: 600, height: 600, alt: "Gallery image 2" },
      { id: 3, src: "/showcase/7.avif", width: 800, height: 600, alt: "Gallery image 3" },
      { id: 4, src: "/showcase/8.avif", width: 600, height: 900, alt: "Gallery image 4" },
      { id: 5, src: "/showcase/5.avif", width: 800, height: 600, alt: "Gallery image 5" },
      { id: 6, src: "/showcase/9.avif", width: 600, height: 900, alt: "Gallery image 6" },
      { id: 7, src: "/showcase/15.avif", width: 800, height: 600, alt: "Gallery image 7" },
      { id: 8, src: "/showcase/12.avif", width: 600, height: 800, alt: "Gallery image 8" },
      { id: 9, src: "/showcase/13.avif", width: 800, height: 600, alt: "Gallery image 9" },
      { id: 10, src: "/showcase/16.avif", width: 600, height: 900, alt: "Gallery image 10" },
    ],
    []
  );

  const previewImages = useMemo(() => allImages.slice(0, 4), [allImages]);

  // Touch handling for mobile slider
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const diff = touchStart - touchEnd;
    const swipeThreshold = 50;

    if (diff > swipeThreshold) {
      setCurrentIndex(prev => Math.min(prev + 1, previewImages.length - 1));
    } else if (diff < -swipeThreshold) {
      setCurrentIndex(prev => Math.max(prev - 1, 0));
    }
    setTouchStart(0);
    setTouchEnd(0);
  };

  // Image loading handler
  const handleImageLoad = useCallback(() => {
    setImagesLoaded(prev => {
      const newCount = prev + 1;
      if (newCount === previewImages.length) setAllImagesLoaded(true);
      return newCount;
    });
  }, [previewImages.length]);

  // Preload images
  useEffect(() => {
    const abortController = new AbortController();
    
    previewImages.forEach(image => {
      const img = new Image();
      img.src = image.src;
      img.onload = handleImageLoad;
      img.onerror = handleImageLoad;
    });

    return () => abortController.abort();
  }, [previewImages, handleImageLoad]);

  // Animation variants
  const headingVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }
    }
  };
  return (
    <section className="pt-12 pb-0 px-6 md:pb-12 bg-black text-white min-h-screen md:min-h-[60vh] flex items-center justify-around">
      <div className="max-w-6xl mx-auto flex flex-col items-center justify-around">
        <header
          ref={headerRef}
          className={`flex flex-col md:flex-row w-full justify-between items-center mb-5 md:mb-16 transition-all duration-700 
            ${isHeaderVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
        >
          <motion.h2
            className="text-5xl font-black text-start mb-6 md:mb-0 tracking-tighter relative"
            variants={headingVariants}
            initial="hidden"
            animate={isHeaderVisible ? "visible" : "hidden"}
          >
            Frames of Elegance{" "}
            <motion.span
              className="text-highlight absolute ml-2"
              initial={{ scale: 0 }}
              animate={isHeaderVisible ? { scale: 1.2, rotate: 10 } : { scale: 0 }}
              transition={{ delay: 0.6, type: "spring", stiffness: 300, damping: 10 }}
            >
              .
            </motion.span>
          </motion.h2>
          <div className="flex items-center space-x-4 gap-5 justify-around md:justify-end">
            <div className="text-sm text-highlight">45 MINUTES</div>
            <button
              onClick={() => setIsFullGalleryOpen(true)}
              aria-label="View full gallery"
              className="bg-highlight text-black px-4 py-2 hover:bg-light transition-colors"
            >
              View Gallery
            </button>
          </div>
        </header>

        {allImagesLoaded && (
          <>
            {/* Mobile Slider */}
            <div className="relative md:hidden w-full overflow-hidden mb-4">
              <div
                ref={sliderRef}
                className="flex  items-center transition-transform duration-300 ease-out"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {previewImages.map((image) => (
  <div key={image.id} className="w-full h-full flex-shrink-0 p-2">
    <ImageCard image={image} />
  </div>
))}

              </div>

              {/* Navigation Dots */}
              <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center z-20 pointer-events-auto">
  <div className="relative -translate-y-1 bg-black/30 backdrop-blur-sm px-4 py-2.5 rounded-full flex items-center space-x-3 shadow-lg">
    {previewImages.map((_, idx) => (
      <button
        key={idx}
        onClick={() => setCurrentIndex(idx)}
        aria-label={`Go to slide ${idx + 1}`}
        className={`relative h-2.5 rounded-full transition-all duration-300 ease-out transform ${
          idx === currentIndex 
            ? 'w-10 bg-white scale-100' 
            : 'w-2.5 bg-white/50 hover:bg-white/70 hover:scale-110'
        }`}
      >
        {idx === currentIndex && (
          <span className="absolute inset-0 rounded-full animate-pulse bg-white/30 -z-10" />
        )}
      </button>
    ))}
  </div>
</div>
      </div>

            {/* Desktop Masonry */}
            <div className="hidden md:block columns-1 sm:columns-2 md:columns-3 gap-4">
              {previewImages.map((image, index) => (
                <div
                  key={image.id}
                  className="opacity-0 animate-fadeIn"
                  style={{ animationDelay: `${index * 150}ms`, animationFillMode: "forwards" }}
                >
                  <ImageCard image={image} onClick={() => {}} isClickable={false} />
                </div>
              ))}
            </div>
          </>
        )}

        <FullGalleryView
          images={allImages}
          isOpen={isFullGalleryOpen}
          onClose={() => setIsFullGalleryOpen(false)}
        />
      </div>
    </section>
  );
};

const styles = document.createElement('style');
styles.innerHTML = `

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .animate-fadeIn {
    animation: fadeIn 0.5s ease-out;
  }
  .animate-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: .5; }
  }
  .animate-spin {
    animation: spin 1s linear infinite;
  }
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  @keyframes swipe {
    0% { opacity: 0; transform: translateX(-10px); }
    50% { opacity: 1; transform: translateX(0); }
    100% { opacity: 0; transform: translateX(10px); }
  }
`;
document.head.appendChild(styles);

export default Gallery;