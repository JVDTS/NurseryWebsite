import { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface ParallaxImageProps {
  src: string;
  alt: string;
  className?: string;
  speed?: number;
}

function ParallaxImage({ src, alt, className = "", speed = 0.5 }: ParallaxImageProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], [0, speed * 100]);
  
  return (
    <motion.div 
      ref={ref}
      className={`overflow-hidden rounded-xl shadow-xl h-full ${className}`}
      style={{ y }}
    >
      <div className="h-full w-full overflow-hidden">
        <img 
          src={src} 
          alt={alt} 
          className="w-full h-full object-cover transition-all duration-700 hover:scale-105"
        />
      </div>
    </motion.div>
  );
}

export default function ParallaxSection() {
  const childrenImages = [
    {
      src: "https://images.unsplash.com/photo-1589483232748-515c449a76d6?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
      alt: "Happy children playing outdoors",
      speed: -0.3
    },
    {
      src: "https://images.unsplash.com/photo-1540479859555-17af45c78602?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
      alt: "Children doing arts and crafts",
      speed: 0.2
    },
    {
      src: "https://images.unsplash.com/photo-1516627145497-ae6968895b74?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
      alt: "Children reading together",
      speed: -0.1
    },
    {
      src: "https://images.unsplash.com/photo-1602046521178-a7ef987857e3?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
      alt: "Children playing with educational toys",
      speed: 0.4
    },
    {
      src: "https://images.unsplash.com/photo-1526634332515-d56c5fd16991?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
      alt: "Children in the garden",
      speed: -0.2
    },
    {
      src: "https://images.unsplash.com/photo-1511949860663-92c5c57d48a7?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
      alt: "Children painting",
      speed: 0.3
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-b from-white to-purple-50 relative overflow-hidden">
      <div className="absolute inset-0 z-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-repeat opacity-5"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="font-heading font-bold text-3xl md:text-4xl mb-4 leading-tight">
            Childhood is a <span className="text-purple-600">Journey</span>, Not a Race
          </h2>
          <p className="text-gray-600 mb-8">
            At Coat of Many Colours Nursery, we celebrate every moment of your child's development
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 relative">
          <div className="space-y-6">
            <ParallaxImage 
              src={childrenImages[0].src} 
              alt={childrenImages[0].alt} 
              speed={childrenImages[0].speed}
              className="h-80" 
            />
            <ParallaxImage 
              src={childrenImages[1].src} 
              alt={childrenImages[1].alt} 
              speed={childrenImages[1].speed}
              className="h-64" 
            />
          </div>
          
          <div className="space-y-6 md:mt-12">
            <ParallaxImage 
              src={childrenImages[2].src} 
              alt={childrenImages[2].alt} 
              speed={childrenImages[2].speed}
              className="h-72" 
            />
            <ParallaxImage 
              src={childrenImages[3].src} 
              alt={childrenImages[3].alt} 
              speed={childrenImages[3].speed}
              className="h-80" 
            />
          </div>
          
          <div className="space-y-6">
            <ParallaxImage 
              src={childrenImages[4].src} 
              alt={childrenImages[4].alt} 
              speed={childrenImages[4].speed}
              className="h-80" 
            />
            <ParallaxImage 
              src={childrenImages[5].src} 
              alt={childrenImages[5].alt} 
              speed={childrenImages[5].speed}
              className="h-64" 
            />
          </div>
        </div>
        
        <div className="text-center">
          <a 
            href="#gallery" 
            className="inline-block px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all"
          >
            View Full Gallery
          </a>
        </div>
      </div>
    </section>
  );
}