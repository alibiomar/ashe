import { useState, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';

const AnimatedNumber = ({ value, duration }) => {
    const [currentValue, setCurrentValue] = useState(0);
    const { ref, inView } = useInView({ triggerOnce: true });

    useEffect(() => {
        if (!inView) return;
        
        const start = Date.now();
        const animate = () => {
            const now = Date.now();
            const progress = Math.min((now - start) / (duration * 1000), 1);
            setCurrentValue(Math.floor(progress * value));
            if (progress < 1) requestAnimationFrame(animate);
        };
        animate();
    }, [inView, value, duration]);

    return <span ref={ref}>{currentValue.toLocaleString()}+</span>;
};

export default AnimatedNumber;
