import { motion, useScroll, useTransform } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { fadeUp } from "@/lib/animations";
import { AnimatedButton } from "@/components/ui/animated-button";
import { useRef } from "react";

export default function HeroSection() {
  const [ref, inView] = useInView({
    triggerOnce: false,
    threshold: 0.1,
  });

  // Create a reference for the parallax effect
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // Transform values for parallax effect
  const videoScale = useTransform(scrollYProgress, [0, 1], [1, 1.2]);
  const videoY = useTransform(scrollYProgress, [0, 1], [0, 50]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 100]);

  return (
    <section 
      id="home" 
      className="pt-24 pb-16 min-h-screen flex flex-col justify-center relative overflow-hidden"
      ref={sectionRef}
    >
      {/* Video Background with Parallax */}
      <motion.div 
        className="absolute inset-0 w-full h-full overflow-hidden z-0"
        style={{ 
          y: videoY,
          scale: videoScale,
        }}
      >
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
      </motion.div>

      <motion.div 
        className="container mx-auto px-4 relative z-20"
        style={{ y: contentY }}
      >
        <div className="flex flex-col">
          <motion.div 
            className="w-full md:w-7/12 lg:w-6/12"
            ref={ref}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            variants={fadeUp}
          >
            <h1 className="font-heading font-bold text-4xl sm:text-5xl md:text-6xl lg:text-7xl mb-6 leading-tight text-white">
              Welcome to 
              <div className="mt-2 bg-clip-text text-transparent bg-gradient-to-r from-rainbow-red via-rainbow-yellow to-rainbow-violet">
                Coat of Many Colours Nursery
              </div>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-white mb-8 max-w-2xl">
              A vibrant place for children to learn, explore, and grow in a nurturing environment.
            </p>
            <div className="flex flex-wrap gap-3 sm:gap-4">
              <AnimatedButton 
                href="#about" 
                variant="primary"
                size="lg" 
                className="text-sm sm:text-base py-2 px-4 sm:py-3 sm:px-6 bg-gradient-to-r from-rainbow-blue to-rainbow-indigo text-white hover:shadow-lg transition-all"
              >
                Discover More
              </AnimatedButton>
              <AnimatedButton 
                href="#contact" 
                variant="outline" 
                size="lg" 
                className="text-sm sm:text-base py-2 px-4 sm:py-3 sm:px-6 border-rainbow-pink text-rainbow-pink hover:bg-rainbow-pink/10"
              >
                Book a Visit
              </AnimatedButton>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Floating animated shapes for visual interest */}
      <div className="absolute bottom-0 left-0 right-0 h-32 z-10 pointer-events-none overflow-hidden">
        <motion.div 
          className="absolute -bottom-4 -left-4 w-24 h-24 bg-rainbow-blue opacity-20 rounded-full"
          animate={{ 
            y: [0, -15, 0],
            x: [0, 10, 0],
          }}
          transition={{ 
            duration: 6, 
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
        <motion.div 
          className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-32 h-32 bg-rainbow-pink opacity-20 rounded-full"
          animate={{ 
            y: [0, -20, 0],
          }}
          transition={{ 
            duration: 7, 
            repeat: Infinity,
            repeatType: "reverse",
            delay: 0.5
          }}
        />
        <motion.div 
          className="absolute -bottom-4 -right-4 w-28 h-28 bg-rainbow-yellow opacity-20 rounded-full"
          animate={{ 
            y: [0, -10, 0],
            x: [0, -15, 0],
          }}
          transition={{ 
            duration: 8, 
            repeat: Infinity,
            repeatType: "reverse",
            delay: 1
          }}
        />
      </div>
    </section>
  );
}
