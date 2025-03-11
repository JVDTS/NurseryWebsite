import { motion } from "framer-motion";
import { fadeIn, fadeUp, fadeLeft, fadeRight } from "@/lib/animations";

interface NurseryDescriptionProps {
  description: string;
  imageSrc: string;
}

export default function NurseryDescription({ description, imageSrc }: NurseryDescriptionProps) {
  return (
    <section className="py-16 px-4 md:px-10 lg:px-20 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        <motion.div
          className="order-2 md:order-1"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeLeft}
        >
          <h2 className="text-3xl font-bold mb-6 text-primary">About Our Nursery</h2>
          <p className="text-gray-700 leading-relaxed">{description}</p>
        </motion.div>
        
        <motion.div 
          className="order-1 md:order-2 rounded-xl overflow-hidden shadow-lg"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeRight}
        >
          <img
            src={imageSrc}
            alt="Nursery interior"
            className="w-full h-80 md:h-96 object-cover rounded-xl transition-transform duration-500 hover:scale-105"
          />
        </motion.div>
      </div>
    </section>
  );
}