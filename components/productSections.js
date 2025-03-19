import React, { memo } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import Image from "next/image";

const ProductSections = memo(() => {
  const sections = [
    {
      title: "New Arrivals",
      description: "Discover our latest seasonal offerings",
      imageUrl: "/showcase/7.avif",
      bgColor: "bg-black",
      textColor: "text-white",
      accentColor: "text-teal-400",
    },
    {
      title: "Curated Essentials",
      description: "Refined pieces for the confident",
      imageUrl: "/showcase/16.avif",
      bgColor: "bg-white",
      textColor: "text-black",
      accentColor: "text-teal-400",
    },
  ];

  return (
    <section className="min-h-screen flex items-center pb-36">
      <div className="container mx-auto justify-around w-full">
        <div className="grid md:grid-cols-2 gap-8">
          {sections.map((section, idx) => {
            const { ref, inView } = useInView({
              triggerOnce: true, // Ensures animation runs only once
              threshold: 0.4, // Triggers when 20% of element is in view
            });

            return (
              <motion.article
                key={section.title}
                ref={ref}
                initial={{ opacity: 0, y: 40, rotateX: 5 }}
                animate={inView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
                transition={{
                  duration: 1,
                  ease: [0.22, 1, 0.36, 1],
                  delay: idx * 0.1,
                }}
                className="relative group"
              >
                <div
                  className={`relative h-[640px] ${section.bgColor} overflow-hidden`}
                >
                  <div className="absolute inset-0 p-12 flex flex-col justify-between">
                    {/* Header Section */}
                    <header>
                      <motion.h2
                        className={`text-6xl font-bold mb-6 ${section.textColor} tracking-tighter`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={inView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.6, delay: idx * 0.2 }}
                      >
                        {section.title.split(" ").map((word, i) => (
                          <motion.span
                            key={i}
                            className="block leading-none"
                            initial={{ y: 20, opacity: 0 }}
                            animate={inView ? { y: 0, opacity: 1 } : {}}
                            transition={{ duration: 0.4, delay: i * 0.1 + 0.2 }}
                          >
                            {word}
                          </motion.span>
                          
                        ))}
                                    
                      </motion.h2>
                      <motion.p
                        className={`text-lg ${section.textColor} opacity-80 mb-8`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={inView ? { opacity: 0.8, y: 0 } : {}}
                        transition={{ duration: 0.5, delay: 0.3 }}
                      >
                        {section.description}
                      </motion.p>
                    </header>

                    {/* Media Container */}
                    <motion.div
                      className="relative flex-1 border-2 border-white/20 overflow-hidden"
                      initial={{ scale: 1.1 }}
                      animate={inView ? { scale: 1 } : {}}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Image
                        src={section.imageUrl}
                        alt={`${section.title} collection`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                        priority
                      />
                      <div className="absolute inset-0 bg-black/0" />
                    </motion.div>

                    {/* Footer Section */}
                    <footer className="mt-12 flex justify-between items-center">
                      <motion.a
                        href="/products"
                        className={`text-lg font-medium ${section.textColor} hover:${section.accentColor} transition-colors duration-300 flex items-center gap-2`}
                        animate={inView ? { x: 0 } : {}}
                        whileHover={{ x: 5 }}
                        transition={{ duration: 0.3 }}
                      >
                        Explore Collection
                        <motion.span
                          className="inline-block"
                          initial={{ x: 0 }}
                          whileHover={{ x: 5 }}
                          transition={{
                            repeat: Infinity,
                            duration: 1.5,
                            repeatType: "mirror",
                          }}
                        >
                          →
                        </motion.span>
                      </motion.a>
                      <motion.span
                        className={`text-sm ${section.textColor} opacity-70`}
                        animate={inView ? { scale: 1 } : {}}
                        whileHover={{ scale: 1.1 }}
                      >
                        {String(idx + 1).padStart(2, "0")}
                      </motion.span>
                    </footer>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
});

export default ProductSections;
