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

  // If looping, add a clone of the last item at the beginning and the first item at the end.
  const carouselItems = loop
    ? [items[items.length - 1], ...items, items[0]]
    : items;
  // For looping, start at index 1 (the first “real” item); otherwise, start at 0.
  const [currentIndex, setCurrentIndex] = useState(loop ? 1 : 0);
  const x = useMotionValue(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (pauseOnHover && containerRef.current) {
      const container = containerRef.current;
      const handleMouseEnter = () => setIsHovered(true);
      const handleMouseLeave = () => setIsHovered(false);
      container.addEventListener("mouseenter", handleMouseEnter);
      container.addEventListener("mouseleave", handleMouseLeave);
      return () => {
        container.removeEventListener("mouseenter", handleMouseEnter);
        container.removeEventListener("mouseleave", handleMouseLeave);
      };
    }
  }, [pauseOnHover]);

  useEffect(() => {
    if (autoplay && (!pauseOnHover || !isHovered)) {
      const timer = setInterval(() => {
        setCurrentIndex((prev) => {
          // If at the clone of the first item, move to it then reset.
          if (loop && prev === carouselItems.length - 1) {
            return prev + 1; // animate into the clone first
          }
          // Otherwise, move forward (or stay if non-looping)
          if (prev === carouselItems.length - 1) {
            return loop ? 1 : prev;
          }
          return prev + 1;
        });
      }, autoplayDelay);
      return () => clearInterval(timer);
    }
  }, [
    autoplay,
    autoplayDelay,
    isHovered,
    loop,
    carouselItems.length,
    pauseOnHover,
  ]);

  // Use a spring transition unless we're in the middle of a reset.
  const effectiveTransition = isResetting
    ? { duration: 0 }
    : { type: "spring", stiffness: 300, damping: 30 };

  // When the animation completes, check if we've reached a cloned slide.
  const handleAnimationComplete = () => {
    if (loop) {
      // If we're at the beginning clone (index 0), jump to the real last item.
      if (currentIndex === 0) {
        setIsResetting(true);
        // Set x to the real last item position.
        x.set(-items.length * trackItemOffset);
        setCurrentIndex(items.length);
        setTimeout(() => setIsResetting(false), 50);
      }
      // If we're at the end clone (last index), jump to the real first item.
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
      setCurrentIndex((prev) =>
        Math.min(prev + 1, carouselItems.length - 1)
      );
    } else if (offset > 5 || velocity > 500) {
      setCurrentIndex((prev) =>
        Math.max(prev - 1, 0)
      );
    }
  };

  // When not looping, constrain the drag motion.
  const dragProps = loop
    ? {}
    : {
        dragConstraints: {
          left: -trackItemOffset * (carouselItems.length - 1),
          right: 0,
        },
      };

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden p-4 ${
        round
          ? "rounded-full border border-white"
          : "rounded-[24px] border border-[#222]"
      }`}
      style={{
        width: `${baseWidth}px`,
        ...(round && { height: `${baseWidth}px` }),
      }}
    >
      <motion.div
        className="flex"
        drag="x"
        {...dragProps}
        style={{
          width: itemWidth,
          gap: `16px`,
          perspective: 1000,
          perspectiveOrigin: `${
            currentIndex * trackItemOffset + itemWidth / 2
          }px 50%`,
          x,
        }}
        onDragEnd={handleDragEnd}
        animate={{ x: -(currentIndex * trackItemOffset) }}
        transition={effectiveTransition}
        onAnimationComplete={handleAnimationComplete}
      >
        {carouselItems.map((item, index) => {
          const range = [
            -(index + 1) * trackItemOffset,
            -index * trackItemOffset,
            -(index - 1) * trackItemOffset,
          ];
          const outputRange = [90, 0, -90];
          const rotateY = useTransform(x, range, outputRange, { clamp: false });
          return (
            <motion.div
              key={index}
              className={`relative shrink-0 flex flex-col ${
                round
                  ? "items-center justify-center text-center bg-[#060606] border-0"
                  : "items-start justify-between bg-[#222] border border-[#222] rounded-[12px]"
              } overflow-hidden cursor-grab active:cursor-grabbing`}
              style={{
                width: itemWidth,
                height: round ? itemWidth : "100%",
                rotateY: rotateY,
                ...(round && { borderRadius: "50%" }),
              }}
              transition={effectiveTransition}
            >
              <div className={`${round ? "p-0 m-0" : "mb-4 p-5"}`}>
                <span className="flex h-[28px] w-[28px] items-center justify-center rounded-full bg-[#060606]">
                  <MdGppGood className="h-[24px] w-[24px] text-white" />
                </span>
              </div>
              <div className="p-5">
                <div className="mb-1 font-black text-lg text-white">
                  {item.name}
                </div>
                <p className="text-sm text-white">{item.review}</p>
                <div className="flex items-center mt-2">
                  {Array.from({ length: item.rating }).map((_, i) => (
                    <PiStarFourFill
                      key={i}
                      className="h-[16px] w-[16px] text-white"
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
      <div
        className={`flex w-full justify-center ${
          round
            ? "absolute z-20 bottom-12 left-1/2 -translate-x-1/2"
            : ""
        }`}
      >
        <div className="mt-4 flex w-[150px] justify-between px-8">
          {items.map((_, index) => (
            <motion.div
              key={index}
              className={`h-2 w-2 rounded-full cursor-pointer transition-colors duration-150 ${
                // Adjust dot indicator because our real slides start at index 1.
                (currentIndex - 1 + items.length) % items.length === index
                  ? round
                    ? "bg-white"
                    : "bg-[#333333]"
                  : round
                  ? "bg-[#555]"
                  : "bg-[rgba(51,51,51,0.4)]"
              }`}
              animate={{
                scale:
                  (currentIndex - 1 + items.length) % items.length === index
                    ? 1.2
                    : 1,
              }}
              onClick={() => {
                // When clicking a dot, adjust the index to the corresponding "real" slide.
                setCurrentIndex(loop ? index + 1 : index);
              }}
              transition={{ duration: 0.15 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
