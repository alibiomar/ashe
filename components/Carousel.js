import { useEffect, useState, useRef } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { MdGppGood } from "react-icons/md";
import { PiStarFourFill } from "react-icons/pi";

export default function Carousel({
  items = [],
  baseWidth = 300,
  autoplay = false,
  autoplayDelay = 3000,
  pauseOnHover = false,
  loop = false,
  round = false,
}) {
  const containerPadding = 16;
  const itemWidth = baseWidth - containerPadding * 2;
  const trackItemOffset = itemWidth + 16;
  const [currentIndex, setCurrentIndex] = useState(loop ? 1 : 0);
  const x = useMotionValue(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const containerRef = useRef(null);

  const carouselItems = loop
    ? [items[items.length - 1], ...items, items[0]]
    : items;

  useEffect(() => {
    if (pauseOnHover && containerRef.current) {
      const container = containerRef.current;
      container.addEventListener("mouseenter", () => setIsHovered(true));
      container.addEventListener("mouseleave", () => setIsHovered(false));
      return () => {
        container.removeEventListener("mouseenter", () => setIsHovered(true));
        container.removeEventListener("mouseleave", () => setIsHovered(false));
      };
    }
  }, [pauseOnHover]);

  useEffect(() => {
    if (autoplay && (!pauseOnHover || !isHovered)) {
      const timer = setInterval(() => {
        setCurrentIndex((prev) => (prev === carouselItems.length - 1 ? (loop ? 1 : prev) : prev + 1));
      }, autoplayDelay);
      return () => clearInterval(timer);
    }
  }, [autoplay, autoplayDelay, isHovered, loop, carouselItems.length, pauseOnHover]);

  const effectiveTransition = isResetting ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 30 };

  const handleAnimationComplete = () => {
    if (loop) {
      if (currentIndex === 0) {
        setIsResetting(true);
        x.set(-items.length * trackItemOffset);
        setCurrentIndex(items.length);
        setTimeout(() => setIsResetting(false), 50);
      }
      if (currentIndex === carouselItems.length - 1) {
        setIsResetting(true);
        x.set(-trackItemOffset);
        setCurrentIndex(1);
        setTimeout(() => setIsResetting(false), 50);
      }
    }
  };

  const handleDragEnd = (_, info) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;
    if (offset < -5 || velocity < -500) {
      setCurrentIndex((prev) => Math.min(prev + 1, carouselItems.length - 1));
    } else if (offset > 5 || velocity > 500) {
      setCurrentIndex((prev) => Math.max(prev - 1, 0));
    }
  };

  const dragProps = loop
    ? {}
    : {
        dragConstraints: { left: -trackItemOffset * (carouselItems.length - 1), right: 0 },
      };

  return (
    <div ref={containerRef} className={`relative overflow-hidden p-4 ${round ? "rounded-full border border-white" : "rounded-[24px] border border-[#222]"}`} style={{ width: `${baseWidth}px`, ...(round && { height: `${baseWidth}px` }) }}>
      <motion.div
        className="flex"
        drag="x"
        {...dragProps}
        style={{ width: itemWidth, gap: `16px`, x }}
        onDragEnd={handleDragEnd}
        animate={{ x: -(currentIndex * trackItemOffset) }}
        transition={effectiveTransition}
        onAnimationComplete={handleAnimationComplete}
      >
        {carouselItems.map((item, index) => {
          const rotateY = useTransform(x, [-trackItemOffset * (index + 1), -trackItemOffset * index, -trackItemOffset * (index - 1)], [90, 0, -90], { clamp: false });
          return (
            <motion.div key={index} className={`relative shrink-0 flex flex-col ${round ? "items-center justify-center text-center bg-[#060606] border-0" : "items-start justify-between bg-[#222] border border-[#222] rounded-[12px]"} overflow-hidden cursor-grab active:cursor-grabbing`} style={{ width: itemWidth, height: round ? itemWidth : "100%", rotateY, ...(round && { borderRadius: "50%" }) }} transition={effectiveTransition}>
              <div className={`${round ? "p-0 m-0" : "mb-4 p-5"}`}>
                <span className="flex h-[28px] w-[28px] items-center justify-center rounded-full bg-[#060606]">
                  <MdGppGood className="h-[24px] w-[24px] text-white" />
                </span>
              </div>
              <div className="p-5">
                <div className="mb-1 font-black text-lg text-white">{item.name}</div>
                <p className="text-sm text-white">{item.review}</p>
                <div className="flex items-center mt-2">
                  {Array.from({ length: item.rating }).map((_, i) => (
                    <PiStarFourFill key={i} className="h-[16px] w-[16px] text-white" />
                  ))}
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
