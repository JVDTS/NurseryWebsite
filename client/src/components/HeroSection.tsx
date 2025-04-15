import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { fadeUp, fadeLeft, fadeRight } from "@/lib/animations";
import { AnimatedButton } from "@/components/ui/animated-button";

export default function HeroSection() {
  const [ref, inView] = useInView({
    triggerOnce: false,
    threshold: 0.1,
  });

  return (
    <section id="home" className="pt-24 pb-16 min-h-screen flex flex-col justify-center relative overflow-hidden bg-[#FFF6E9]">
      {/* Decorative Elements */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-[#FFD66B] rounded-full opacity-30 animate-float-slow"></div>
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-[#FFAA8A] rounded-full opacity-20 animate-float"></div>
      <div className="absolute top-1/3 right-1/4 w-16 h-16 bg-[#93E2D0] rounded-full opacity-30 animate-float-reverse"></div>
      
      <div className="container mx-auto px-4 relative z-20">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <motion.div 
            className="w-full md:w-1/2 lg:w-5/12 mb-10 md:mb-0"
            ref={ref}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            variants={fadeLeft}
          >
            <span className="inline-block px-5 py-2 bg-[#FFD66B] rounded-full text-sm font-semibold mb-4">Welcome to Our Nursery</span>
            <h1 className="font-heading font-bold text-4xl sm:text-5xl md:text-6xl mb-6 leading-tight">
              A Colorful World of 
              <div className="mt-2 bg-clip-text text-transparent bg-gradient-to-r from-[#FF5757] via-[#FF914D] to-[#FFBD59]">
                Learning & Fun
              </div>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl">
              At Coat of Many Colours Nursery, we create a joyful and nurturing environment where children can discover, play, and grow together.
            </p>
            <div className="flex flex-wrap gap-4">
              <AnimatedButton 
                href="#about" 
                variant="primary"
                size="lg" 
                className="text-base font-medium py-3 px-8 bg-[#FF914D] hover:bg-[#FF7D30] text-white rounded-full hover:shadow-lg transition-all"
              >
                Explore Our Nursery
              </AnimatedButton>
              <AnimatedButton 
                href="#contact" 
                variant="outline" 
                size="lg" 
                className="text-base font-medium py-3 px-8 border-2 border-[#93E2D0] text-[#4AADA5] hover:bg-[#93E2D0]/10 rounded-full"
              >
                Book a Visit
              </AnimatedButton>
            </div>
          </motion.div>

          <motion.div
            className="w-full md:w-1/2 lg:w-6/12 relative"
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            variants={fadeRight}
          >
            <div className="relative">
              <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1472162072942-cd5147eb3902?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80" 
                  alt="Happy children playing at nursery" 
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Decorative Elements */}
              <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-[#FFD66B] rounded-full -z-10"></div>
              <div className="absolute -top-6 -left-6 w-16 h-16 bg-[#93E2D0] rounded-full -z-10"></div>
              <div className="absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2 rotate-12">
                <img 
                  src="https://cdn-icons-png.flaticon.com/512/3468/3468377.png" 
                  alt="Toy"
                  className="w-16 h-16 drop-shadow-lg animate-float" 
                />
              </div>
              <div className="absolute bottom-10 left-0 transform -translate-x-1/3 rotate-[-12deg]">
                <img 
                  src="https://cdn-icons-png.flaticon.com/512/1167/1167082.png" 
                  alt="Building blocks"
                  className="w-14 h-14 drop-shadow-lg animate-float-slow" 
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Wave Separator */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full h-auto">
          <path fill="#FFFFFF" fillOpacity="1" d="M0,96L48,106.7C96,117,192,139,288,138.7C384,139,480,117,576,122.7C672,128,768,160,864,176C960,192,1056,192,1152,176C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>
    </section>
  );
}
