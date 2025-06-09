import { useState } from "react";
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
  FormMessage,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { contactFormSchema } from "@shared/schema";
import { Facebook, Instagram } from "lucide-react";

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.6,
      staggerChildren: 0.1,
    }
  }
};

const itemVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6 }
  }
};

export default function ContactSection() {
  const [ref, inView] = useInView({
    triggerOnce: false,
    threshold: 0.1,
  });

  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<typeof contactFormSchema._type>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      nurseryLocation: "general",
      message: ""
    }
  });

  const onSubmit = async (data: typeof contactFormSchema._type) => {
    setIsSubmitting(true);
    console.log("Submitting contact form data:", data);
    
    try {
      // Skip CSRF for contact form temporarily to diagnose issues
      const response = await apiRequest("POST", "/api/contact", data, { 
        on401: "throw",
        skipCsrf: true 
      });
      
      console.log("Contact form response:", response);
      
      if (response.emailSent) {
        toast({
          title: "Message sent!",
          description: "Thank you for your message. We'll get back to you soon!"
        });
      } else {
        toast({
          title: "Message saved",
          description: "Your message has been saved. Our team will review it shortly."
        });
      }
      
      form.reset();
    } catch (error) {
      console.error("Contact form submission error:", error);
      toast({
        title: "Something went wrong",
        description: "Please try again later. See console for details.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-20 bg-slate-50">
      <motion.div 
        className="container mx-auto px-4"
        ref={ref}
        initial="initial"
        animate={inView ? "animate" : "initial"}
        variants={pageVariants}
      >
        <div className="flex flex-col md:flex-row items-center max-w-6xl mx-auto">
          {/* Image Column */}
          <motion.div 
            className="md:w-1/2 relative mb-10 md:mb-0"
            variants={itemVariants}
          >
            <div className="relative z-10">
              <img 
                src="/uploads/child-megaphone-new.png" 
                alt="Child with megaphone" 
                className="max-w-full"
              />
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-md">
              <h3 className="font-heading font-bold text-2xl mb-6 text-rainbow-orange">Opening Hours</h3>
              
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
                  <div className="w-5 h-5 mr-2 text-rainbow-green flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                      <rect width="20" height="16" x="2" y="4" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                  </div>
                  <span className="text-gray-600">admin@cmcnursery.co.uk</span>
                </div>
              </div>
              
              <div className="mt-8">
                <h4 className="font-heading font-semibold text-lg mb-4 text-rainbow-pink">Follow Us</h4>
                <div className="flex space-x-4">
                  <a href="#" className="w-10 h-10 bg-rainbow-blue/10 text-rainbow-blue rounded-full flex items-center justify-center hover:bg-rainbow-blue hover:text-white transition-all">
                    <Facebook size={20} />
                  </a>
                  <a href="https://www.instagram.com/cmcnursery/?hl=en-gb" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-rainbow-pink/10 text-rainbow-pink rounded-full flex items-center justify-center hover:bg-rainbow-pink hover:text-white transition-all">
                    <Instagram size={20} />
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Form Column */}
          <motion.div 
            className="md:w-1/2 md:pl-12"
            variants={itemVariants}
          >
            <div className="text-center md:text-left mb-8">
              <p className="text-pink-500 uppercase font-semibold tracking-wider mb-3">CONTACT US</p>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Join Our Best Fun Classes</h2>
            </div>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input 
                          placeholder="First Name" 
                          {...field} 
                          className="rounded-md border border-gray-300 py-3 px-4"
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
                      <FormControl>
                        <Input 
                          placeholder="Email" 
                          {...field} 
                          className="rounded-md border border-gray-300 py-3 px-4"
                          type="email"
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
                      <FormControl>
                        <Input 
                          placeholder="Phone No." 
                          {...field} 
                          className="rounded-md border border-gray-300 py-3 px-4"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="nurseryLocation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-600 font-medium">Nursery Location</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="rounded-md border border-gray-300 py-3 px-4">
                            <SelectValue placeholder="Select a nursery location" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="hayes">Hayes</SelectItem>
                          <SelectItem value="uxbridge">Uxbridge</SelectItem>
                          <SelectItem value="hounslow">Hounslow</SelectItem>
                          <SelectItem value="general">General Inquiry</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea 
                          placeholder="Write Comments" 
                          {...field} 
                          className="rounded-md border border-gray-300 py-3 px-4 min-h-[100px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-auto px-8 py-3 bg-pink-500 hover:bg-pink-600 text-white font-semibold rounded-full transition-all"
                >
                  {isSubmitting ? "SUBMITTING..." : "SUBMIT NOW"}
                </button>
              </form>
            </Form>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
