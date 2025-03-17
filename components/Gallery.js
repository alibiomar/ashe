import React, { useState, useEffect, useRef } from 'react';

const ImageCard = ({ image, onClick, isClickable = false }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className={`relative bg-gray-900 overflow-hidden transition-all duration-500 break-inside-avoid mb-4 ${isClickable ? 'cursor-pointer' : ''}`}
      style={{ aspectRatio: image.width / image.height }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={isClickable ? () => onClick(image) : undefined}
    >
      <img 
        src={image.src} 
        alt={image.alt}
        loading="lazy"
        onError={(e) => e.target.src = "/placeholder-art.svg"}
        className={`w-full h-full object-cover transition-transform duration-700 ${isHovered ? 'scale-105' : 'scale-100'}`}
      />
      <div 
        className={`absolute bottom-0 left-0 w-full p-2 bg-gradient-to-t from-black to-transparent text-white text-sm transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
      >
        {image.caption} - {image.year}
      </div>
    </div>
  );
};

const ImageSlider = ({ images, currentIndex, onClose, onPrev, onNext }) => {
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

  const currentImage = images[currentIndex];

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center">
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 text-white text-xl p-2 hover:text-gray-300 z-10"
        aria-label="Close slider"
      >
        ✕
      </button>
      
      <button
        onClick={onPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-4xl p-2 hover:text-gray-300 z-10"
        aria-label="Previous image"
      >
        ‹
      </button>
      
      <div className="relative max-w-5xl max-h-[90vh] w-full flex flex-col items-center">
        <img 
          src={currentImage.src} 
          alt={currentImage.alt}
          className="max-h-[80vh] max-w-full object-contain"
          onError={(e) => e.target.src = "/placeholder-art.svg"}
        />
        <div className="mt-4 text-white text-center">
          <p className="text-lg font-medium">{currentImage.caption}</p>
          <p className="text-sm text-gray-300">{currentImage.year}</p>
        </div>
      </div>
      
      <button
        onClick={onNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-4xl p-2 hover:text-gray-300 z-10"
        aria-label="Next image"
      >
        ›
      </button>
    </div>
  );
};

const FullGalleryView = ({ images, isOpen, onClose, currentCategory }) => {
  const galleryRef = useRef(null);
  const [sliderOpen, setSliderOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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
        <div className="flex justify-between items-center mb-8 sticky top-0 z-10 bg-black bg-opacity-90 py-4">
          <h2 className="text-5xl font-bold tracking-tighter">
            Frames of Elegance <span className="text-highlight">.</span>
          </h2>
          <button 
            onClick={onClose}
            className="text-white text-xl p-2 hover:text-gray-300"
            aria-label="Close gallery"
          >
            ✕
          </button>
        </div>
      
        {/* Masonry Gallery Grid */}
        <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4">
          {images.map((image) => (
            <div key={image.id} className="w-full mb-4 break-inside-avoid">
              <ImageCard 
                image={image}
                onClick={openSlider}
                isClickable={true}
              />
            </div>
          ))}
        </div>
        
        {/* Image Slider */}
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
  const [displayImages, setDisplayImages] = useState([]);
  const [visibleCount, setVisibleCount] = useState(5);
  const loaderRef = useRef();
  
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

  useEffect(() => {
    setDisplayImages(allImages.slice(0, visibleCount));
  }, [visibleCount]);

  // Infinite scrolling for the preview gallery
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleCount < allImages.length) {
          setVisibleCount(prev => Math.min(prev + 5, allImages.length));
        }
      },
      { threshold: 0.5 }
    );
    
    if (loaderRef.current) {
      observer.observe(loaderRef.current);
      return () => observer.disconnect();
    }
  }, [visibleCount, allImages.length]);

  return (
    <section className="py-24 px-6 bg-black text-white min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start mb-16">
          <h2 className="text-5xl font-bold tracking-tighter">
            Frames of Elegance <span className="text-highlight">.</span>
          </h2>
          <div className="mt-4 md:mt-0 flex items-center space-x-4">
            <div className="text-sm text-highlight">45 MINUTES</div>
            <button 
              onClick={() => setIsFullGalleryOpen(true)}
              className="bg-highlight text-black px-4 py-2 hover:bg-light transition-colors"
            >
              View Full Gallery
            </button>
          </div>
        </div>

        {/* Dynamic Masonry Layout - Preview Only (non-clickable images) */}
        <div className="columns-1 sm:columns-2 md:columns-3 gap-4">
          {displayImages.map((image) => (
            <ImageCard 
              key={image.id}
              image={image}
              onClick={() => {}}
              isClickable={false}
            />
          ))}
        </div>
        
        {/* Loading reference for infinite scroll */}
        {visibleCount < allImages.length && (
          <div ref={loaderRef} className="h-10 w-full"></div>
        )}

        {/* Full Gallery View with Masonry and Slider */}
        <FullGalleryView 
          images={allImages}
          isOpen={isFullGalleryOpen}
          onClose={() => setIsFullGalleryOpen(false)}
        />
      </div>
    </section>
  );
};

export default Gallery;