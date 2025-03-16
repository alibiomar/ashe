'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

const images = [
  '/placeholder-art.svg',
  '/placeholder-art.svg',
  '/placeholder-art.svg',
  '/showcase/quarterZipBackShot.webp',
  '/showcase/quarterZipFrontShot.webp',
];

const imageVariants = {
  active: {
    opacity: 1, // Set opacity to 1 to remove fade-in effect
    x: 0,
    rotateY: 0,
    scale: 1,
    transition: { duration: 0.7, ease: 'easeOut' },
  },
  prev: {
    opacity: 1, // Set opacity to 1 to remove fade-in effect
    x: -50,
    rotateY: -5,
    scale: 0.95,
    transition: { duration: 0.7, ease: 'easeOut' },
  },
  next: {
    opacity: 1, // Set opacity to 1 to remove fade-in effect
    x: 50,
    rotateY: 5,
    scale: 0.95,
    transition: { duration: 0.7, ease: 'easeOut' },
  },
};

const ParallaxImage = ({ src, alt, variant, zIndex, onImageLoad, isMobile }) => {
  const adjustedVariants = isMobile
    ? {
        active: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.7, ease: 'easeOut' } },
        prev: { opacity: 1, x: 0, scale: 0.95, transition: { duration: 0.7, ease: 'easeOut' } },
        next: { opacity: 1, x: 0, scale: 0.95, transition: { duration: 0.7, ease: 'easeOut' } },
      }
    : imageVariants;

  return (
    <motion.div
      variants={adjustedVariants}
      initial={false}
      animate={variant}
      style={{
        zIndex,
        position: 'absolute',
        inset: 0,
        backfaceVisibility: 'hidden',
        transformStyle: isMobile ? 'flat' : 'preserve-3d',
      }}
      className="w-full h-full flex items-center justify-center"
    >
      <div className="relative p-4 flex items-center justify-center">
        <img
          src={src}
          alt={alt}
          className="max-h-full max-w-full object-contain relative z-10 shadow-2xl"
          style={{ maxHeight: '75vh', width: 'auto' }}
          onLoad={onImageLoad}
        />
      </div>
    </motion.div>
  );
};

const ParallaxShowcase = () => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const sectionRef = useRef(null);
  const containerRef = useRef(null);
  const ticking = useRef(false);
  const totalImages = images.length;
  const [isMobile, setIsMobile] = useState(false);

  const handleScroll = useCallback(() => {
    if (!sectionRef.current || !containerRef.current) return;
    const scrollTop = window.scrollY;
    const containerTop = containerRef.current.offsetTop;
    const containerHeight = containerRef.current.offsetHeight;
    const viewportHeight = window.innerHeight;

    const relativeScroll = scrollTop - containerTop;
    const scrollRatio = Math.max(0, Math.min(1, relativeScroll / (containerHeight - viewportHeight)));
    const newActiveIndex = Math.min(totalImages - 1, Math.floor(scrollRatio * totalImages));
    if (newActiveIndex !== activeImageIndex) {
      setActiveImageIndex(newActiveIndex);
    }

    if (scrollTop >= containerTop && scrollTop < containerTop + containerHeight - viewportHeight) {
      sectionRef.current.style.position = 'fixed';
      sectionRef.current.style.top = '0';
    } else if (scrollTop >= containerTop + containerHeight - viewportHeight) {
      sectionRef.current.style.position = 'absolute';
      sectionRef.current.style.top = `${containerHeight - viewportHeight}px`;
    } else {
      sectionRef.current.style.position = 'absolute';
      sectionRef.current.style.top = '0';
    }
    ticking.current = false;
  }, [activeImageIndex, totalImages]);

  const onScroll = () => {
    if (!ticking.current) {
      window.requestAnimationFrame(handleScroll);
      ticking.current = true;
    }
  };

  useEffect(() => {
    const spacerHeight = window.innerHeight * (totalImages + 1);
    if (containerRef.current) {
      containerRef.current.style.height = `${spacerHeight}px`;
    }
    handleScroll();
    window.addEventListener('scroll', onScroll);
    window.addEventListener('resize', onScroll);

    // Check if the device is mobile
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [totalImages, handleScroll]);

  return (
    <>
      <div ref={containerRef} className="relative w-full">
        <div ref={sectionRef} className="w-full h-screen bg-black absolute top-0 left-0">
          <div className="absolute top-8 left-8 z-30 w-32 h-16 md:w-40 md:h-20">
            <Image
              src="/logoWhite.png"
              alt="ASHE Logo"
              fill
              sizes="(max-width: 768px) 100px, 160px"
              className="object-contain"
              priority
            />
          </div>
          <div className="relative w-full h-full flex items-center justify-center p-4 md:p-8">
            <div className="relative w-full h-full max-w-4xl mx-auto perspective-1000">
              <div className="w-full h-full">
                {images.map((src, index) => {
                  const variant =
                    index === activeImageIndex
                      ? 'active'
                      : index < activeImageIndex
                      ? 'prev'
                      : 'next';
                  const zIndex = totalImages - Math.abs(activeImageIndex - index);
                  return (
                    <ParallaxImage
                      key={index}
                      src={src}
                      alt={`Showcase image ${index + 1}`}
                      variant={variant}
                      zIndex={zIndex}
                      onImageLoad={() => {}}
                      isMobile={isMobile}
                    />
                  );
                })}
              </div>
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-50 md:bottom-8">
                {images.map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      idx === activeImageIndex ? 'bg-white scale-125' : 'bg-white/30'
                    }`}
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ParallaxShowcase;
