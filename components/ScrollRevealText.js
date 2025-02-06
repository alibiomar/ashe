import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const ScrollRevealText = ({ text, className }) => {
  const textRef = useRef(null);

  useEffect(() => {
    if (textRef.current) {
      const words = textRef.current.querySelectorAll("span");

      gsap.fromTo(
        words,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.1,
          duration: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: textRef.current,
            start: "top 80%",
            end: "bottom 60%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }
  }, [text]);

  // Splitting text into individual words wrapped in <span>
  const splitTextIntoSpans = (text) => {
    return text.split(" ").map((word, index) => (
      <span key={index} className="inline-block opacity-0">
        {word}&nbsp;
      </span>
    ));
  };

  return (
    <p ref={textRef} className={`overflow-hidden ${className}`}>
      {splitTextIntoSpans(text)}
    </p>
  );
};

export default ScrollRevealText;
