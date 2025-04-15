import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { fadeLeft, fadeRight } from "@/lib/animations";

export default function AboutSection() {
  const [ref, inView] = useInView({
    triggerOnce: false,
    threshold: 0.1,
  });

  return (
    <section id="about" className="py-20 bg-gradient-to-b from-white to-rainbow-yellow/5" ref={ref}>
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <motion.div 
            className="md:w-5/12"
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            variants={fadeRight}
          >
            <div className="relative">
              <div className="w-full aspect-square rounded-2xl overflow-hidden shadow-xl">
                <img 
                  src="https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                  alt="Colorful nursery classroom with children's artwork" 
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Rainbow border effect */}
              <div className="absolute -bottom-6 -right-6 w-full h-full border-4 border-rainbow-orange rounded-2xl -z-10 transform translate-x-4 translate-y-4" />
              <div className="absolute -top-6 -left-6 w-12 h-12 bg-rainbow-blue rounded-full -z-10" />
              <div className="absolute top-1/2 -right-4 w-8 h-8 bg-rainbow-green rounded-full -z-10" />
            </div>
          </motion.div>
          
          <motion.div 
            className="md:w-7/12"
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            variants={fadeLeft}
          >
            <div className="mb-4">
              <span className="inline-block px-4 py-1 bg-rainbow-indigo/20 text-rainbow-indigo font-heading font-semibold text-sm uppercase rounded-full">Who we are</span>
            </div>
            
            <h2 className="font-heading font-bold text-3xl md:text-4xl lg:text-5xl mb-6 leading-tight bg-clip-text text-transparent bg-gradient-to-r from-rainbow-blue to-rainbow-indigo">
              We're a nursery on a mission to empower parents to raise a happy, healthy and conscious generation
            </h2>
            
            <p className="text-gray-600 mb-8 text-lg">
              At <span className="text-rainbow-orange font-semibold">Coat of Many Colours Nursery</span>, we believe that every child deserves the best start in life. Our dedicated team of early years professionals creates a nurturing environment where children can explore, discover, and develop their unique talents and abilities.
            </p>
            
            <p className="text-gray-600 mb-8 text-lg">
              Our approach combines <span className="text-rainbow-green font-semibold">play-based learning</span> with <span className="text-rainbow-indigo font-semibold">mindfulness practices</span>, <span className="text-rainbow-blue font-semibold">outdoor exploration</span>, and <span className="text-rainbow-red font-semibold">creative expression</span> to support children's holistic development.
            </p>
            
            <motion.a 
              href="#mission" 
              className="inline-block px-8 py-3 bg-gradient-to-r from-rainbow-orange to-rainbow-red text-white font-heading font-semibold rounded-full shadow-md hover:shadow-lg transition-all hover:-translate-y-1"
              whileHover={{ y: -5, boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)" }}
              whileTap={{ y: 0 }}
            >
              Learn About Our Mission
            </motion.a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
