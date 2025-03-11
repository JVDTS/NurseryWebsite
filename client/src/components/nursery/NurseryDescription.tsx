import { useInView } from "react-intersection-observer";
import { motion } from "framer-motion";
import { fadeUp, fadeLeft } from "@/lib/animations";

interface NurseryDescriptionProps {
  description: string;
  imageSrc: string;
}

export default function NurseryDescription({ description, imageSrc }: NurseryDescriptionProps) {
  const [ref, inView] = useInView({
    triggerOnce: false,
    threshold: 0.2,
  });

  return (
    <section className="py-20 bg-gray-50" ref={ref}>
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <motion.div 
            className="lg:w-1/2"
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            variants={fadeLeft}
          >
            <div className="bg-white rounded-lg p-2 shadow-md overflow-hidden">
              <img 
                src={imageSrc} 
                alt="Nursery facility" 
                className="w-full h-auto rounded object-cover"
                style={{ minHeight: "300px" }}
              />
            </div>
          </motion.div>
          
          <motion.div 
            className="lg:w-1/2"
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            variants={fadeUp}
          >
            <h2 className="font-heading font-bold text-3xl mb-8">Our Nursery</h2>
            <div className="prose prose-lg">
              <p className="text-gray-700 leading-relaxed">{description}</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}