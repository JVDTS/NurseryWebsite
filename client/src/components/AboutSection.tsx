import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { fadeLeft, fadeRight, fadeUp } from "@/lib/animations";

export default function AboutSection() {
  const [ref, inView] = useInView({
    triggerOnce: false,
    threshold: 0.1,
  });

  return (
    <section id="about" className="py-20 bg-gradient-to-b from-white to-rainbow-yellow/5" ref={ref}>
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center gap-12 mb-16">
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
              
              {/* Small floating image of children */}
              <motion.div 
                className="absolute -bottom-8 -left-12 w-28 h-28 rounded-lg overflow-hidden shadow-lg"
                animate={{ y: [0, -8, 0], rotate: [0, 3, 0] }}
                transition={{ 
                  duration: 5, 
                  repeat: Infinity,
                  repeatType: "reverse" 
                }}
              >
                <img 
                  src="https://images.unsplash.com/photo-1588075592446-265fd1e6e76f?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80" 
                  alt="Children gardening" 
                  className="w-full h-full object-cover"
                />
              </motion.div>
              
              {/* Second floating image */}
              <motion.div 
                className="absolute -top-12 right-12 w-20 h-20 rounded-full overflow-hidden shadow-lg z-10"
                animate={{ y: [0, 7, 0], x: [0, 5, 0] }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity,
                  repeatType: "reverse",
                  delay: 0.5
                }}
              >
                <img 
                  src="https://images.unsplash.com/photo-1429114753110-162e8eb60beb?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80" 
                  alt="Children in playground" 
                  className="w-full h-full object-cover"
                />
              </motion.div>
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
        
        {/* Image gallery with children */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16">
          <motion.div 
            className="col-span-1 md:col-span-2 h-60 md:h-80 rounded-xl overflow-hidden shadow-lg"
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            variants={fadeUp}
            custom={0.1}
          >
            <img 
              src="https://images.unsplash.com/photo-1516627145497-ae6968895b74?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
              alt="Children reading together" 
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
            />
          </motion.div>
          
          <motion.div 
            className="col-span-1 h-60 rounded-xl overflow-hidden shadow-lg"
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            variants={fadeUp}
            custom={0.2}
          >
            <img 
              src="https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
              alt="Child playing with building blocks" 
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
            />
          </motion.div>
          
          <motion.div 
            className="col-span-1 h-60 rounded-xl overflow-hidden shadow-lg"
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            variants={fadeUp}
            custom={0.3}
          >
            <img 
              src="https://images.unsplash.com/photo-1597258145619-75a5968d331a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
              alt="Children exploring nature" 
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
