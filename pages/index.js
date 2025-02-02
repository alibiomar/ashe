import { useEffect, useState, Suspense, lazy } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import Layout from '../components/Layout';
import TextPressure from '../components/TextPressure';
import Image from 'next/image';
import ErrorBoundary from '../components/ErrorBoundary';
import LoadingSpinner from '../components/LoadingScreen';
import { motion, AnimatePresence } from 'framer-motion';

// Lazy-loaded components for better performance
const Testimonial = lazy(() => import('../components/Testimonial'));
const GridDistortion = lazy(() => import('../components/GridDistortion'));
const NewsletterSignup = lazy(() => import('../components/NewsletterSignup'));

export default function Home() {
  const [user, setUser] = useState(null);
  const [firstName, setFirstName] = useState('');
  const [testimonials, setTestimonials] = useState([]);
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Animation variants for Framer Motion
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        when: "beforeChildren"
      }
    }
  };

  const childVariants = {
    hidden: { y: 40, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 120, damping: 20 }
    }
  };

  // Listen for authentication state changes and fetch user data if logged in.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          setFirstName(userDoc.exists() ? userDoc.data().firstName || 'Valued User' : 'Valued User');
        } catch (error) {
          console.error('Error fetching user data:', error);
          setError('Failed to load user data');
          setFirstName('Valued User');
        }
      } else {
        setUser(null);
        setFirstName('');
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch testimonials from Firestore
  useEffect(() => {
    const fetchTestimonials = async () => {
      setLoading(true);
      try {
        const testimonialsCollection = collection(db, 'testimonials');
        const querySnapshot = await getDocs(testimonialsCollection);
        const testimonialsList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name || 'Anonymous',
          review: doc.data().review || 'No review provided',
          rating: Number(doc.data().rating) || 0,
        }));
        setTestimonials(testimonialsList);
      } catch (error) {
        console.error('Error fetching testimonials:', error);
        setError('Failed to load testimonials');
      } finally {
        setLoading(false);
      }
    };
    fetchTestimonials();
  }, []);

  // Auto-rotate testimonials every 5 seconds
  useEffect(() => {
    if (testimonials.length > 1) {
      const interval = setInterval(() => {
        setCurrentTestimonialIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [testimonials.length]);

  // Handle loading and error states
  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-500 text-xl">{error}</p>
      </div>
    );
  }

  return (
    <Layout>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="overflow-hidden"
      >
        {/* Hero Section */}
        <section className="relative w-full h-[92vh] mb-32 overflow-hidden">
          <motion.div
            className="absolute inset-0"
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <Image
              src="/header.jpeg"
              alt="Fashion Header"
              fill
              priority
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 100vw"
            />
          </motion.div>
          
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/30">
            <motion.div
              className="container mx-auto px-4 h-[80vh] flex flex-col justify-end"
              variants={childVariants}
            >
              <TextPressure
                text={user ? `Welcome, ${firstName}!` : 'Welcome to ASHE'}
                flex={true}
                alpha={false}
                stroke={false}
                width={true}
                weight={true}
                italic={true}
                textColor="#ffffff"
                strokeColor="#ff0000"
                minFontSize={32}
                className=" pt-16"
              />
              <motion.p
                className="text-sm md:text-xl text-white/90 font-light max-w-2xl mx-auto text-center mb-5"
                variants={childVariants}
              >
                Crafting timeless elegance through meticulous tailoring and sustainable practices
              </motion.p>
            </motion.div>
          </div>
        </section>

        {/* Product Sections */}
        <section className="container mx-auto px-4 mb-32 grid grid-cols-1 md:grid-cols-2 gap-8">
          {['Featured', 'New Arrivals'].map((section, idx) => (
            <motion.div
              key={section}
              className={`group relative p-8 overflow-hidden ${idx === 0 ? 'bg-white' : 'bg-black text-white'}`}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px 0px -100px 0px" }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
            >
              <div className="relative h-80 mb-8 overflow-hidden">
                <Image
                  src={idx === 0 ? '/featured.jpg' : '/new-arrivals.jpg'}
                  alt={section}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              
              <h2 className="text-4xl font-semibold mb-4">{section}</h2>
              <p className={`text-lg mb-6 ${idx === 0 ? 'text-gray-600' : 'text-gray-300'}`}>
                {idx === 0 
                  ? 'Curated selection of signature pieces' 
                  : 'Discover our latest seasonal offerings'}
              </p>
              <a
                href="/products"
                className="inline-flex items-center gap-2 text-lg font-medium hover:gap-3 transition-all"
              >
                Explore Collection
                <span aria-hidden="true" className="text-xl">→</span>
              </a>
            </motion.div>
          ))}
        </section>

        {/* Grid Distortion Section */}
        <ErrorBoundary fallback="Failed to load visual experience">
          <motion.section
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "0px 0px -200px 0px" }}
            className="relative h-[80vh] mb-24"
          >
            <Suspense fallback={<div className="absolute inset-0 bg-gray-100 animate-pulse" />}>
              <GridDistortion
                imageSrc="https://picsum.photos/1920/1080?grayscale"
                grid={12}
                mouse={0.05}
                strength={0.12}
                relaxation={0.95}
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <h3 className="text-4xl md:text-6xl font-bold text-white mix-blend-difference">
                  Beyond Fashion
                </h3>
              </div>
            </Suspense>
          </motion.section>
        </ErrorBoundary>

        {/* Testimonials Section */}
        <section className="px-4 mb-24 flex flex-col justify-center items-center">
          <motion.h2
            className="text-4xl font-bold text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Voices of Elegance
          </motion.h2>

          <div className="relative w-full max-w-3xl min-h-[50vh]">
            <AnimatePresence mode="wait">
              {testimonials.map(
                (testimonial, index) =>
                  currentTestimonialIndex === index && (
                    <motion.div
                      key={testimonial.id}
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      transition={{ duration: 0.5 }}
                      className="w-full"
                    >
                      <ErrorBoundary
                        fallback={
                          <div className="h-full flex items-center justify-center text-red-500">
                            Failed to load testimonial
                          </div>
                        }
                      >
                        <Suspense
                          fallback={
                            <div className="h-full bg-gray-50 animate-pulse rounded-2xl" />
                          }
                        >
                          <Testimonial testimonial={testimonial} />
                        </Suspense>
                      </ErrorBoundary>
                    </motion.div>
                  )
              )}
            </AnimatePresence>
          </div>

          {/* Navigation Dots */}
          <div className="flex justify-center gap-3 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentTestimonialIndex(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentTestimonialIndex ? 'bg-black' : 'bg-gray-300'
                }`}
                aria-label={`View testimonial ${index + 1}`}
              />
            ))}
          </div>
        </section>

        {/* Newsletter Signup Section */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <Suspense fallback={<div className="h-96 bg-white animate-pulse rounded-2xl" />}>
            <NewsletterSignup />
          </Suspense>
        </motion.section>
      </motion.div>
    </Layout>
  );
}
