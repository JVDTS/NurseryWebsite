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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { contactFormSchema } from "@shared/schema";

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
    resolver: zodResolver(contactFormSchema.omit({ nurseryLocation: true })),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      message: ""
    }
  });

  const onSubmit = async (data: typeof contactFormSchema._type) => {
    setIsSubmitting(true);
    try {
      // Modified to submit without nurseryLocation since it's not in the new design
      const formData = {
        ...data,
        nurseryLocation: "general" // Default value for backend compatibility
      };
      
      const response = await apiRequest("POST", "/api/contact", formData);
      
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
      toast({
        title: "Something went wrong",
        description: "Please try again later.",
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
                src="/uploads/child-with-megaphone-transparent.png" 
                alt="Child with megaphone" 
                className="max-w-full"
              />
            </div>
            
            {/* Decorative Elements */}
            <div className="absolute top-10 left-0 z-0">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 4C17 4 15 6 15 9C15 12 17 14 20 14C23 14 25 12 25 9C25 6 23 4 20 4Z" fill="#FF9EB1"/>
                <path d="M20 4C20 4 19 0 15 0C12 0 10 4 10 7C10 10 15 20 15 20" stroke="#FF9EB1" strokeWidth="2"/>
              </svg>
            </div>
            
            <div className="absolute bottom-10 left-10 z-0">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 5L23.66 14.37L34 15.11L26.5 22.22L28.58 32.5L20 27.13L11.42 32.5L13.5 22.22L6 15.11L16.34 14.37L20 5Z" fill="#FFD79C"/>
              </svg>
            </div>
            
            <div className="absolute top-20 right-0 z-0">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M35 20C35 28.28 28.28 35 20 35C11.72 35 5 28.28 5 20C5 11.72 11.72 5 20 5C28.28 5 35 11.72 35 20Z" stroke="#FF88B8" strokeWidth="2" strokeDasharray="4 4"/>
              </svg>
            </div>
            
            <div className="absolute bottom-20 right-10">
              <img 
                src="/uploads/toy-train.svg" 
                alt="Toy train" 
                className="w-32 h-auto"
              />
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
