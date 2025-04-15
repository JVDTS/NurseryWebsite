import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Star, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { fadeUp } from "@/lib/animations";
import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

interface DaynurseriesReview {
  id: string;
  text: string;
  author: string;
  date: string;
  rating: number;
  nurseryName: string;
}

interface TestimonialProps {
  quote: string;
  author: string;
  role?: string;
  image?: string;
  date?: string;
  rating?: number;
  delay: number;
}

// Fallback testimonials in case API fails
const fallbackTestimonials: TestimonialProps[] = [
  {
    quote: "The transformation in my daughter since she started at Coat of Many Colours has been remarkable. She's more confident, creative, and happy. The staff are phenomenal!",
    author: "Sarah Johnson",
    role: "Parent of Lily, age 4",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80",
    delay: 0.1,
    rating: 5
  },
  {
    quote: "As first-time parents, we were nervous about nursery. The team made the transition so smooth and keep us involved in our son's development every step of the way.",
    author: "David Martinez",
    role: "Parent of Leo, age 2",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80",
    delay: 0.2,
    rating: 5
  },
  {
    quote: "The outdoor curriculum is what attracted us, and we haven't been disappointed. My twins are thriving and come home with stories of adventures and discoveries every day.",
    author: "Priya Nair",
    role: "Parent of Maya & Rohan, age 3",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80",
    delay: 0.3,
    rating: 5
  }
];

function Testimonial({ quote, author, role, image, date, rating = 5, delay }: TestimonialProps) {
  const [ref, inView] = useInView({
    triggerOnce: false,
    threshold: 0.1,
  });

  return (
    <motion.div 
      className="bg-white p-5 sm:p-8 rounded-xl shadow-md"
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={fadeUp}
      custom={delay}
    >
      <div className="flex items-center mb-3 sm:mb-4">
        <div className="text-accent">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              className={`inline-block h-4 w-4 sm:h-5 sm:w-5 ${i < rating ? 'fill-current' : ''}`} 
            />
          ))}
          {date && <span className="ml-2 text-xs text-gray-500">{date}</span>}
        </div>
      </div>
      <p className="text-gray-600 mb-4 sm:mb-6 italic text-sm sm:text-base">
        "{quote}"
      </p>
      <div className="flex items-center">
        {image ? (
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-full overflow-hidden mr-3 sm:mr-4 shrink-0">
            <img 
              src={image}
              alt={author} 
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-full overflow-hidden mr-3 sm:mr-4 shrink-0 flex items-center justify-center">
            <span className="text-gray-600 font-semibold">{author.charAt(0).toUpperCase()}</span>
          </div>
        )}
        <div>
          <h4 className="font-heading font-semibold text-sm sm:text-base">{author}</h4>
          {role && <p className="text-xs sm:text-sm text-gray-500">{role}</p>}
        </div>
      </div>
    </motion.div>
  );
}

