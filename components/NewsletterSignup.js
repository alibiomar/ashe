import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { useInView } from 'react-intersection-observer';

const NewsletterSignup = ({ 
  title = "Join Our Newsletter", 
  subtitle = "Get exclusive access to premium content and special offers"
}) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');
  const [submissionAttempts, setSubmissionAttempts] = useState(0);
  const [lastSubmissionTime, setLastSubmissionTime] = useState(0);
  const inputRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);
  const { ref, inView } = useInView({
    triggerOnce: true,
    initialInView: true,
  });
  
  // Hidden honeypot field (bots often fill this out, humans don't see it)
  const [honeypot, setHoneypot] = useState('');

  useEffect(() => {
    if (status !== 'loading' && status !== 'idle') {
      const timer = setTimeout(() => setStatus('idle'), 3000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  // Add a client-side timer to prevent too many submissions
  const isRateLimited = () => {
    const now = Date.now();
    const timeSinceLastSubmission = now - lastSubmissionTime;
    const minTimeBetweenSubmissions = 3000; // 3 seconds
    
    if (submissionAttempts > 5 && timeSinceLastSubmission < 60000) {
      // More than 5 attempts within a minute
      return true;
    }
    
    if (timeSinceLastSubmission < minTimeBetweenSubmissions) {
      return true;
    }
    
    return false;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if honeypot is filled (bot detection)
    if (honeypot) {
      console.log("Bot detected");
      // Pretend success but don't actually submit
      setStatus('success');
      return;
    }
    
    // Rate limiting check
    if (isRateLimited()) {
      setStatus('rate_limited');
      return;
    }
    
    // Track submission attempt
    setSubmissionAttempts(prev => prev + 1);
    setLastSubmissionTime(Date.now());

    // Email validation with stricter regex
    if (!email || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
      setStatus('invalid');
      return;
    }

    // Domain validation - block disposable email domains (example list)
    const disposableDomains = ['mailinator.com', 'tempmail.com', 'guerrillamail.com', 'yopmail.com', 
                              'temp-mail.org', 'fake-email.com', 'throwawaymail.com', '10minutemail.com'];
    const emailDomain = email.split('@')[1].toLowerCase();
    if (disposableDomains.includes(emailDomain)) {
      setStatus('disposable_email');
      return;
    }

    setStatus('loading');
    try {
      // Check if email already exists
      const q = query(collection(db, 'newsletter_signups'), where("email", "==", email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        setStatus('exists');
        return;
      }

      // Add timestamp, IP hash, and client info for review
      await addDoc(collection(db, 'newsletter_signups'), {
        email,
        timestamp: serverTimestamp(),
        userAgent: window.navigator.userAgent, // Could be hashed for privacy
        submissionAttempts,
      });
      
      setStatus('success');
      setEmail('');
      setTimeout(() => inputRef.current?.blur(), 1000);
    } catch (error) {
      console.error("Newsletter signup error:", error);
      setStatus('error');
    }
  };

  return (
    <div className="w-full py-24 flex items-center justify-center bg-black p-8 overflow-x-hidden" >
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left Section: Animated Newsletter */}
        <motion.div 
          className="space-y-6"
          initial={{ opacity: 0, x: -50 }}
          animate={inView ? { opacity: 1, x: 0 } : {}} 
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <h2 className="text-5xl font-black tracking-tighter text-white">
            {title}
          </h2>
          <p className="text-xl text-gray-300">
            {subtitle}
          </p>
          <motion.div ref={ref}
            className="w-24 h-2 bg-[#46c7c7] "
            initial={{ scaleX: 0 }}
            animate={inView ? { scaleX: 1 } : {}} 
            transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
          />
        </motion.div>

        {/* Right Section: Input and Button */}
        <motion.div 
          className="space-y-4"
          initial={{ opacity: 0, x: 50 }}
          animate={inView ? { opacity: 1, x: 0 } : {}} 
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <form onSubmit={handleSubmit} className="space-y-4" encType="application/x-www-form-urlencoded">
            <div className="relative">
              <input
                ref={inputRef}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="Enter your email"
                required
                className="w-full px-6 py-4 text-lg bg-white/10 backdrop-blur-sm border-2 border-transparent focus:border-[#46c7c7] focus:outline-none text-white placeholder-gray-400 transition-all"
                aria-invalid={status === 'invalid'}
              />
              <motion.div 
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: isFocused
                    ? 'linear-gradient(45deg, rgba(70,199,199,0.1) 0%, rgba(70,199,199,0.05) 100%)'
                    : 'transparent',
                }}
                animate={{
                  opacity: isFocused ? 1 : 0,
                }}
                transition={{ duration: 0.3 }}
              />
            </div>
            
            {/* Honeypot field - hidden from humans but bots will fill it */}
            <div style={{ opacity: 0, position: 'absolute', top: '-999px', left: '-999px' }}>
              <input
                type="text"
                name="website" // Common field bots fill out
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                tabIndex="-1"
                autoComplete="off"
              />
            </div>

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full py-4 border-2 border-black font-bold uppercase tracking-wide flex items-center justify-center transition-all bg-[#46c7c7] text-black hover:bg-white hover:text-black focus:bg-white focus:text-black focus:outline-none"
            >
              <span className="relative z-10">
                {status === 'loading' ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin">↻</span> Subscribing...
                  </span>
                ) : (
                  'Subscribe Now'
                )}
              </span>
            </button>
          </form>

          <AnimatePresence>
            {(status !== 'idle' && status !== 'loading') && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`p-4 rounded-lg ${
                  status === 'success' ? 'bg-[#46c7c7]/10 border border-[#46c7c7]/20' : 
                  'bg-[#46c7c7]/10 border border-[#46c7c7]/20'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`flex-shrink-0 ${
                    status === 'success' ? 'text-[#46c7c7]' : 'text-[#46c7c7]'
                  }`}>
                    {
                      status === 'success' ? '✔ Successfully subscribed!' : 
                      status === 'exists' ? '⚠ You are already signed up!' : 
                      status === 'invalid' ? '✖ Invalid email address.' : 
                      status === 'disposable_email' ? '✖ Please use a non-disposable email.' :
                      status === 'rate_limited' ? '⚠ Too many attempts. Please try again later.' :
                      '✖ Subscription failed. Try again.'
                    }
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default NewsletterSignup;