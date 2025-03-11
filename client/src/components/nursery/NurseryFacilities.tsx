import { motion } from "framer-motion";
import { fadeUp, staggerContainer, childFadeIn } from "@/lib/animations";

interface Facility {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface NurseryFacilitiesProps {
  facilities: Facility[];
}

export default function NurseryFacilities({ facilities }: NurseryFacilitiesProps) {
  return (
    <section className="py-16 px-4 md:px-10 lg:px-20 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          className="text-center mb-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
        >
          <h2 className="text-3xl font-bold mb-4 text-primary">Our Facilities</h2>
          <div className="w-20 h-1 bg-primary mx-auto mb-6"></div>
          <p className="text-gray-700 max-w-2xl mx-auto">
            Our carefully designed spaces and resources support children's learning and development across all areas.
          </p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {facilities.map((facility, index) => (
            <motion.div
              key={index}
              className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300"
              variants={childFadeIn}
              custom={index}
            >
              <div className="bg-primary bg-opacity-10 w-14 h-14 rounded-full flex items-center justify-center mb-4">
                {facility.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">{facility.title}</h3>
              <p className="text-gray-600">{facility.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}