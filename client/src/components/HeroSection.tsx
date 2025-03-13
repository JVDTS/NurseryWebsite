import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import Cloud from "@/assets/illustrations/Cloud";
import { fadeLeft, fadeUp } from "@/lib/animations";

export default function HeroSection() {
  const [ref, inView] = useInView({
    triggerOnce: false,
    threshold: 0.1,
  });

  return (
    <section id="home" className="pt-24 pb-16 min-h-screen flex flex-col justify-center relative overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-40 z-10"></div>
        <video 
          autoPlay 
          muted 
          loop 
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
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
              Welcome to <span className="text-primary block mt-2 text-white">Coat of Many Colours Nursery</span>
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
                className="px-8 py-3 bg-white border-2 border-white text-primary font-heading font-semibold rounded-full shadow-md hover:shadow-lg transition-all hover:-translate-y-1"
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
              <div className="w-full h-80 md:h-[450px] rounded-2xl overflow-hidden shadow-xl bg-white bg-opacity-20 backdrop-blur-sm">
                <motion.div
                  className="w-full h-full flex items-center justify-center p-6"
                >
                  <div className="text-center text-white">
                    <h2 className="text-3xl font-heading font-bold mb-4">Where Children Flourish</h2>
                    <p className="text-lg">
                      Our dedicated staff create a safe, stimulating environment 
                      where every child's unique talents and abilities can thrive.
                    </p>
                  </div>
                </motion.div>
              </div>
              
              {/* Decorative elements */}
              <motion.div 
                className="absolute -top-6 -right-6 w-24 h-24 bg-accent rounded-full opacity-50"
                animate={{ y: [0, -15, 0] }}
                transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              />
              <motion.div 
                className="absolute -bottom-4 -left-4 w-16 h-16 bg-secondary rounded-full opacity-40"
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              />
            </div>
            
            {/* Cloud-like speech bubbles */}
            <Cloud 
              className="absolute top-10 left-0 transform -translate-x-1/2 animate-float"
              text="Learning through play!"
              textColor="text-white"
            />
            <Cloud 
              className="absolute bottom-20 right-0 transform translate-x-1/4 animate-float"
              text="Discover, create, grow!"
              textColor="text-white"
              delay={2}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
