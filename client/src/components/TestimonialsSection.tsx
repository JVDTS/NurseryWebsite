import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Star } from "lucide-react";
import { fadeUp } from "@/lib/animations";

interface TestimonialProps {
  quote: string;
  author: string;
  role: string;
  image: string;
  delay: number;
}

const testimonials: TestimonialProps[] = [
  {
    quote: "The transformation in my daughter since she started at Coat of Many Colours has been remarkable. She's more confident, creative, and happy. The staff are phenomenal!",
    author: "Sarah Johnson",
    role: "Parent of Lily, age 4",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80",
    delay: 0.1
  },
  {
    quote: "As first-time parents, we were nervous about nursery. The team made the transition so smooth and keep us involved in our son's development every step of the way.",
    author: "David Martinez",
    role: "Parent of Leo, age 2",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80",
    delay: 0.2
  },
  {
    quote: "The outdoor curriculum is what attracted us, and we haven't been disappointed. My twins are thriving and come home with stories of adventures and discoveries every day.",
    author: "Priya Nair",
    role: "Parent of Maya & Rohan, age 3",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80",
    delay: 0.3
  }
];

function Testimonial({ quote, author, role, image, delay }: TestimonialProps) {
  const [ref, inView] = useInView({
    triggerOnce: false,
    threshold: 0.1,
  });

  return (
    <motion.div 
      className="bg-white p-8 rounded-xl shadow-md"
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={fadeUp}
      custom={delay}
    >
      <div className="flex items-center mb-4">
        <div className="text-accent">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="inline-block h-5 w-5 fill-current" />
          ))}
        </div>
      </div>
      <p className="text-gray-600 mb-6 italic">
        "{quote}"
      </p>
      <div className="flex items-center">
        <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden mr-4">
          <img 
            src={image}
            alt={author} 
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <h4 className="font-heading font-semibold">{author}</h4>
          <p className="text-sm text-gray-500">{role}</p>
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

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <motion.div 
          className="max-w-4xl mx-auto text-center mb-16"
          ref={ref}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={fadeUp}
        >
          <div className="mb-4">
            <span className="inline-block px-4 py-1 bg-accent bg-opacity-20 text-accent font-heading font-semibold text-sm uppercase rounded-full">What Parents Say</span>
          </div>
          
          <h2 className="font-heading font-bold text-3xl md:text-4xl mb-6 leading-tight">
            Trusted by hundreds of families
          </h2>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Testimonial
              key={index}
              quote={testimonial.quote}
              author={testimonial.author}
              role={testimonial.role}
              image={testimonial.image}
              delay={testimonial.delay}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
