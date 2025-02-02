import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import Image from 'next/image';
import AnimatedNumber from '../components/AnimatedNumber';

// Lazy load the LoadingSpinner component with suspense
const LoadingSpinner = dynamic(() => import('../components/LoadingScreen'), {
  suspense: true,
});

// Common animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.7, ease: 'easeOut' } },
};

// Staggered container for the value pillars
const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

export default function About() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    // Simulate a loading delay
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
  
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <Head>
        <title>About Us | ASHE – Where Heritage Ignites Bold Rebellion</title>
        <meta
          name="description"
          content="Step into the world of ASHE: a legacy of timeless craftsmanship reimagined for the modern rebel. Discover how tradition fuels our fearless designs."
        />
      </Head>
      <Layout>
        <div className="min-h-screen bg-white relative">
          {/* Heritage Header */}
          <header className="h-screen flex items-center justify-center p-8 relative">
            <div className="absolute inset-0 z-0">
              <Image
                src="/heritage-hero.jpeg"
                alt="Archival photo of a master tailor at work"
                fill
                objectFit="cover"
                className="opacity-20"
                priority
              />
            </div>
            <motion.div
              className="max-w-6xl mx-auto text-center"
              initial="hidden"
              animate="visible"
              variants={fadeIn}
            >
              <div className="mb-12">
                <div className="h-px bg-black/20 w-32 mx-auto mb-8" />
                <h4 className="text-xl uppercase tracking-widest text-gray-500">
                  An Inherited Story
                </h4>
              </div>
              <h1 className="text-6xl md:text-8xl font-black mb-8 leading-none">
                <span className="block">Crafting Distinction</span>
                <span className="text-gray-400">Since Day One</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto">
                Where timeless tailoring meets modern rebellion. At ASHE, every stitch whispers
                heritage while defying the ordinary.
              </p>
            </motion.div>
          </header>

          {/* Legacy Story */}
          <main>
            <section className="min-h-screen py-32 px-8 border-t border-black/10">
              <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
                <motion.div
                  className="space-y-8"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeInUp}
                >
                  <div className="text-5xl md:text-6xl font-black">
                    <p className="mb-4">Be Distinct</p>
                    <div className="h-1 w-24 bg-black" />
                  </div>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    Born from generations of sartorial mastery, ASHE honors tradition by
                    disrupting the status quo. Every collection is a fusion of classic techniques
                    and audacious design, meant for those who dare to be different.
                  </p>
                </motion.div>
                <motion.div
                  className="relative aspect-square bg-gray-50 group overflow-hidden"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeIn}
                >
                  {/* Image */}
                  <img
                    src="/sewing.jpeg"
                    className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                    alt="Close-up of sewing in progress"
                  />
                  {/* Overlay Text */}
                  <div className="absolute inset-0 p-4 flex flex-col justify-end items-center text-white mix-blend-difference">
                    <blockquote className="w-full max-w-xl mx-auto text-center text-lg sm:text-xl md:text-2xl italic leading-relaxed drop-shadow-lg">
                      “My grandmother’s hands taught me that true elegance lives in the seams.”
                    </blockquote>
                    <p className="mt-2 sm:mt-4 text-center text-sm sm:text-base md:text-lg font-light drop-shadow">
                      - Omar Alibi, Founder
                    </p>
                  </div>
                </motion.div>
              </div>
            </section>

            {/* Value Pillars */}
            <section className="min-h-screen py-32 px-8 bg-black text-white">
              <div className="max-w-6xl mx-auto">
                <motion.h2
                  className="text-4xl md:text-6xl font-black mb-16 text-center"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeIn}
                >
                  Our Inherited Code
                </motion.h2>
                <motion.div
                  className="grid md:grid-cols-3 gap-8"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={staggerContainer}
                >
                  {[
                    {
                      title: 'Boldness',
                      symbol: '⟡',
                      desc: 'Defying trends through fearless innovation',
                    },
                    {
                      title: 'Elegance',
                      symbol: '⊛',
                      desc: 'Timeless sophistication woven into every detail',
                    },
                    {
                      title: 'Confidence',
                      symbol: '◬',
                      desc: 'Empowering the self-assured, one piece at a time',
                    },
                  ].map((value, index) => (
                    <motion.div
                      key={value.title}
                      className="p-8 border border-white/10 hover:border-white/20 transition-all h-full"
                      variants={{
                        hidden: { opacity: 0, y: 30 },
                        visible: {
                          opacity: 1,
                          y: 0,
                          transition: { delay: index * 0.15, duration: 0.6 },
                        },
                      }}
                    >
                      <div className="text-5xl mb-6">{value.symbol}</div>
                      <h3 className="text-3xl font-medium mb-4">{value.title}</h3>
                      <p className="text-gray-400">{value.desc}</p>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </section>

            {/* Modern Manifesto */}
            <section className="min-h-screen py-32 px-8 bg-gray-50">
              <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
                {/* Text Content */}
                <motion.div
                  className="space-y-8"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeInUp}
                >
                  <h2 className="text-5xl md:text-6xl font-black">
                    <span className="block mb-4">The ASHE</span>
                    <span className="text-gray-400">CREED</span>
                  </h2>
                  <div className="space-y-6">
                    <p className="text-lg text-gray-600 leading-relaxed">
                      We reject the emptiness of fast fashion. Our garments are crafted to
                      transcend fleeting trends and transform into heirlooms. Every collection is a
                      chapter in our ongoing story of sartorial rebellion.
                    </p>
                    <div className="h-px bg-black/20 w-48" />
                    <p className="text-lg text-gray-600 leading-relaxed">
                      Wearing ASHE means carrying forward a legacy of distinction—where every cut
                      commands attention and every fabric speaks of heritage.
                    </p>
                  </div>
                </motion.div>

                {/* Quote Container */}
                <motion.div
                  className="relative aspect-square bg-gray-900 text-white flex items-center justify-center text-center p-12 rounded-lg shadow-lg"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeIn}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="text-3xl italic leading-relaxed">
                    "We don't just make clothes.<br />
                    We craft armor for<br />
                    the distinctly bold."
                  </div>
                </motion.div>
              </div>
            </section>

            {/* Community Connection Section */}
            <section className="min-h-screen py-32 px-8 bg-gradient-to-b from-white to-gray-100">
              <div className="max-w-6xl mx-auto text-center">
                <motion.div
                  className="text-4xl md:text-6xl font-extrabold mb-16 tracking-tight"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
                  }}
                >
                  <span className="block">Wear Your Story</span>
                  <span className="text-gray-500 block mt-2">
                    For the Bold. For the Fearless.
                  </span>
                </motion.div>

                <motion.div
                  className="grid md:grid-cols-3 gap-8 mb-16"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeIn}
                >
                  {['Define', 'Empower', 'Transform'].map((item, index) => (
                    <motion.div
                      key={item}
                      className="p-6 border border-gray-200 rounded-lg hover:shadow-xl transition-shadow cursor-pointer"
                      whileHover={{ y: -4 }}
                      variants={{
                        hidden: { opacity: 0, y: 20 },
                        visible: {
                          opacity: 1,
                          y: 0,
                          transition: { delay: index * 0.1, duration: 0.6, ease: 'easeOut' },
                        },
                      }}
                    >
                      <div className="text-3xl mb-4">{['🔥', '⚡', '🌟'][index]}</div>
                      <h3 className="text-xl font-bold mb-2">{item}</h3>
                      <p className="text-gray-600 text-sm">
                        {[
                          'Stand out with statement pieces',
                          'Unleash your inner power',
                          'Elevate your everyday look',
                        ][index]}
                      </p>
                    </motion.div>
                  ))}
                </motion.div>

                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={{
                    hidden: { scale: 0.95, opacity: 0 },
                    visible: { scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 50 } },
                  }}
                >
                  <motion.button
                    onClick={() => router.push('/contact')}
                    className="px-12 py-4 bg-black text-white rounded-full text-lg font-bold hover:bg-gray-800 transition-all relative overflow-hidden"
                    whileHover={{ scale: 1.03, backgroundColor: '#111' }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="relative z-10 flex items-center justify-center">
                      Contact Us
                      <span className="ml-3 opacity-80 transition-opacity group-hover:opacity-100">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                      </span>
                    </span>
                  </motion.button>
                </motion.div>

                <motion.div
                  className="mt-8 text-gray-600 flex flex-col sm:flex-row justify-center items-center gap-2"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeIn}
                >
                  <span className="text-sm">Join</span>
                  <div className="text-2xl font-bold text-black">
                    <AnimatedNumber value={12456} duration={2} />
                  </div>
                  <span className="text-sm">fashion trailblazers</span>
                </motion.div>
              </div>
            </section>
          </main>

          {/* Back to Top Button */}
          {showScrollTop && (
          <motion.button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-8 right-8 bg-[#46c7c7] text-white rounded-full p-3 shadow-lg hover:bg-gray-800 transition"
          whileHover={{ scale: 1.1 }}
          aria-label="Back to Top"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 15l7-7 7 7"
            />
          </svg>
        </motion.button>
          )}
        </div>
      </Layout>
    </>
  );
}
