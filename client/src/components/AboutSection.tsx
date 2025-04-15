import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { fadeLeft, fadeRight, fadeUp } from "@/lib/animations";
import { Heart, Sun, Book, Sparkles } from "lucide-react";

export default function AboutSection() {
  const [ref, inView] = useInView({
    triggerOnce: false,
    threshold: 0.1,
  });

  return (
    <section id="about" className="py-24 bg-white relative" ref={ref}>
      {/* Decorative Elements */}
      <div className="absolute top-10 right-10 w-16 h-16 bg-[#FFAA8A] rounded-full opacity-10 animate-float-slow"></div>
      <div className="absolute bottom-20 left-10 w-24 h-24 bg-[#FFD66B] rounded-full opacity-10 animate-float"></div>
      
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="inline-block px-4 py-1 bg-[#93E2D0] text-[#4AADA5] font-medium text-sm rounded-full mb-4">About Our Nursery</span>
          <h2 className="font-heading font-bold text-3xl md:text-4xl lg:text-5xl mb-6 leading-tight">
            <span className="text-[#FF7D30]">Where</span> Children Grow, <span className="text-[#4AADA5]">Learn</span> and Thrive
          </h2>
          <p className="text-gray-600 text-lg">
            At Coat of Many Colours Nursery, we're dedicated to creating a vibrant and nurturing environment that inspires curiosity, creativity, and joy in every child.
          </p>
        </div>
        
        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <motion.div 
            className="bg-white rounded-2xl p-8 text-center shadow-lg hover:shadow-xl transition-all border-t-4 border-[#FF7D30]"
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            variants={fadeUp}
            custom={0.1}
          >
            <div className="w-16 h-16 bg-[#FF7D30]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="h-8 w-8 text-[#FF7D30]" />
            </div>
            <h3 className="font-bold text-xl mb-3">Loving Care</h3>
            <p className="text-gray-600">
              Our passionate educators provide warm, responsive care that nurtures each child's emotional wellbeing.
            </p>
          </motion.div>
          
          <motion.div 
            className="bg-white rounded-2xl p-8 text-center shadow-lg hover:shadow-xl transition-all border-t-4 border-[#FFD66B]"
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            variants={fadeUp}
            custom={0.2}
          >
            <div className="w-16 h-16 bg-[#FFD66B]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Sun className="h-8 w-8 text-[#FFD66B]" />
            </div>
            <h3 className="font-bold text-xl mb-3">Bright Environment</h3>
            <p className="text-gray-600">
              Thoughtfully designed spaces filled with natural light and engaging materials to spark imagination.
            </p>
          </motion.div>
          
          <motion.div 
            className="bg-white rounded-2xl p-8 text-center shadow-lg hover:shadow-xl transition-all border-t-4 border-[#4AADA5]"
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            variants={fadeUp}
            custom={0.3}
          >
            <div className="w-16 h-16 bg-[#4AADA5]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Book className="h-8 w-8 text-[#4AADA5]" />
            </div>
            <h3 className="font-bold text-xl mb-3">Play-Based Learning</h3>
            <p className="text-gray-600">
              Carefully crafted activities that blend fun with educational foundations for lifelong learning.
            </p>
          </motion.div>
          
          <motion.div 
            className="bg-white rounded-2xl p-8 text-center shadow-lg hover:shadow-xl transition-all border-t-4 border-[#FF9385]"
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            variants={fadeUp}
            custom={0.4}
          >
            <div className="w-16 h-16 bg-[#FF9385]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles className="h-8 w-8 text-[#FF9385]" />
            </div>
            <h3 className="font-bold text-xl mb-3">Creative Expression</h3>
            <p className="text-gray-600">
              Art, music, and movement activities that encourage children to express themselves confidently.
            </p>
          </motion.div>
        </div>
        
        {/* About Content */}
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <motion.div 
            className="lg:w-1/2"
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            variants={fadeRight}
          >
            <div className="relative">
              <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-xl">
                <img 
                  src="https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                  alt="Colorful nursery classroom with children playing" 
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Decorative Elements */}
              <div className="absolute -top-5 -left-5 w-24 h-24 bg-[#FFD66B] rounded-2xl -z-10 transform -rotate-6"></div>
              <div className="absolute -bottom-5 -right-5 w-24 h-24 bg-[#93E2D0] rounded-2xl -z-10 transform rotate-6"></div>
              
              <div className="absolute top-1/3 right-0 transform translate-x-1/4 rotate-12">
                <img 
                  src="https://cdn-icons-png.flaticon.com/512/3703/3703837.png" 
                  alt="Toy"
                  className="w-16 h-16 drop-shadow-lg animate-float" 
                />
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            className="lg:w-1/2"
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            variants={fadeLeft}
          >
            <h3 className="text-[#FF7D30] font-bold text-2xl mb-4">Our Story</h3>
            <h2 className="font-heading font-bold text-3xl md:text-4xl mb-6 leading-tight">
              Helping Children Discover Their Potential Since 2005
            </h2>
            
            <p className="text-gray-600 mb-6 text-lg">
              Founded with a vision to create a place where children could truly thrive, <span className="text-[#FF7D30] font-semibold">Coat of Many Colours Nursery</span> has been nurturing young minds for over 15 years. We believe childhood is a precious time of discovery and growth.
            </p>
            
            <p className="text-gray-600 mb-8 text-lg">
              Our approach blends <span className="text-[#4AADA5] font-semibold">progressive educational methods</span> with traditional values of kindness, respect, and community. Through thoughtfully designed learning experiences, we help children develop confidence, creativity, and a lifelong love of learning.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <motion.a 
                href="#mission" 
                className="px-8 py-3 bg-[#FF7D30] text-white font-semibold rounded-full shadow-md hover:shadow-lg transition-all text-center"
                whileHover={{ y: -3, boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)" }}
                whileTap={{ y: 0 }}
              >
                Our Mission & Values
              </motion.a>
              
              <motion.a 
                href="#nurseries" 
                className="px-8 py-3 border-2 border-[#93E2D0] text-[#4AADA5] font-semibold rounded-full hover:bg-[#93E2D0]/10 transition-all text-center"
                whileHover={{ y: -3 }}
                whileTap={{ y: 0 }}
              >
                Explore Our Nurseries
              </motion.a>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Wave Separator */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden rotate-180">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full h-auto">
          <path fill="#FFF6E9" fillOpacity="1" d="M0,96L48,106.7C96,117,192,139,288,138.7C384,139,480,117,576,122.7C672,128,768,160,864,176C960,192,1056,192,1152,176C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>
    </section>
  );
}