export default function TestimonialsSection() {
  const [ref, inView] = useInView({
    triggerOnce: false,
    threshold: 0.1,
  });
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const slideInterval = useRef<number | null>(null);
  
  // Fetch reviews from API
  const { data, isLoading, isError } = useQuery<{ success: boolean, reviews: DaynurseriesReview[] }>({
    queryKey: ['/api/reviews'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Use real reviews from API or fallback if error/loading
  const reviews = !isLoading && !isError && data?.success && data.reviews && data.reviews.length > 0
    ? data.reviews.map((review: DaynurseriesReview, index: number) => ({
        quote: review.text,
        author: review.author,
        date: review.date,
        rating: review.rating,
        role: undefined,
        image: undefined,
        delay: index * 0.1
      }))
    : fallbackTestimonials;
  
  const startSlideTimer = () => {
    if (slideInterval.current !== null) {
      clearInterval(slideInterval.current);
    }
    
    slideInterval.current = window.setInterval(() => {
      if (!isPaused) {
        setDirection(1);
        setCurrentIndex(prevIndex => (prevIndex + 1) % reviews.length);
      }
    }, 5000);
  };
  
  useEffect(() => {
    startSlideTimer();
    return () => {
      if (slideInterval.current !== null) {
        clearInterval(slideInterval.current);
      }
    };
  }, [isPaused, reviews.length]);
  
  const handlePrev = () => {
    if (slideInterval.current !== null) {
      clearInterval(slideInterval.current);
    }
    setDirection(-1);
    setCurrentIndex(prevIndex => (prevIndex - 1 + reviews.length) % reviews.length);
    startSlideTimer();
  };
  
  const handleNext = () => {
    if (slideInterval.current !== null) {
      clearInterval(slideInterval.current);
    }
    setDirection(1);
    setCurrentIndex(prevIndex => (prevIndex + 1) % reviews.length);
    startSlideTimer();
  };

  const slideVariants = {
    hiddenRight: {
      x: 300,
      opacity: 0
    },
    hiddenLeft: {
      x: -300,
      opacity: 0
    },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeInOut"
      }
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      transition: {
        duration: 0.3
      }
    }
  };
  
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <motion.div 
          className="max-w-4xl mx-auto text-center mb-10 sm:mb-16"
          ref={ref}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={fadeUp}
        >
          <div className="mb-3 sm:mb-4">
            <span className="inline-block px-3 py-1 sm:px-4 sm:py-1 bg-accent bg-opacity-20 text-accent font-heading font-semibold text-xs sm:text-sm uppercase rounded-full">What Parents Say</span>
          </div>
          
          <h2 className="font-heading font-bold text-2xl sm:text-3xl md:text-4xl mb-4 sm:mb-6 leading-tight px-4">
            Trusted by hundreds of families
          </h2>
          
          {isLoading && (
            <div className="flex justify-center items-center py-4">
              <Loader2 className="w-6 h-6 animate-spin text-accent" />
              <span className="ml-2 text-sm text-gray-600">Loading reviews...</span>
            </div>
          )}
          
          {isError && (
            <div className="text-sm text-amber-600">
              Using local testimonials while we fetch the latest reviews...
            </div>
          )}
        </motion.div>
        
        <div className="max-w-4xl mx-auto relative px-2 sm:px-4 pb-12"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          <div className="h-[320px] sm:h-[300px] md:h-[280px] overflow-hidden relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={direction > 0 ? "hiddenRight" : "hiddenLeft"}
                animate="visible"
                exit="exit"
                variants={slideVariants}
                className="absolute inset-0"
              >
                <Testimonial
                  quote={reviews[currentIndex].quote}
                  author={reviews[currentIndex].author}
                  role={reviews[currentIndex].role}
                  image={reviews[currentIndex].image}
                  date={reviews[currentIndex].date}
                  rating={reviews[currentIndex].rating}
                  delay={0}
                />
              </motion.div>
            </AnimatePresence>
          </div>
          
          <div className="flex justify-center items-center gap-2 sm:gap-3 mt-6 sm:mt-8">
            <motion.button
              onClick={handlePrev}
              className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white shadow-md hover:shadow-lg text-primary transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Previous testimonial"
            >
              <ChevronLeft size={18} />
            </motion.button>
            
            <div className="flex space-x-3">
              {reviews.map((_: TestimonialProps, index: number) => (
                <button 
                  key={index}
                  onClick={() => {
                    setDirection(index > currentIndex ? 1 : -1);
                    setCurrentIndex(index);
                  }}
                  className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-all ${
                    index === currentIndex ? "bg-primary scale-125" : "bg-gray-300"
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
            
            <motion.button
              onClick={handleNext}
              className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white shadow-md hover:shadow-lg text-primary transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Next testimonial"
            >
              <ChevronRight size={18} />
            </motion.button>
          </div>
        </div>
      </div>
    </section>
  );
}