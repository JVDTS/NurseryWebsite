import { useInView } from "react-intersection-observer";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/animations";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

interface NurseryGalleryProps {
  images: string[];
}

export default function NurseryGallery({ images }: NurseryGalleryProps) {
  const [ref, inView] = useInView({
    triggerOnce: false,
    threshold: 0.1,
  });

  const [currentIndex, setCurrentIndex] = useState(0);

  const prevImage = () => {
    setCurrentIndex(current => (current === 0 ? images.length - 1 : current - 1));
  };

  const nextImage = () => {
    setCurrentIndex(current => (current === images.length - 1 ? 0 : current + 1));
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <section className="py-20 bg-white" ref={ref}>
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-16"
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={fadeUp}
        >
          <h2 className="font-heading font-bold text-3xl md:text-4xl mb-6">Our Gallery</h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Take a look at our bright, stimulating environment where children thrive.
          </p>
        </motion.div>

        {/* Main Gallery Carousel */}
        <div className="relative mb-12">
          <div className="aspect-w-16 aspect-h-9 rounded-xl overflow-hidden">
            <motion.img 
              key={currentIndex}
              src={images[currentIndex]} 
              alt={`Nursery Gallery Image ${currentIndex + 1}`} 
              className="w-full h-full object-cover"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            />
          </div>
          
          {/* Navigation Arrows */}
          <button 
            onClick={prevImage}
            className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-white/80 rounded-full w-12 h-12 flex items-center justify-center shadow-md text-gray-800 hover:bg-white transition-colors"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <button 
            onClick={nextImage}
            className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-white/80 rounded-full w-12 h-12 flex items-center justify-center shadow-md text-gray-800 hover:bg-white transition-colors"
            aria-label="Next image"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
        
        {/* Thumbnails */}
        <motion.div 
          className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 md:gap-4"
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
          {images.map((image, index) => (
            <motion.div 
              key={index}
              className={`relative cursor-pointer overflow-hidden rounded-lg ${index === currentIndex ? 'ring-4 ring-primary' : ''}`}
              variants={itemVariants}
              onClick={() => setCurrentIndex(index)}
            >
              <img 
                src={image} 
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-24 object-cover"
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}