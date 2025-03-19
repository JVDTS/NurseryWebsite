import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { fadeUp } from "@/lib/animations";

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
        <div className="flex flex-col items-center">
          <motion.div 
            className="w-full max-w-3xl text-center"
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
            <div className="flex flex-wrap justify-center gap-4">
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
        </div>
      </div>
    </section>
  );
}
