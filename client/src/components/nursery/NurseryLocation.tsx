import { useInView } from "react-intersection-observer";
import { motion } from "framer-motion";
import { fadeUp, fadeRight } from "@/lib/animations";
import { MapPin, Clock, Phone } from "lucide-react";

interface NurseryLocationProps {
  address: string;
  hoursText: string;
  phoneNumber: string;
  mapImage: string;
}

export default function NurseryLocation({ address, hoursText, phoneNumber, mapImage }: NurseryLocationProps) {
  const [ref, inView] = useInView({
    triggerOnce: false,
    threshold: 0.2,
  });

  return (
    <section className="py-20 bg-gray-50" ref={ref}>
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-16"
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={fadeUp}
        >
          <h2 className="font-heading font-bold text-3xl md:text-4xl mb-6">Find Us</h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            We're conveniently located and easily accessible. Come visit us to see our facilities in person.
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-12 items-center">
          <motion.div 
            className="lg:w-1/2 w-full"
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            variants={fadeUp}
          >
            <div className="bg-white rounded-lg overflow-hidden shadow-md">
              <img 
                src={mapImage} 
                alt="Location Map" 
                className="w-full h-auto object-cover"
                style={{ minHeight: "400px" }}
              />
            </div>
          </motion.div>

          <motion.div 
            className="lg:w-1/2 w-full"
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            variants={fadeRight}
          >
            <div className="bg-white p-8 md:p-10 rounded-xl shadow-sm space-y-8">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-primary bg-opacity-20 rounded-full flex items-center justify-center flex-shrink-0">
                  <MapPin className="text-primary w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-lg mb-2">Address</h3>
                  <p className="text-gray-600">{address}</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 bg-primary bg-opacity-20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Clock className="text-primary w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-lg mb-2">Opening Hours</h3>
                  <p className="text-gray-600">{hoursText}</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 bg-primary bg-opacity-20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Phone className="text-primary w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-lg mb-2">Contact</h3>
                  <p className="text-gray-600">{phoneNumber}</p>
                </div>
              </div>

              <motion.a 
                href="#contact" 
                className="inline-block mt-6 px-8 py-3 bg-primary text-white font-heading font-semibold rounded-full shadow-md hover:shadow-lg transition-all hover:-translate-y-1"
                whileHover={{ y: -5, boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)" }}
                whileTap={{ y: 0 }}
              >
                Schedule a Visit
              </motion.a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}