import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { fadeUp } from "@/lib/animations";
import { AnimatedButton } from "@/components/ui/animated-button";

export default function HeroSection() {
  const [ref, inView] = useInView({
    triggerOnce: false,
    threshold: 0.1,
  });

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
      </div>
    </section>
  );
}
