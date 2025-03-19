import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useState, useEffect } from "react";
import Cloud from "@/assets/illustrations/Cloud";
import { fadeIn, fadeLeft, fadeUp } from "@/lib/animations";

export default function HeroSection() {
  const [ref, inView] = useInView({
    triggerOnce: false,
    threshold: 0.1,
  });
  
  const [currentImage, setCurrentImage] = useState(0);
  const images = [
    {
      src: "https://images.unsplash.com/photo-1526634332515-d56c5fd16991?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      alt: "Happy children playing at nursery"
    },
    {
      src: "https://images.unsplash.com/photo-1516627145497-ae6968895b74?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      alt: "Children engaged in creative activities"
    },
    {
      src: "https://images.unsplash.com/photo-1555791019-72d3af01da82?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      alt: "Children learning and exploring together"
    }
  ];
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage(current => (current + 1) % images.length);
    }, 5000);
    
    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <section id="home" className="pt-24 pb-16 min-h-screen flex flex-col justify-center relative overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 w-full h-full overflow-hidden z-0">
        <div className="absolute inset-0 bg-black opacity-40 z-10"></div> {/* Overlay to darken video and improve text visibility */}
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          className="absolute w-full h-full object-cover"
        >
          <source src="/videos/nursery-background.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>

      <div className="container mx-auto px-4 relative z-20">
        <div className="flex flex-col md:flex-row items-center">
          <motion.div 
            className="md:w-7/12 mb-10 md:mb-0"
            ref={ref}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            variants={fadeUp}
          >
            <h1 className="font-heading font-bold text-5xl md:text-7xl mb-6 leading-tight text-white">
              Welcome to <span className="text-primary block mt-2">Coat of Many Colours Nursery</span>
            </h1>
            <p className="text-lg md:text-xl text-white mb-8">
              A vibrant place for children to learn, explore, and grow in a nurturing environment.
            </p>
            <div className="flex flex-wrap gap-4">
              <motion.a 
                href="#about" 
                className="px-8 py-3 bg-primary text-white font-heading font-semibold rounded-full shadow-md hover:shadow-lg transition-all hover:-translate-y-1"
                whileHover={{ y: -5, boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)" }}
                whileTap={{ y: 0 }}
              >
                Discover More
              </motion.a>
              <motion.a 
                href="#contact" 
                className="px-8 py-3 bg-white border-2 border-primary text-primary font-heading font-semibold rounded-full shadow-md hover:shadow-lg transition-all hover:-translate-y-1"
                whileHover={{ y: -5, boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)" }}
                whileTap={{ y: 0 }}
              >
                Book a Visit
              </motion.a>
            </div>
          </motion.div>
          
          <motion.div 
            className="md:w-5/12 relative"
            ref={ref}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            variants={fadeLeft}
          >
            <div className="relative">
              <div className="w-full h-80 md:h-[450px] rounded-2xl overflow-hidden shadow-xl bg-white/20 backdrop-blur-sm">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentImage}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1 }}
                    className="absolute inset-0"
                  >
                    <img 
                      src={images[currentImage].src}
                      alt={images[currentImage].alt}
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
              
              {/* Decorative elements */}
              <motion.div 
                className="absolute -top-6 -right-6 w-24 h-24 bg-accent rounded-full opacity-70"
                animate={{ y: [0, -15, 0] }}
                transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              />
              <motion.div 
                className="absolute -bottom-4 -left-4 w-16 h-16 bg-secondary rounded-full opacity-60"
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              />
            </div>
            
            {/* Cloud-like speech bubbles */}
            <Cloud 
              className="absolute top-10 left-0 transform -translate-x-1/2 animate-float"
              text="Learning through play!"
              textColor="text-primary"
            />
            <Cloud 
              className="absolute bottom-20 right-0 transform translate-x-1/4 animate-float"
              text="Discover, create, grow!"
              textColor="text-secondary"
              delay={2}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
