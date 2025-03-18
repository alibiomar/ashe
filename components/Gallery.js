import React, { useState, useEffect, useRef } from 'react';
import {  FaTimes, FaChevronLeft, FaChevronRight} from 'react-icons/fa';
import { useInView } from 'react-intersection-observer';
import { motion} from 'framer-motion';

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

  return (
    <div
      ref={cardRef}
      className={`relative bg-gray-900 overflow-hidden transition-all duration-500 break-inside-avoid mb-4 
        ${isClickable ? 'cursor-pointer' : ''} 
        ${isVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-10'}
      `}
      style={{ aspectRatio: image.width / image.height, transition: 'opacity 0.6s ease, transform 0.6s ease' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={isClickable ? () => onClick(image) : undefined}
    >
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-800 animate-pulse flex items-center justify-center">
          <svg className="w-10 h-10 text-gray-600 animate-spin" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      )}

      <img
        src={image.src}
        alt={image.alt}
        loading="lazy"
        onError={(e) => (e.target.src = '/placeholder-art.svg')}
        onLoad={() => setIsLoaded(true)}
        className={`w-full h-full object-cover transition-transform duration-700 
          ${isHovered ? 'scale-105' : 'scale-100'} 
          ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}
      />
    </div>
  );
};

const ImageSlider = ({ images, currentIndex, onClose, onPrev, onNext }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const currentImage = images[currentIndex];
  const sliderRef = useRef(null);
  
  // Reset loading state when currentIndex changes
  useEffect(() => {
    setIsLoaded(false);
    
    // Preload next image
    const nextIndex = currentIndex === images.length - 1 ? 0 : currentIndex + 1;
    const nextImage = new Image();
    nextImage.src = images[nextIndex].src;
    
    // Preload previous image
    const prevIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
    const prevImage = new Image();
    prevImage.src = images[prevIndex].src;
  }, [currentIndex, images]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onPrev, onNext]);

  // Touch swipe handling
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) {
      onNext();
    }
    if (isRightSwipe) {
      onPrev();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center"
      ref={sliderRef}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
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
        <FaChevronLeft/>
      </button>
      
      <div className="relative max-w-5xl max-h-[90vh] w-full flex flex-col items-center">
        {/* Loading indicator */}
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center">
              <svg className="w-12 h-12 text-white animate-spin" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="mt-2 text-gray-300 text-sm">Loading image...</p>
            </div>
          </div>
        )}
        
        {/* Current image - key attribute forces re-render on image change */}
        <img 
          key={`slide-image-${currentIndex}`}
          src={currentImage.src} 
          alt={currentImage.alt}
          className={`max-h-[80vh] max-w-full object-contain transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          onError={(e) => e.target.src = "/placeholder-art.svg"}
          onLoad={() => setIsLoaded(true)}
        />
        

      </div>
      
      <button
        onClick={onNext}
        className="absolute right-4 top-1/2 hidden md:block transform -translate-y-1/2 z-50 p-2 bg-gray-400 text-white rounded-full transition hover:scale-110 md:right-24"
        aria-label="Next image"
      >
        <FaChevronRight/>
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
  const loaderRef = useRef();

  // Handle closing with escape key
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

  // Update visible images when count changes with fade-in animation
  useEffect(() => {
    if (visibleCount > visibleFullGalleryImages.length) {
      setIsLoading(true);
      
      // Simulate network delay for loading effect (remove in production and use real data fetch)
      setTimeout(() => {
        setVisibleFullGalleryImages(images.slice(0, visibleCount));
        setIsLoading(false);
      }, 800);
    }
  }, [visibleCount, images, visibleFullGalleryImages.length]);

  // Initial load
  useEffect(() => {
    if (isOpen && visibleFullGalleryImages.length === 0) {
      setIsLoading(true);
      
      // Simulate network delay for loading effect (remove in production and use real data fetch)
      setTimeout(() => {
        setVisibleFullGalleryImages(images.slice(0, visibleCount));
        setIsLoading(false);
      }, 800);
    }
  }, [isOpen, images, visibleCount, visibleFullGalleryImages.length]);

  // Infinite scrolling for the full gallery
  useEffect(() => {
    if (!isOpen) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleCount < images.length && !isLoading) {
          setVisibleCount(prev => Math.min(prev + 4, images.length));
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
    const index = images.findIndex(img => img.id === image.id);
    setCurrentImageIndex(index);
    setSliderOpen(true);
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === images.length - 1 ? 0 : prev + 1
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black overflow-y-auto" ref={galleryRef}>
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
  
  <button 
    onClick={onClose}
    className="text-white text-xl p-3 "
    aria-label="Close gallery"
  >
    <FaTimes className="text-2xl md:text-3xl" />
  </button>
</div>

      
        {/* Masonry Gallery Grid with fade-in animation */}
        <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4">
          {visibleFullGalleryImages.map((image, index) => (
            <div 
              key={image.id} 
              className="w-full mb-4 break-inside-avoid opacity-0 animate-fadeIn"
              style={{ animationDelay: `${index % 4 * 150}ms`, animationFillMode: 'forwards' }}
            >
              <ImageCard 
                image={image}
                onClick={openSlider}
                isClickable={true}
              />
            </div>
          ))}
        </div>
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-center items-center py-8">
            <div className="flex flex-col items-center">
              <svg className="w-10 h-10 text-white animate-spin" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          </div>
        )}
        
        {/* Loading reference for infinite scroll in full gallery */}
        {visibleCount < images.length && !isLoading && (
          <div ref={loaderRef} className="h-20 w-full"></div>
        )}
        
        {/* Image Slider with preloading and touch support */}
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
  const { ref: headerRef, inView: isHeaderVisible } = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });
  
  // Sample images with natural dimensions and more diverse categories
  const allImages = [
    { id: 1, src: "/placeholder-art.svg", alt: "Minimal design showcase", caption: "Architecture", year: "2025", width: 800, height: 600 },
    { id: 2, src: "/placeholder-art.svg", alt: "Modern interior", caption: "Interior", year: "2025", width: 600, height: 600 },
    { id: 3, src: "/placeholder-art.svg", alt: "Product photography", caption: "Product", year: "2025", width: 600, height: 800 },
    { id: 4, src: "/placeholder-art.svg", alt: "Landscape photography", caption: "Landscape", year: "2025", width: 900, height: 600 },
    { id: 5, src: "/placeholder-art.svg", alt: "Portrait photography", caption: "Portrait", year: "2025", width: 600, height: 900 },
    { id: 6, src: "/placeholder-art.svg", alt: "Urban architecture", caption: "Architecture", year: "2024", width: 800, height: 600 },
    { id: 7, src: "/placeholder-art.svg", alt: "Minimalist product", caption: "Product", year: "2024", width: 600, height: 800 },
    { id: 8, src: "/placeholder-art.svg", alt: "Mountain landscape", caption: "Landscape", year: "2023", width: 900, height: 600 },
    { id: 9, src: "/placeholder-art.svg", alt: "Creative portrait", caption: "Portrait", year: "2023", width: 600, height: 900 },
    { id: 10, src: "/placeholder-art.svg", alt: "Modern living space", caption: "Interior", year: "2024", width: 800, height: 600 },
  ];

  // Only show 5 images in the preview gallery
  const previewImages = allImages.slice(0, 5);
  const headingVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.8, 
        ease: [0.25, 0.1, 0.25, 1] 
      }
    }
  };
  // Track loading of initial preview images
  const handleImageLoad = () => {
    setImagesLoaded(prev => {
      const newCount = prev + 1;
      if (newCount >= previewImages.length) {
        setAllImagesLoaded(true);
      }
      return newCount;
    });
  };

  // Preload preview images
  useEffect(() => {
    previewImages.forEach(image => {
      const img = new Image();
      img.src = image.src;
      img.onload = handleImageLoad;
      img.onerror = handleImageLoad; // Count errors as loaded to avoid hanging
    });
  }, []);

  return (
    <section className="py-24 px-6 bg-black text-white min-h-screen">
      <div className="max-w-6xl mx-auto items-center flex flex-col justify-around">
        {/* Header */}
        <div 
  ref={headerRef} 
  className={`flex flex-col md:flex-row w-full justify-between items-center mb-16 transition-all duration-700 
    ${isHeaderVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}
  `}
>
<motion.h2
          className="text-5xl font-black text-start mb-16 md:mb-0 tracking-tighter relative"
          variants={headingVariants}
          initial="hidden"
          animate={isHeaderVisible ? "visible" : "hidden"}
        >
    Frames of Elegance <motion.span 
              className="text-highlight absolute ml-2 "
              initial={{ scale: 0 }}
              animate={isHeaderVisible ? { scale: 1.2, rotate: 10 } : { scale: 0 }}
              transition={{ delay: 0.6, type: "spring", stiffness: 300, damping: 10 }}
            >
               .
            </motion.span>
  </motion.h2>
  <div className="mt-4 md:mt-0 flex items-center space-x-4 gap-5 justify-around md:justify-end">
    <div className="text-sm text-highlight">45 MINUTES</div>
    <button 
      onClick={() => setIsFullGalleryOpen(true)}
      className="bg-highlight text-black px-4 py-2 hover:bg-light transition-colors"
    >
      View Gallery
    </button>
  </div>
</div>


        {/* Loading indicator for initial gallery load */}
        {!allImagesLoaded && (
          <div className="flex justify-center items-center py-16">
            <div className="flex flex-col items-center">
              <svg className="w-12 h-12 text-white animate-spin" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="mt-2 text-gray-300">Loading gallery...</p>
              <p className="text-sm text-gray-500">{imagesLoaded} of {previewImages.length} images</p>
            </div>
          </div>
        )}

        {/* Static Masonry Layout - Preview Only with fade-in animations */}
        <div className={`columns-1 sm:columns-2 md:columns-3 gap-4 ${!allImagesLoaded ? 'hidden' : 'block'}`}>
          {previewImages.map((image, index) => (
            <div 
              key={image.id} 
              className="opacity-0 animate-fadeIn"
              style={{ animationDelay: `${index * 150}ms`, animationFillMode: 'forwards' }}
            >
              <ImageCard 
                key={image.id}
                image={image}
                onClick={() => {}}
                isClickable={false}
              />
            </div>
          ))}
        </div>

        {/* Full Gallery View with Masonry and Slider (with infinite scroll) */}
        <FullGalleryView 
          images={allImages}
          isOpen={isFullGalleryOpen}
          onClose={() => setIsFullGalleryOpen(false)}
        />
      </div>
    </section>
  );
};

// Add necessary CSS animations
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
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: .5;
    }
  }
  
  .animate-spin {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;
document.head.appendChild(styles);

export default Gallery;