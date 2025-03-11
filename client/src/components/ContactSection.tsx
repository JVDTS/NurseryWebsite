import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { 
  MapPin, 
  Phone, 
  Clock, 
  Mail,
  Facebook, 
  Instagram, 
  Twitter, 
  Linkedin 
} from "lucide-react";
import { contactFormSchema } from "@shared/schema";
import { fadeLeft, fadeRight } from "@/lib/animations";

interface LocationProps {
  title: string;
  address: string;
  phone: string;
  colorClass: string;
}

const locations: LocationProps[] = [
  {
    title: "Hayes",
    address: "192 Church Road, Hayes, UB3 2LT",
    phone: "01895 272885",
    colorClass: "bg-primary"
  },
  {
    title: "Uxbridge",
    address: "4 New Windsor Street, Uxbridge, UB8 2TU",
    phone: "01895 272885",
    colorClass: "bg-secondary"
  },
  {
    title: "Hounslow",
    address: "488, 490 Great West Rd, Hounslow TW5 0TA",
    phone: "01895 272885",
    colorClass: "bg-accent"
  }
];

function Location({ title, address, phone, colorClass }: LocationProps) {
  return (
    <div className="flex">
      <div className={`flex-shrink-0 w-12 h-12 ${colorClass} bg-opacity-20 rounded-full flex items-center justify-center mr-4`}>
        <MapPin className={`text-2xl ${colorClass.replace('bg-', 'text-')}`} />
      </div>
      <div>
        <h4 className="font-heading font-semibold text-lg">{title}</h4>
        <p className="text-gray-600">{address}</p>
        <p className="text-gray-600">{phone}</p>
      </div>
    </div>
  );
}

export default function ContactSection() {
  const [formRef, formInView] = useInView({
    triggerOnce: false,
    threshold: 0.1,
  });

  const [locationsRef, locationsInView] = useInView({
    triggerOnce: false,
    threshold: 0.1,
  });

  const { toast } = useToast();
  
  const form = useForm<typeof contactFormSchema._type>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      message: ""
    }
  });

  const onSubmit = async (data: typeof contactFormSchema._type) => {
    try {
      await apiRequest("POST", "/api/contact", data);
      
      toast({
        title: "Message sent!",
        description: "We'll get back to you as soon as possible."
      });
      
      form.reset();
    } catch (error) {
      toast({
        title: "Something went wrong",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
  };

  return (
    <section id="contact" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <div className="mb-4">
            <span className="inline-block px-4 py-1 bg-primary bg-opacity-20 text-primary font-heading font-semibold text-sm uppercase rounded-full">Get in Touch</span>
          </div>
          
          <h2 className="font-heading font-bold text-3xl md:text-4xl mb-6 leading-tight">
            We'd love to hear from you
          </h2>
          
          <p className="text-gray-600 text-lg">
            Schedule a visit, ask questions, or inquire about enrollment - our team is here to help.
          </p>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-12">
          <motion.div 
            className="lg:w-1/2"
            ref={formRef}
            initial="hidden"
            animate={formInView ? "visible" : "hidden"}
            variants={fadeRight}
          >
            <div className="bg-white p-8 rounded-xl shadow-md h-full">
              <h3 className="font-heading font-bold text-2xl mb-6">Send us a message</h3>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-heading font-medium">Your Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Jane Doe" 
                            {...field} 
                            className="px-4 py-3 focus:ring-primary"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-heading font-medium">Email Address</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="jane@example.com" 
                            {...field} 
                            className="px-4 py-3 focus:ring-primary"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-heading font-medium">Phone Number</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="(123) 456-7890" 
                            {...field} 
                            className="px-4 py-3 focus:ring-primary"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-heading font-medium">Your Message</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="I'd like to schedule a visit..." 
                            {...field} 
                            className="px-4 py-3 focus:ring-primary"
                            rows={4}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full px-6 py-6 bg-primary text-white font-heading font-semibold rounded-lg shadow-md hover:shadow-lg transition-all hover:-translate-y-1 h-auto"
                    disabled={form.formState.isSubmitting}
                  >
                    {form.formState.isSubmitting ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              </Form>
            </div>
          </motion.div>
          
          <motion.div 
            className="lg:w-1/2"
            ref={locationsRef}
            initial="hidden"
            animate={locationsInView ? "visible" : "hidden"}
            variants={fadeLeft}
          >
            <div className="bg-white p-8 rounded-xl shadow-md mb-8">
              <h3 className="font-heading font-bold text-2xl mb-6">Our Locations</h3>
              
              <div className="space-y-6">
                {locations.map((location, index) => (
                  <Location
                    key={index}
                    title={location.title}
                    address={location.address}
                    phone={location.phone}
                    colorClass={location.colorClass}
                  />
                ))}
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-md">
              <h3 className="font-heading font-bold text-2xl mb-6">Opening Hours</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="font-heading font-medium">Monday - Friday</span>
                  <span>7:30 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-heading font-medium">Saturday & Sunday</span>
                  <span>Closed</span>
                </div>
                <div className="flex items-center mt-4">
                  <div className="w-5 h-5 mr-2 text-primary flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                      <rect width="20" height="16" x="2" y="4" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                  </div>
                  <span className="text-gray-600">admin@cmcnursery.co.uk</span>
                </div>
              </div>
              
              <div className="mt-8">
                <h4 className="font-heading font-semibold text-lg mb-4">Follow Us</h4>
                <div className="flex space-x-4">
                  <a href="#" className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-all">
                    <Facebook size={20} />
                  </a>
                  <a href="#" className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-all">
                    <Instagram size={20} />
                  </a>
                  <a href="#" className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-all">
                    <Twitter size={20} />
                  </a>
                  <a href="#" className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-all">
                    <Linkedin size={20} />
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
