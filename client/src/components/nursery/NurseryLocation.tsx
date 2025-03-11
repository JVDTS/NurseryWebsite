import { motion } from "framer-motion";
import { fadeUp, fadeLeft, fadeRight } from "@/lib/animations";
import { MapPin, Clock, Phone } from "lucide-react";

interface NurseryLocationProps {
  address: string;
  hoursText: string;
  phoneNumber: string;
  mapImage: string;
}

export default function NurseryLocation({ address, hoursText, phoneNumber, mapImage }: NurseryLocationProps) {
  return (
    <section className="py-16 px-4 md:px-10 lg:px-20 max-w-7xl mx-auto">
      <motion.div 
        className="text-center mb-12"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeUp}
      >
        <h2 className="text-3xl font-bold mb-4 text-primary">Find Us</h2>
        <div className="w-20 h-1 bg-primary mx-auto mb-6"></div>
        <p className="text-gray-700 max-w-2xl mx-auto">
          We're conveniently located and easily accessible by public transport.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        <motion.div
          className="rounded-xl overflow-hidden shadow-lg"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeLeft}
        >
          <img
            src={mapImage}
            alt="Map of nursery location"
            className="w-full h-80 object-cover"
          />
        </motion.div>

        <motion.div
          className="space-y-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeRight}
        >
          <div className="flex items-start space-x-4">
            <div className="bg-primary bg-opacity-10 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
              <MapPin className="text-primary w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Address</h3>
              <p className="text-gray-600">{address}</p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="bg-primary bg-opacity-10 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
              <Clock className="text-primary w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Opening Hours</h3>
              <p className="text-gray-600">{hoursText}</p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="bg-primary bg-opacity-10 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
              <Phone className="text-primary w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Phone</h3>
              <p className="text-gray-600">{phoneNumber}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}