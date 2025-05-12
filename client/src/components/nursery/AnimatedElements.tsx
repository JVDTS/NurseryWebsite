import { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface AnimatedElementsProps {
  theme: 'hayes' | 'uxbridge' | 'hounslow';
}

export default function AnimatedElements({ theme }: AnimatedElementsProps) {
  const { scrollYProgress } = useScroll();
  const [isMobile, setIsMobile] = useState(false);
  
  // Check if we're on a mobile device to adjust animations
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Define theme-specific colors
  const themeColors = {
    hayes: {
      primary: '#FF6B6B',
      secondary: '#4ECDC4',
      tertiary: '#FFD166'
    },
    uxbridge: {
      primary: '#6A0572',
      secondary: '#AB83A1',
      tertiary: '#F7CAC9'
    },
    hounslow: {
      primary: '#2E7D32',
      secondary: '#81C784',
      tertiary: '#FFF59D'
    }
  };
  
  const colors = themeColors[theme];
  
  // Cloud animation
  const cloudX = useTransform(scrollYProgress, [0, 1], ['-10%', '110%']);
  
  // Sun/moon rotation
  const sunRotate = useTransform(scrollYProgress, [0, 0.5, 1], [0, 180, 360]);
  const sunY = useTransform(scrollYProgress, [0, 0.5, 1], ['0%', '30%', '0%']);
  
  // Balloon vertical movement
  const balloonY = useTransform(scrollYProgress, [0, 0.3, 0.6, 1], ['0%', '-20%', '-10%', '-30%']);
  
  // Animal movements (different for each theme)
  const animalX = useTransform(scrollYProgress, [0, 0.4, 0.6, 1], ['-20%', '30%', '60%', '120%']);
  const animalY = useTransform(scrollYProgress, [0, 0.5, 1], ['0%', '-10%', '0%']);
  
  // Butterfly/bird random flight path
  const flyingX = useTransform(scrollYProgress, [0, 0.2, 0.4, 0.6, 0.8, 1], [
    '0%', '10%', '-5%', '15%', '5%', '20%'
  ]);
  const flyingY = useTransform(scrollYProgress, [0, 0.2, 0.4, 0.6, 0.8, 1], [
    '0%', '-10%', '-5%', '-15%', '-5%', '-20%'
  ]);
  
  // Rainbow animation
  const rainbowScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.7, 1, 0.7]);
  const rainbowOpacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);
  
  // Theme specific elements
  const renderThemeSpecificElements = () => {
    switch (theme) {
      case 'hayes':
        return (
          <>
            {/* Art brush that follows scroll */}
            <motion.div 
              className="fixed bottom-20 right-10 z-50 hidden md:block"
              style={{ 
                x: useTransform(scrollYProgress, [0, 1], ['-100px', '100px']),
                rotate: useTransform(scrollYProgress, [0, 0.5, 1], [0, 45, 0])
              }}
            >
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 10C20 13.3137 17.3137 16 14 16C14 16 14 16 12 18C10 16 10 16 10 16C6.68629 16 4 13.3137 4 10C4 6.68629 6.68629 4 10 4H14C17.3137 4 20 6.68629 20 10Z" fill={colors.primary} />
                <path d="M12 16V22" stroke={colors.secondary} strokeWidth="2" strokeLinecap="round" />
              </svg>
            </motion.div>
            
            {/* Floating musical notes */}
            <motion.div 
              className="fixed top-1/4 left-10 z-50 hidden md:block"
              style={{ 
                y: useTransform(scrollYProgress, [0, 0.5, 1], ['0vh', '-10vh', '-5vh'])
              }}
            >
              <svg width="30" height="30" viewBox="0 0 24 24" fill={colors.tertiary}>
                <path d="M9 17V5L20 3V15" />
                <circle cx="6" cy="17" r="3" />
                <circle cx="17" cy="15" r="3" />
              </svg>
            </motion.div>
            
            <motion.div 
              className="fixed top-1/3 right-20 z-50 hidden md:block"
              style={{ 
                y: useTransform(scrollYProgress, [0, 0.5, 1], ['0vh', '-15vh', '-8vh'])
              }}
            >
              <svg width="25" height="25" viewBox="0 0 24 24" fill={colors.secondary}>
                <path d="M9 17V5L20 3V15" />
                <circle cx="6" cy="17" r="3" />
                <circle cx="17" cy="15" r="3" />
              </svg>
            </motion.div>
          </>
        );
      
      case 'uxbridge':
        return (
          <>
            {/* Floating stars */}
            <motion.div 
              className="fixed top-1/4 left-10 z-50 hidden md:block"
              style={{ 
                y: balloonY,
                rotate: useTransform(scrollYProgress, [0, 1], [0, 360])
              }}
            >
              <svg width="30" height="30" viewBox="0 0 24 24" fill={colors.tertiary}>
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </motion.div>
            
            <motion.div 
              className="fixed top-1/3 right-12 z-50 hidden md:block"
              style={{ 
                y: useTransform(scrollYProgress, [0, 0.5, 1], ['0vh', '-8vh', '-12vh']),
                rotate: useTransform(scrollYProgress, [0, 1], [0, -360])
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill={colors.primary}>
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </motion.div>
            
            {/* Floating planet */}
            <motion.div 
              className="fixed bottom-1/4 right-10 z-50 hidden md:block"
              style={{ 
                y: useTransform(scrollYProgress, [0, 1], ['5vh', '-10vh']),
                rotate: sunRotate
              }}
            >
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" fill={colors.secondary} />
                <circle cx="8" cy="10" r="2" fill={colors.tertiary} />
                <circle cx="15" cy="13" r="3" fill={colors.tertiary} />
              </svg>
            </motion.div>
          </>
        );
      
      case 'hounslow':
        return (
          <>
            {/* Flying bird */}
            <motion.div 
              className="fixed top-1/4 left-10 z-50 hidden md:block"
              style={{ 
                x: animalX,
                y: animalY
              }}
            >
              <svg width="35" height="35" viewBox="0 0 24 24" fill={colors.tertiary}>
                <path d="M22 2L15 9L12 6L2 16L3 17L12 8L15 11L23 3L22 2Z" />
              </svg>
            </motion.div>
            
            {/* Floating leaf */}
            <motion.div 
              className="fixed top-1/3 right-12 z-50 hidden md:block"
              style={{ 
                y: useTransform(scrollYProgress, [0, 0.5, 1], ['0vh', '-15vh', '-30vh']),
                rotate: useTransform(scrollYProgress, [0, 0.5, 1], [0, 45, 90]),
                x: useTransform(scrollYProgress, [0, 0.5, 1], ['0vw', '-5vw', '-8vw'])
              }}
            >
              <svg width="25" height="25" viewBox="0 0 24 24" fill={colors.primary}>
                <path d="M12 2C7.03 2 3 6.03 3 11C3 14.03 4.53 16.82 7 18.46V22H9V19H11V22H13V19H15V22H17V18.46C19.47 16.82 21 14.03 21 11C21 6.03 16.97 2 12 2M12 4C14.12 4 16 5.88 16 8C16 10.12 14.12 12 12 12C9.88 12 8 10.12 8 8C8 5.88 9.88 4 12 4" />
              </svg>
            </motion.div>
            
            {/* Butterfly */}
            <motion.div 
              className="fixed bottom-1/4 left-20 z-50 hidden md:block"
              style={{ 
                y: flyingY,
                x: flyingX,
                rotate: useTransform(scrollYProgress, [0, 0.5, 1], [-10, 5, -10])
              }}
            >
              <svg width="30" height="30" viewBox="0 0 24 24" fill={colors.secondary}>
                <path d="M13,14C9.64,14 8.54,15.35 8.18,16.24C9.25,16.7 10,17.76 10,19A3,3 0 0,1 7,22A3,3 0 0,1 4,19C4,17.69 4.83,16.58 6,16.17V7.83C4.83,7.42 4,6.31 4,5A3,3 0 0,1 7,2A3,3 0 0,1 10,5C10,6.31 9.17,7.42 8,7.83V13.12C8.88,12.47 10.16,12 12,12C14.67,12 15.56,10.66 15.85,9.77C14.77,9.32 14,8.25 14,7A3,3 0 0,1 17,4A3,3 0 0,1 20,7C20,8.34 19.12,9.5 17.91,9.86C17.65,11.29 16.68,14 13,14M7,18A1,1 0 0,0 6,19A1,1 0 0,0 7,20A1,1 0 0,0 8,19A1,1 0 0,0 7,18M7,4A1,1 0 0,0 6,5A1,1 0 0,0 7,6A1,1 0 0,0 8,5A1,1 0 0,0 7,4M17,6A1,1 0 0,0 16,7A1,1 0 0,0 17,8A1,1 0 0,0 18,7A1,1 0 0,0 17,6Z" />
              </svg>
            </motion.div>
          </>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="pointer-events-none">
      {/* Common elements across all themes */}
      
      {/* Floating cloud */}
      <motion.div 
        className="fixed top-20 z-50 hidden md:block"
        style={{ x: cloudX }}
      >
        <svg width="100" height="60" viewBox="0 0 24 24" fill="white" stroke="#E0E0E0">
          <path d="M4 14C4 12.8954 4.89543 12 6 12C6 9.79086 7.79086 8 10 8C12.2091 8 14 9.79086 14 12C15.1046 12 16 12.8954 16 14C16 15.1046 15.1046 16 14 16H6C4.89543 16 4 15.1046 4 14Z" />
        </svg>
      </motion.div>
      
      {/* Sun/moon that rotates as you scroll */}
      <motion.div 
        className="fixed top-20 right-20 z-50 hidden md:block"
        style={{ 
          rotate: sunRotate,
          y: sunY
        }}
      >
        <svg width="60" height="60" viewBox="0 0 24 24" fill={colors.tertiary}>
          <circle cx="12" cy="12" r="6" />
          <path d="M12 2V4M12 20V22M2 12H4M20 12H22M6 6L7 7M17 17L18 18M18 6L17 7M7 17L6 18" 
                stroke={colors.tertiary} strokeWidth="2" />
        </svg>
      </motion.div>
      
      {/* Hot air balloon */}
      <motion.div 
        className="fixed top-40 right-10 z-50 hidden md:block"
        style={{ y: balloonY }}
      >
        <svg width="40" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 4C8.13 4 5 7.13 5 11C5 14.17 7.15 16.8 9 17.74V22H15V17.74C16.85 16.8 19 14.17 19 11C19 7.13 15.87 4 12 4Z" 
                fill={colors.primary} />
          <path d="M11 19H13V22H11V19Z" fill={colors.secondary} />
        </svg>
      </motion.div>
      
      {/* Rainbow that gets bigger as you scroll down then fades */}
      <motion.div 
        className="fixed bottom-10 right-10 z-50 hidden md:block"
        style={{ 
          scale: rainbowScale,
          opacity: rainbowOpacity
        }}
      >
        <svg width="80" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4.2 17.78C4.08 17.45 4 17 4 16.5C4 13.5 7.58 11 12 11C16.42 11 20 13.5 20 16.5C20 17 19.92 17.45 19.8 17.78" 
                stroke="#FF0000" strokeWidth="2" />
          <path d="M6.2 17.78C6.08 17.45 6 17 6 16.5C6 14.6 8.69 13 12 13C15.31 13 18 14.6 18 16.5C18 17 17.92 17.45 17.8 17.78" 
                stroke="#FF7F00" strokeWidth="2" />
          <path d="M8.2 17.78C8.08 17.45 8 17 8 16.5C8 15.7 9.79 15 12 15C14.21 15 16 15.7 16 16.5C16 17 15.92 17.45 15.8 17.78" 
                stroke="#FFFF00" strokeWidth="2" />
          <path d="M10.2 17.78C10.08 17.45 10 17 10 16.5C10 16.22 10.9 16 12 16C13.1 16 14 16.22 14 16.5C14 17 13.92 17.45 13.8 17.78" 
                stroke="#00FF00" strokeWidth="2" />
        </svg>
      </motion.div>
      
      {/* Theme specific animated elements */}
      {renderThemeSpecificElements()}
    </div>
  );
}