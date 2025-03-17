import React, { useState, useEffect, useRef } from 'react';

const ImageCard = ({ image, onClick, onTouchStart, onTouchEnd }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imgSrc, setImgSrc] = useState(image.src);

  const handleError = () => setImgSrc("/fallback-placeholder.svg");

  return (
    <div 
      className="relative bg-gray-900 overflow-hidden transition-all duration-500 cursor-pointer break-inside-avoid mb-4"
      style={{ aspectRatio: image.width / image.height }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <img 
        src={imgSrc} 
        alt={image.alt}
        loading="lazy"
        onError={handleError}
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

const Modal = ({ image, onClose, nextImage, prevImage }) => {
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowRight') nextImage();
    if (e.key === 'ArrowLeft') prevImage();
    if (e.key === 'Escape') onClose();
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextImage, prevImage, onClose]);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="relative max-w-4xl w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <img 
          src={image.src} 
          alt={image.alt} 
          className="w-full h-auto object-contain" 
        />
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-white text-xl"
          aria-label="Close modal"
        >
          ✕
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); prevImage(); }} 
          className="absolute inset-y-0 left-0 flex items-center px-4 text-white text-3xl focus:outline-none"
          aria-label="Previous image"
        >
          ‹
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); nextImage(); }} 
          className="absolute inset-y-0 right-0 flex items-center px-4 text-white text-3xl focus:outline-none"
          aria-label="Next image"
        >
          ›
        </button>
        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black p-4">
          <h3 className="text-white text-xl">{image.caption} - {image.year}</h3>
        </div>
      </div>
    </div>
  );
};

const GalleryModal = ({ images, isOpen, onClose, onSelect }) => {
  const scrollRef = useRef();

  const handleNext = () => {
    scrollRef.current.scrollBy({ left: scrollRef.current.offsetWidth, behavior: 'smooth' });
  };

  const handlePrev = () => {
    scrollRef.current.scrollBy({ left: -scrollRef.current.offsetWidth, behavior: 'smooth' });
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 transition-opacity ${isOpen ? 'visible opacity-100' : 'invisible opacity-0'}`}>
      <div className="relative w-full max-w-6xl mx-4 p-4">
        <button 
          className="absolute top-2 right-2 text-white text-2xl z-10"
          onClick={onClose}
          aria-label="Close gallery"
        >
          ×
        </button>
        <button 
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 p-2 rounded-full text-white"
          onClick={handlePrev}
        >
          ‹
        </button>
        <button 
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 p-2 rounded-full text-white"
          onClick={handleNext}
        >
          ›
        </button>
        <div 
          ref={scrollRef}
          className="scroll-container flex gap-4 overflow-x-auto pb-4"
          style={{
            scrollSnapType: 'x mandatory',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
        >
          {images.map((img, index) => (
            <div 
              key={img.id}
              className="flex-shrink-0 w-48 md:w-64 scroll-m-4"
              style={{ scrollSnapAlign: 'start' }}
              onClick={() => onSelect(index)}
            >
              <img 
                src={img.src} 
                alt={img.alt}
                className="w-full h-48 md:h-64 object-cover rounded-lg cursor-pointer"
                onError={(e) => e.target.src = "/fallback-placeholder.svg"}
              />
              <div className="text-white text-sm mt-2 text-center">
                {img.caption} - {img.year}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Gallery = () => {
  const [modalImage, setModalImage] = useState(null);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  
  // Sample images with natural dimensions for dynamic aspect ratios
  const allImages = [
    { id: 1, src: "/placeholder-art.svg", alt: "Minimal design showcase", caption: "Architecture", year: "2025", width: 800, height: 600 },
    { id: 2, src: "/placeholder-art.svg", alt: "Modern interior", caption: "Interior", year: "2025", width: 600, height: 600 },
    { id: 3, src: "/placeholder-art.svg", alt: "Product photography", caption: "Product", year: "2025", width: 600, height: 800 },
    { id: 4, src: "/placeholder-art.svg", alt: "Landscape photography", caption: "Landscape", year: "2025", width: 900, height: 600 },
    { id: 5, src: "/placeholder-art.svg", alt: "Portrait photography", caption: "Portrait", year: "2025", width: 600, height: 900 },
    // Add more images as needed
  ];
  
  // For infinite scrolling simulation: initially display a subset
  const [visibleCount, setVisibleCount] = useState(5);
  const [displayImages, setDisplayImages] = useState([]);

  useEffect(() => {
    // Update displayed images when visibleCount changes
    setDisplayImages(allImages.slice(0, visibleCount));
  }, [visibleCount, allImages]);

  // Infinite scrolling: automatically load more images when the sentinel is visible
  const loaderRef = useRef();
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleCount < allImages.length) {
          setVisibleCount(prev => Math.min(prev + 5, allImages.length));
        }
      },
      { threshold: 1.0 }
    );
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => {
      if (loaderRef.current) observer.unobserve(loaderRef.current);
    };
  }, [visibleCount, allImages]);

  const openModal = (index) => setModalImage({ ...displayImages[index], index });
  const closeModal = () => setModalImage(null);
  const modalNext = () => {
    const nextIndex = (modalImage.index + 1) % allImages.length;
    setModalImage({ ...allImages[nextIndex], index: nextIndex });
  };
  const modalPrev = () => {
    const prevIndex = (modalImage.index - 1 + allImages.length) % allImages.length;
    setModalImage({ ...allImages[prevIndex], index: prevIndex });
  };

  const openGallery = () => setIsGalleryOpen(true);
  const closeGallery = () => setIsGalleryOpen(false);
  
  const handleImageSelect = (index) => {
    setModalImage({ ...allImages[index], index });
    closeGallery();
  };

  return (
    <section className="py-24 px-6 bg-black text-white min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start mb-16">
          <h2 className="text-5xl font-bold tracking-tight">
            Frames of Elegance <span className="text-highlight">.</span>
          </h2>
          <div className="mt-4 md:mt-0 flex items-center space-x-4">
            <div className="text-sm text-highlight">45 MINUTES</div>
            <button 
              onClick={openGallery}
              className="bg-highlight text-black px-4 py-2  hover:bg-light transition-colors"
            >
              View Full Gallery
            </button>
          </div>
        </div>

        {/* Dynamic Masonry Layout using CSS Columns */}
        <div className="columns-1 sm:columns-2 md:columns-3 gap-4">
          {displayImages.map((image, index) => (
            <div key={image.id}>
              <ImageCard 
                image={image} 
                onClick={() => openModal(index)}
              />
            </div>
          ))}
        </div>
        
        {/* Sentinel element for infinite scrolling */}
        <div ref={loaderRef} className="py-4 text-center">
          {visibleCount < allImages.length && <span>Loading more images…</span>}
        </div>

        {/* Modal Preview */}
        {modalImage && (
          <Modal 
            image={modalImage} 
            onClose={closeModal} 
            nextImage={modalNext} 
            prevImage={modalPrev} 
          />
        )}

        {/* Gallery Modal */}
        {isGalleryOpen && (
          <GalleryModal 
            images={allImages}
            isOpen={isGalleryOpen}
            onClose={closeGallery}
            onSelect={handleImageSelect}
          />
        )}
      </div>
    </section>
  );
};

export default Gallery;