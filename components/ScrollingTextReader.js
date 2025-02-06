import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

const ScrollingTextReader = ({ text, speed = 30, className = '' }) => {
    const [displayedText, setDisplayedText] = useState('');
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        if (displayedText.length < text.length) {
            const timer = setTimeout(() => {
                setDisplayedText(text.slice(0, displayedText.length + 1));
            }, 1000 / speed);
            return () => clearTimeout(timer);
        } else {
            setIsComplete(true);
        }
    }, [displayedText, text, speed]);

    return (
        <motion.p 
            className={`relative ${className}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            {displayedText}
            {!isComplete && (
                <span className="animate-pulse ml-1 inline-block">|</span>
            )}
        </motion.p>
    );
};

export default ScrollingTextReader;