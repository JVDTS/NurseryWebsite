import { motion } from "framer-motion";
import { Calendar, Clock, MapPin } from "lucide-react";
import { fadeUp } from "@/lib/animations";

interface EventProps {
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
}

interface UpcomingEventsProps {
  events: EventProps[];
  nurseryName: string;
}

export default function UpcomingEvents({ events, nurseryName }: UpcomingEventsProps) {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="max-w-4xl mx-auto"
        >
          <h2 className="text-3xl font-heading font-bold text-center mb-12">
            Upcoming Events at {nurseryName}
          </h2>
          
          <div className="grid gap-8 md:grid-cols-2">
            {events.map((event, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-md overflow-hidden"
              >
                <div className="p-6">
                  <h3 className="font-heading font-bold text-xl mb-3 text-primary">{event.title}</h3>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center">
                      <Calendar className="text-primary w-5 h-5 mr-2" />
                      <span className="text-gray-600">{event.date}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="text-primary w-5 h-5 mr-2" />
                      <span className="text-gray-600">{event.time}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="text-primary w-5 h-5 mr-2" />
                      <span className="text-gray-600">{event.location}</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-4">{event.description}</p>
                  
                  <button className="px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors">
                    Register Interest
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="text-center mt-10">
            <a href="#" className="text-primary font-semibold hover:underline">
              View all events
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}