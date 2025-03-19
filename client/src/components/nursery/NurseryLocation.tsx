import { motion } from "framer-motion";
import { fadeUp, fadeLeft, fadeRight } from "@/lib/animations";
import { MapPin, Clock, Phone, ExternalLink } from "lucide-react";
import { useState } from "react";

interface NurseryLocationProps {
  address: string;
  hoursText: string;
  phoneNumber: string;
  mapImage: string;
}

function getGoogleMapsUrl(address: string): string {
  // Encode the address for use in a URL
  const encodedAddress = encodeURIComponent(address);
  return `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
}

export default function NurseryLocation({ address, hoursText, phoneNumber, mapImage }: NurseryLocationProps) {
  const [isMapHovered, setIsMapHovered] = useState(false);
  const googleMapsUrl = getGoogleMapsUrl(address);
  
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
          className="rounded-xl overflow-hidden shadow-lg relative"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeLeft}
          onMouseEnter={() => setIsMapHovered(true)}
          onMouseLeave={() => setIsMapHovered(false)}
        >
          <a 
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block relative"
            aria-label="Open location in Google Maps"
          >
            <img
              src={mapImage}
              alt="Map of nursery location"
              className="w-full h-80 object-cover transition-all duration-300"
              style={{ 
                filter: isMapHovered ? "brightness(0.8)" : "brightness(1)"
              }}
            />
            
            <div 
              className="absolute inset-0 flex items-center justify-center transition-opacity duration-300"
              style={{ 
                opacity: isMapHovered ? 1 : 0,
                backgroundColor: "rgba(0, 0, 0, 0.2)"
              }}
            >
              <div className="bg-white p-3 rounded-full shadow-lg flex items-center space-x-2">
                <ExternalLink className="w-5 h-5 text-primary" />
                <span className="font-medium text-primary">Open in Google Maps</span>
              </div>
            </div>
          </a>
          
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-white">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4" />
              <p className="text-sm font-medium">{address}</p>
            </div>
          </div>
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
              <a 
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center mt-2 text-primary hover:underline"
              >
                <span className="mr-1">Get directions</span>
                <ExternalLink className="w-3 h-3" />
              </a>
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
              <p className="text-gray-600">
                <a href={`tel:${phoneNumber.replace(/\s+/g, '')}`} className="hover:underline">
                  {phoneNumber}
                </a>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}