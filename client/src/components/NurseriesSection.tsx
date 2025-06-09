import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { fadeUp } from "@/lib/animations";

interface NurseryCardProps {
  image: string;
  title: string;
  description: string;
  ages: string;
  hours: string;
  id: string;
}

const nurseries: NurseryCardProps[] = [
  {
    image: "https://images.unsplash.com/photo-1565538810643-b5bdb714032a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    title: "Hayes",
    description: "A bright, spacious nursery with a beautiful garden, located at 192 Church Road, Hayes, UB3 2LT.",
    ages: "Ages 0-5",
    hours: "7:30AM-6PM",
    id: "hayes"
  },
  {
    image: "https://images.unsplash.com/photo-1544487660-b86394cba400?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    title: "Uxbridge",
    description: "A cozy nursery with state-of-the-art learning facilities at 4 New Windsor Street, Uxbridge, UB8 2TU.",
    ages: "Ages 2-5",
    hours: "7:30AM-6PM",
    id: "uxbridge"
  },
  {
    image: "https://images.unsplash.com/photo-1543248939-4296e1fea89b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    title: "Hounslow",
    description: "A nature-focused nursery with large outdoor play areas at 488, 490 Great West Rd, Hounslow TW5 0TA.",
    ages: "Ages 1-5",
    hours: "7:30AM-6PM",
    id: "hounslow"
  }
];

function NurseryCard({ image, title, description, ages, hours, id }: NurseryCardProps) {
  return (
    <div id={id} className="h-full">
      <div className="bg-white rounded-xl shadow-md overflow-hidden card-hover h-full">
        <div className="h-64 overflow-hidden">
          <img 
            src={image} 
            alt={`${title} Nursery`} 
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
          />
        </div>
        <div className="p-6">
          <h3 className="font-heading font-bold text-2xl mb-2">{title}</h3>
          <p className="text-gray-600 mb-4">
            {description}
          </p>
          <div className="flex justify-between items-center">
            <div className="flex space-x-2">
              <span className="inline-block px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full">{ages}</span>
              <span className="inline-block px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full">{hours}</span>
            </div>
            <motion.a 
              href={`/nurseries/${id}`} 
              className="text-primary font-heading font-semibold flex items-center"
              whileHover={{ x: 5 }}
            >
              View details
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </motion.a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NurseriesSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slideWidth, setSlideWidth] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  useEffect(() => {
    function updateDimensions() {
      if (carouselRef.current) {
        const firstChild = carouselRef.current.querySelector('div');
        if (firstChild) {
          setSlideWidth(firstChild.offsetWidth);
        }
      }
    }

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    
    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  // Check URL hash to show the specific nursery if linked from dropdown
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const nurseryId = hash.substring(1); // Remove the # symbol
      const nurseryIndex = nurseries.findIndex(n => n.id === nurseryId);
      if (nurseryIndex !== -1) {
        setCurrentSlide(nurseryIndex);
      }
    }
  }, []);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? nurseries.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === nurseries.length - 1 ? 0 : prev + 1));
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <section id="nurseries" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <motion.div 
          className="max-w-4xl mx-auto text-center mb-16"
          ref={ref}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={fadeUp}
        >
          <div className="mb-4">
            <span className="inline-block px-4 py-1 bg-secondary bg-opacity-20 text-secondary font-heading font-semibold text-sm uppercase rounded-full">Our Nurseries</span>
          </div>
          
          <h2 className="font-heading font-bold text-3xl md:text-4xl lg:text-5xl mb-6 leading-tight">
            Nurseries designed for mindfulness, learning &amp; play
          </h2>
          
          <p className="text-gray-600 text-lg">
            Visit one of our carefully designed locations where every detail supports children's development and well-being.
          </p>
        </motion.div>
        
        <motion.div 
          className="relative mb-12"
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={fadeUp}
        >
          <div className="flex flex-wrap -mx-4">
            {nurseries.map((nursery, index) => (
              <div
                key={index}
                className="w-full md:w-1/2 lg:w-1/3 px-4 mb-8"
              >
                <NurseryCard 
                  image={nursery.image}
                  title={nursery.title}
                  description={nursery.description}
                  ages={nursery.ages}
                  hours={nursery.hours}
                  id={nursery.id}
                />
              </div>
            ))}
          </div>
        </motion.div>
        
        <motion.div 
          className="text-center"
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={fadeUp}
        >
          <motion.a 
            href="#contact" 
            className="inline-block px-8 py-3 bg-secondary text-white font-heading font-semibold rounded-full shadow-md hover:shadow-lg transition-all hover:-translate-y-1"
            whileHover={{ y: -5, boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)" }}
            whileTap={{ y: 0 }}
          >
            Schedule a Tour
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
