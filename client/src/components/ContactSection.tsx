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
  FormLabel,
  FormMessage,
  FormDescription
} from "@/components/ui/form";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
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
  Loader2, 
  CheckCircle, 
  XCircle
} from "lucide-react";
import { contactFormSchema } from "@shared/schema";
import { fadeLeft, fadeRight } from "@/lib/animations";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
    colorClass: "bg-rainbow-red"
  },
  {
    title: "Uxbridge",
    address: "4 New Windsor Street, Uxbridge, UB8 2TU",
    phone: "01895 272885",
    colorClass: "bg-rainbow-blue"
  },
  {
    title: "Hounslow",
    address: "488, 490 Great West Rd, Hounslow TW5 0TA",
    phone: "01895 272885",
    colorClass: "bg-rainbow-green"
  }
];

function Location({ title, address, phone, colorClass }: LocationProps) {
  return (
    <div className="flex">
      <div 
        className={`flex-shrink-0 w-12 h-12 ${colorClass}/20 rounded-full flex items-center justify-center mr-4`}
        aria-hidden="true"
      >
        <MapPin className={`text-2xl ${colorClass.replace('bg-', 'text-')}`} />
      </div>
      <div>
        <h4 className="font-heading font-semibold text-lg" style={{ color: `var(--${colorClass.replace('bg-', '')})` }}>{title}</h4>
        <address className="text-gray-600 not-italic">
          {address}<br/>
          <a 
            href={`tel:${phone.replace(/\s/g, '')}`} 
            className="text-gray-600 hover:text-primary transition-colors"
          >
            {phone}
          </a>
        </address>
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
  const [formStatus, setFormStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [formError, setFormError] = useState<string | null>(null);
  
  const form = useForm<typeof contactFormSchema._type>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      nurseryLocation: undefined,
      message: ""
    },
    mode: "onBlur" // Validate fields when they lose focus
  });

  const onSubmit = async (data: typeof contactFormSchema._type) => {
    try {
      setFormStatus('idle');
      setFormError(null);
      
      const response = await apiRequest("POST", "/api/contact", data);
      
      if (response.emailSent) {
        setFormStatus('success');
        toast({
          title: "Message sent!",
          description: "Your message has been sent. We'll get back to you as soon as possible."
        });
      } else {
        setFormStatus('success');
        toast({
          title: "Message saved",
          description: "Your message has been saved, but there was an issue sending the email notification. Our team will still review your submission."
        });
      }
      
      form.reset();
    } catch (error) {
      console.error("Contact form submission error:", error);
      setFormStatus('error');
      setFormError("There was a problem submitting your message. Please try again later.");
      toast({
        title: "Something went wrong",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
  };

  return (
    <section id="contact" className="py-20 bg-gray-50" aria-labelledby="contact-heading">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <div className="mb-4">
            <span className="inline-block px-4 py-1 bg-rainbow-pink/20 text-rainbow-pink font-heading font-semibold text-sm uppercase rounded-full">Get in Touch</span>
          </div>
          
          <h2 
            id="contact-heading" 
            className="font-heading font-bold text-3xl md:text-4xl mb-6 leading-tight bg-clip-text text-transparent bg-gradient-to-r from-rainbow-red via-rainbow-orange to-rainbow-yellow"
          >
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
              <h3 className="font-heading font-bold text-2xl mb-6 text-rainbow-purple">Send us a message</h3>
              
              {formStatus === 'success' && (
                <Alert className="mb-6 bg-green-50 border-green-200">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <AlertTitle>Thank you!</AlertTitle>
                  <AlertDescription>
                    Your message has been sent successfully. We'll get back to you soon.
                  </AlertDescription>
                </Alert>
              )}
              
              {formStatus === 'error' && (
                <Alert className="mb-6 bg-red-50 border-red-200">
                  <XCircle className="h-5 w-5 text-red-500" />
                  <AlertTitle>Submission Error</AlertTitle>
                  <AlertDescription>
                    {formError || "There was an error submitting your message. Please try again."}
                  </AlertDescription>
                </Alert>
              )}
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-heading font-medium" htmlFor="name">Your Name</FormLabel>
                        <FormControl>
                          <Input 
                            id="name"
                            placeholder="Jane Doe" 
                            {...field} 
                            className="px-4 py-3 focus:ring-primary"
                            aria-required="true"
                            disabled={form.formState.isSubmitting}
                          />
                        </FormControl>
                        <FormMessage aria-live="polite" />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-heading font-medium" htmlFor="email">Email Address</FormLabel>
                        <FormControl>
                          <Input 
                            id="email"
                            type="email"
                            placeholder="jane@example.com" 
                            {...field} 
                            className="px-4 py-3 focus:ring-primary"
                            aria-required="true"
                            disabled={form.formState.isSubmitting}
                          />
                        </FormControl>
                        <FormMessage aria-live="polite" />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-heading font-medium" htmlFor="phone">Phone Number</FormLabel>
                        <FormControl>
                          <Input 
                            id="phone"
                            type="tel"
                            placeholder="(123) 456-7890" 
                            {...field} 
                            className="px-4 py-3 focus:ring-primary"
                            aria-required="false"
                            disabled={form.formState.isSubmitting}
                          />
                        </FormControl>
                        <FormMessage aria-live="polite" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="nurseryLocation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-heading font-medium" id="nursery-location-label">Nursery Location</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={form.formState.isSubmitting}
                        >
                          <FormControl>
                            <SelectTrigger 
                              className="w-full px-4 py-3 focus:ring-primary"
                              aria-labelledby="nursery-location-label"
                              aria-required="true"
                            >
                              <SelectValue placeholder="Select a nursery location" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="hayes">Hayes</SelectItem>
                            <SelectItem value="uxbridge">Uxbridge</SelectItem>
                            <SelectItem value="hounslow">Hounslow</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Please select the nursery location you're interested in
                        </FormDescription>
                        <FormMessage aria-live="polite" />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-heading font-medium" htmlFor="message">Your Message</FormLabel>
                        <FormControl>
                          <Textarea 
                            id="message"
                            placeholder="I'd like to schedule a visit..." 
                            {...field} 
                            className="px-4 py-3 focus:ring-primary"
                            rows={4}
                            aria-required="true"
                            disabled={form.formState.isSubmitting}
                          />
                        </FormControl>
                        <FormMessage aria-live="polite" />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full px-6 py-6 bg-gradient-to-r from-rainbow-orange to-rainbow-pink text-white font-heading font-semibold rounded-lg shadow-md hover:shadow-lg transition-all hover:-translate-y-1 h-auto"
                    disabled={form.formState.isSubmitting}
                    aria-label="Submit contact form"
                  >
                    {form.formState.isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Sending...
                      </>
                    ) : "Send Message"}
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
            <div className="bg-white p-8 rounded-xl shadow-md mb-8" role="region" aria-labelledby="locations-heading">
              <h3 id="locations-heading" className="font-heading font-bold text-2xl mb-6 text-rainbow-blue">Our Locations</h3>
              
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
            
            <div className="bg-white p-8 rounded-xl shadow-md" role="region" aria-labelledby="hours-heading">
              <h3 id="hours-heading" className="font-heading font-bold text-2xl mb-6 text-rainbow-orange">Opening Hours</h3>
              
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
                  <Mail className="w-5 h-5 mr-2 text-rainbow-green" aria-hidden="true" />
                  <a 
                    href="mailto:admin@littleblossomsnursery.co.uk" 
                    className="text-gray-600 hover:text-primary transition-colors"
                  >
                    admin@littleblossomsnursery.co.uk
                  </a>
                </div>
              </div>
              
              <div className="mt-8">
                <h4 id="social-heading" className="font-heading font-semibold text-lg mb-4 text-rainbow-pink">Follow Us</h4>
                <div className="flex space-x-4" aria-labelledby="social-heading">
                  <a 
                    href="https://facebook.com" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="w-10 h-10 bg-rainbow-blue/10 text-rainbow-blue rounded-full flex items-center justify-center hover:bg-rainbow-blue hover:text-white transition-all"
                    aria-label="Follow us on Facebook"
                  >
                    <Facebook size={20} aria-hidden="true" />
                  </a>
                  <a 
                    href="https://instagram.com" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="w-10 h-10 bg-rainbow-pink/10 text-rainbow-pink rounded-full flex items-center justify-center hover:bg-rainbow-pink hover:text-white transition-all"
                    aria-label="Follow us on Instagram"
                  >
                    <Instagram size={20} aria-hidden="true" />
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
