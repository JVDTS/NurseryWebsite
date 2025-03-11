import { useInView } from "react-intersection-observer";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/animations";

interface Facility {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface NurseryFacilitiesProps {
  facilities: Facility[];
}

export default function NurseryFacilities({ facilities }: NurseryFacilitiesProps) {
  const [ref, inView] = useInView({
    triggerOnce: false,
    threshold: 0.1,
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
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
          <h2 className="font-heading font-bold text-3xl md:text-4xl mb-6">Our Facilities</h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Our purpose-built environment is designed to provide the best possible care and learning experiences for your child.
          </p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
          {facilities.map((facility, index) => (
            <motion.div
              key={index}
              className="bg-gray-50 p-8 rounded-xl shadow-sm"
              variants={fadeUp}
              custom={index}
            >
              <div className="w-14 h-14 bg-primary bg-opacity-20 rounded-full flex items-center justify-center mb-6">
                {facility.icon}
              </div>
              <h3 className="font-heading font-bold text-xl mb-4">{facility.title}</h3>
              <p className="text-gray-600">{facility.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}